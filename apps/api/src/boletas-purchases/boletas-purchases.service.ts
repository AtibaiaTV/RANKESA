import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { BOLETAS_PACKAGES, BoletasPurchaseStatus } from '@rank-app/shared'
import { BoletasPurchase, BoletasPurchaseDocument } from './schemas/boletas-purchase.schema'
import { CreatePurchaseDto } from './dto/create-purchase.dto'
import { ResolvePurchaseDto } from './dto/resolve-purchase.dto'
import { PlayersService } from '../players/players.service'

@Injectable()
export class BoletasPurchasesService {
  constructor(
    @InjectModel(BoletasPurchase.name)
    private readonly purchaseModel: Model<BoletasPurchaseDocument>,
    private readonly playersService: PlayersService,
  ) {}

  /** Player requests a purchase — status starts as PENDING */
  async create(playerId: string, dto: CreatePurchaseDto): Promise<BoletasPurchaseDocument> {
    const pkg = BOLETAS_PACKAGES[dto.package]
    if (!pkg) throw new BadRequestException('Pacote inválido')

    // Limit: no more than 3 pending requests per player
    const pending = await this.purchaseModel.countDocuments({
      player: new Types.ObjectId(playerId),
      status: BoletasPurchaseStatus.PENDING,
    })
    if (pending >= 3) {
      throw new BadRequestException(
        'Você já tem 3 solicitações pendentes. Aguarde a aprovação antes de solicitar novamente.',
      )
    }

    const purchase = new this.purchaseModel({
      player:         new Types.ObjectId(playerId),
      package:        dto.package,
      boletas:        pkg.boletas,
      price:          pkg.price,
      status:         BoletasPurchaseStatus.PENDING,
      transactionRef: dto.transactionRef,
    })
    return purchase.save()
  }

  /** Player sees their own purchase history */
  async findMine(playerId: string): Promise<BoletasPurchaseDocument[]> {
    return this.purchaseModel
      .find({ player: new Types.ObjectId(playerId) })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean() as unknown as BoletasPurchaseDocument[]
  }

  /** Admin lists purchases filtered by status */
  async findAll(status?: BoletasPurchaseStatus): Promise<BoletasPurchaseDocument[]> {
    const filter = status ? { status } : {}
    return this.purchaseModel
      .find(filter)
      .populate('player', 'name email city')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean() as unknown as BoletasPurchaseDocument[]
  }

  /** Admin approves or rejects a purchase */
  async resolve(
    purchaseId: string,
    dto: ResolvePurchaseDto,
  ): Promise<BoletasPurchaseDocument> {
    const purchase = await this.purchaseModel.findById(purchaseId)
    if (!purchase) throw new NotFoundException('Solicitação não encontrada')
    if (purchase.status !== BoletasPurchaseStatus.PENDING) {
      throw new BadRequestException('Esta solicitação já foi resolvida')
    }

    purchase.status = dto.status
    if (dto.adminNotes) purchase.adminNotes = dto.adminNotes

    if (dto.status === BoletasPurchaseStatus.APPROVED) {
      // Credit boletas to the player (fire-and-forget)
      this.playersService
        .addBoletas(String(purchase.player), purchase.boletas)
        .catch(() => undefined)
    }

    return purchase.save()
  }

  /** Player can cancel their own PENDING request */
  async cancel(purchaseId: string, playerId: string): Promise<void> {
    const purchase = await this.purchaseModel.findById(purchaseId)
    if (!purchase) throw new NotFoundException('Solicitação não encontrada')
    if (!purchase.player.equals(new Types.ObjectId(playerId))) {
      throw new ForbiddenException('Você não pode cancelar esta solicitação')
    }
    if (purchase.status !== BoletasPurchaseStatus.PENDING) {
      throw new BadRequestException('Somente solicitações pendentes podem ser canceladas')
    }
    await this.purchaseModel.findByIdAndDelete(purchaseId)
  }
}
