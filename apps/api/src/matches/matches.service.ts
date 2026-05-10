import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { calculateElo, MatchStatus } from '@tennis-rank/shared'
import { Match, MatchDocument } from './schemas/match.schema'
import { CreateMatchDto } from './dto/create-match.dto'
import { DisputeMatchDto } from './dto/dispute-match.dto'
import { ResolveDisputeDto } from './dto/resolve-dispute.dto'
import { QueryMatchesDto } from './dto/query-matches.dto'
import { PlayersService } from '../players/players.service'
import { MailService } from '../mail/mail.service'

@Injectable()
export class MatchesService {
  constructor(
    @InjectModel(Match.name) private readonly matchModel: Model<MatchDocument>,
    private readonly playersService: PlayersService,
    private readonly mailService: MailService,
  ) {}

  async create(registeredById: string, dto: CreateMatchDto): Promise<MatchDocument> {
    const [registeredBy, opponent] = await Promise.all([
      this.playersService.findById(registeredById),
      this.playersService.findById(dto.opponentId),
    ])

    const player1Id = new Types.ObjectId(registeredById)
    const player2Id = new Types.ObjectId(dto.opponentId)
    const winnerId = new Types.ObjectId(dto.winnerId)

    if (!winnerId.equals(player1Id) && !winnerId.equals(player2Id)) {
      throw new BadRequestException('O vencedor deve ser um dos jogadores da partida')
    }

    const match = new this.matchModel({
      player1: player1Id,
      player2: player2Id,
      winner: winnerId,
      score: dto.score,
      date: new Date(dto.date),
      registeredBy: player1Id,
      status: MatchStatus.PENDING_REVIEW,
      eloApplied: false,
    })

    const saved = await match.save()

    // Notifica o adversário por email (fire-and-forget)
    this.mailService
      .sendMatchReviewRequest(
        opponent.email,
        opponent.name,
        registeredBy.name,
        dto.score,
        String(saved._id),
      )
      .catch(() => undefined)

    return saved
  }

  async findAll(query: QueryMatchesDto) {
    const { playerId, status, page = 1, limit = 20 } = query
    const filter: Record<string, unknown> = {}

    if (playerId) {
      const id = new Types.ObjectId(playerId)
      filter.$or = [{ player1: id }, { player2: id }]
    }
    if (status) filter.status = status

    const [data, total] = await Promise.all([
      this.matchModel
        .find(filter)
        .populate('player1 player2 winner registeredBy', 'name email elo city level avatar')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.matchModel.countDocuments(filter),
    ])

    return { data, total, page, limit }
  }

  async findById(id: string): Promise<MatchDocument> {
    const match = await this.matchModel
      .findById(id)
      .populate('player1 player2 winner registeredBy disputedBy', 'name email elo city level avatar')
      .lean()
    if (!match) throw new NotFoundException('Partida não encontrada')
    return match as MatchDocument
  }

  async confirm(matchId: string, requesterId: string): Promise<MatchDocument> {
    const match = await this.matchModel.findById(matchId)
    if (!match) throw new NotFoundException('Partida não encontrada')
    if (match.status !== MatchStatus.PENDING_REVIEW) {
      throw new BadRequestException('Esta partida não está aguardando confirmação')
    }
    if (match.registeredBy.equals(new Types.ObjectId(requesterId))) {
      throw new ForbiddenException('Você não pode confirmar uma partida que você mesmo registrou')
    }

    match.status = MatchStatus.CONFIRMED
    match.confirmedAt = new Date()
    await match.save()

    await this.applyElo(match)
    return match
  }

  async dispute(matchId: string, requesterId: string, dto: DisputeMatchDto): Promise<MatchDocument> {
    const match = await this.matchModel.findById(matchId)
    if (!match) throw new NotFoundException('Partida não encontrada')
    if (match.status !== MatchStatus.PENDING_REVIEW) {
      throw new BadRequestException('Esta partida não pode mais ser disputada')
    }
    if (match.registeredBy.equals(new Types.ObjectId(requesterId))) {
      throw new ForbiddenException('Você não pode disputar uma partida que você mesmo registrou')
    }

    match.status = MatchStatus.DISPUTED
    match.disputedBy = new Types.ObjectId(requesterId)
    match.disputeReason = dto.reason
    await match.save()

    return match
  }

  async adminResolve(matchId: string, dto: ResolveDisputeDto): Promise<MatchDocument> {
    const match = await this.matchModel.findById(matchId)
    if (!match) throw new NotFoundException('Partida não encontrada')
    if (match.status !== MatchStatus.DISPUTED) {
      throw new BadRequestException('Esta partida não está em disputa')
    }

    const winnerId = new Types.ObjectId(dto.winnerId)
    if (!winnerId.equals(match.player1) && !winnerId.equals(match.player2)) {
      throw new BadRequestException('O vencedor deve ser um dos jogadores da partida')
    }

    match.winner = winnerId
    match.status = MatchStatus.CONFIRMED
    match.confirmedAt = new Date()
    await match.save()

    await this.applyElo(match)
    return match
  }

  async autoConfirmExpired(hoursThreshold: number): Promise<number> {
    const cutoff = new Date()
    cutoff.setHours(cutoff.getHours() - hoursThreshold)

    const expired = await this.matchModel.find({
      status: MatchStatus.PENDING_REVIEW,
      createdAt: { $lte: cutoff },
      eloApplied: false,
    })

    for (const match of expired) {
      match.status = MatchStatus.CONFIRMED
      match.confirmedAt = new Date()
      await match.save()
      await this.applyElo(match)
    }

    return expired.length
  }

  private async applyElo(match: MatchDocument): Promise<void> {
    if (match.eloApplied) return

    const loserId = match.winner.equals(match.player1) ? match.player2 : match.player1

    const [winner, loser] = await Promise.all([
      this.playersService.findById(String(match.winner)),
      this.playersService.findById(String(loserId)),
    ])

    const { newWinnerElo, newLoserElo } = calculateElo(winner.elo, loser.elo)

    await this.playersService.updateElo(
      String(match.winner),
      String(loserId),
      newWinnerElo,
      newLoserElo,
    )

    match.eloApplied = true
    await match.save()
  }
}
