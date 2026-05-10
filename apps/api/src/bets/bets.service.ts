import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { BetStatus, MatchStatus } from '@rank-app/shared'
import { Bet, BetDocument } from './schemas/bet.schema'
import { PlaceBetDto } from './dto/place-bet.dto'
import { Match, MatchDocument } from '../matches/schemas/match.schema'
import { Player, PlayerDocument } from '../players/schemas/player.schema'

@Injectable()
export class BetsService {
  constructor(
    @InjectModel(Bet.name) private readonly betModel: Model<BetDocument>,
    @InjectModel(Match.name) private readonly matchModel: Model<MatchDocument>,
    @InjectModel(Player.name) private readonly playerModel: Model<PlayerDocument>,
  ) {}

  async place(matchId: string, bettorId: string, dto: PlaceBetDto): Promise<BetDocument> {
    const match = await this.matchModel.findById(matchId)
    if (!match) throw new NotFoundException('Partida não encontrada')
    if (match.status !== MatchStatus.PENDING_REVIEW) {
      throw new BadRequestException('Só é possível apostar em partidas aguardando confirmação')
    }

    const predictedWinnerId = new Types.ObjectId(dto.predictedWinnerId)
    if (!predictedWinnerId.equals(match.player1) && !predictedWinnerId.equals(match.player2)) {
      throw new BadRequestException('O vencedor previsto deve ser um dos jogadores da partida')
    }

    const existing = await this.betModel.findOne({
      match: new Types.ObjectId(matchId),
      bettor: new Types.ObjectId(bettorId),
    })
    if (existing) throw new BadRequestException('Você já apostou nessa partida')

    const bettor = await this.playerModel.findById(bettorId)
    if (!bettor) throw new NotFoundException('Jogador não encontrado')
    if (bettor.boletas < dto.amount) {
      throw new BadRequestException(
        `Saldo insuficiente. Você tem ${bettor.boletas} boletas`,
      )
    }

    bettor.boletas -= dto.amount
    await bettor.save()

    const bet = new this.betModel({
      match: new Types.ObjectId(matchId),
      bettor: new Types.ObjectId(bettorId),
      predictedWinner: predictedWinnerId,
      amount: dto.amount,
      status: BetStatus.PENDING,
    })

    return bet.save()
  }

  async findByMatch(matchId: string): Promise<BetDocument[]> {
    return this.betModel
      .find({ match: new Types.ObjectId(matchId) })
      .populate('bettor', 'name avatar')
      .populate('predictedWinner', 'name')
      .lean() as Promise<BetDocument[]>
  }

  async findByPlayer(playerId: string): Promise<BetDocument[]> {
    return this.betModel
      .find({ bettor: new Types.ObjectId(playerId) })
      .populate('match', 'sport score date status')
      .populate('predictedWinner', 'name')
      .sort({ createdAt: -1 })
      .lean() as Promise<BetDocument[]>
  }

  async resolveForMatch(matchId: string, winnerId: Types.ObjectId): Promise<void> {
    const bets = await this.betModel.find({
      match: new Types.ObjectId(matchId),
      status: BetStatus.PENDING,
    })

    for (const bet of bets) {
      const won = bet.predictedWinner.equals(winnerId)
      bet.status = won ? BetStatus.WON : BetStatus.LOST

      if (won) {
        // Devolve o dobro: valor apostado + mesmo valor de prêmio
        await this.playerModel.findByIdAndUpdate(bet.bettor, {
          $inc: { boletas: bet.amount * 2 },
        })
      }

      await bet.save()
    }
  }

  async cancelForMatch(matchId: string): Promise<void> {
    const bets = await this.betModel.find({
      match: new Types.ObjectId(matchId),
      status: BetStatus.PENDING,
    })

    for (const bet of bets) {
      bet.status = BetStatus.CANCELLED
      await this.playerModel.findByIdAndUpdate(bet.bettor, {
        $inc: { boletas: bet.amount },
      })
      await bet.save()
    }
  }
}
