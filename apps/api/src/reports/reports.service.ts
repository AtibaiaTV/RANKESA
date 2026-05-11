import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { ReportCategory, ReportStatus } from '@rank-app/shared'
import { Report, ReportDocument } from './schemas/report.schema'
import { CreateReportDto } from './dto/create-report.dto'
import { ResolveReportDto } from './dto/resolve-report.dto'
import { PlayersService } from '../players/players.service'

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Report.name) private readonly reportModel: Model<ReportDocument>,
    private readonly playersService: PlayersService,
  ) {}

  /**
   * Criado automaticamente quando admin corrige resultado (fraude de resultado)
   * ou manualmente pelo jogador (má conduta)
   */
  async create(
    reporterId: string,
    dto: CreateReportDto,
    autoSuspend = false,
  ): Promise<ReportDocument> {
    let offenseNumber = 1
    let suspensionDays: number | undefined
    let flaggedForBan = false

    if (autoSuspend) {
      const result = await this.playersService.applySuspension(dto.reportedPlayerId)
      offenseNumber = result.offenseNumber
      suspensionDays = result.days
      flaggedForBan = result.flaggedForBan
    }

    const report = new this.reportModel({
      reporter: new Types.ObjectId(reporterId),
      reportedPlayer: new Types.ObjectId(dto.reportedPlayerId),
      ...(dto.matchId && { matchRef: new Types.ObjectId(dto.matchId) }),
      category: dto.category,
      reason: dto.reason,
      status: autoSuspend ? ReportStatus.ACTED : ReportStatus.PENDING,
      offenseNumber,
      suspensionDays,
    })

    const saved = await report.save()

    // Boletas: penalidade automática apenas em caso de fraude confirmada pelo admin
    if (autoSuspend && dto.category === ReportCategory.FAKE_RESULT) {
      await this.playersService
        .addBoletas(dto.reportedPlayerId, -50)
        .catch(() => undefined)
    }

    return saved
  }

  async findAll(status?: ReportStatus) {
    const filter = status ? { status } : {}
    return this.reportModel
      .find(filter)
      .populate('reporter reportedPlayer', 'name email city elo suspensionCount flaggedForBan')
      .populate('matchRef', 'score date sport')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()
  }

  async resolve(reportId: string, dto: ResolveReportDto): Promise<ReportDocument> {
    const report = await this.reportModel.findById(reportId)
    if (!report) throw new NotFoundException('Denúncia não encontrada')

    report.status = dto.status
    if (dto.adminNotes) report.adminNotes = dto.adminNotes

    // Admin decidiu agir: aplica suspensão progressiva
    if (dto.status === ReportStatus.ACTED && !report.suspensionDays) {
      const result = await this.playersService.applySuspension(String(report.reportedPlayer))
      report.offenseNumber = result.offenseNumber
      report.suspensionDays = result.days
      await this.playersService
        .addBoletas(String(report.reportedPlayer), -50)
        .catch(() => undefined)
    }

    await report.save()
    return report
  }
}
