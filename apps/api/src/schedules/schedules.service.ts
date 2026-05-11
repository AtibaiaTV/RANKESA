import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { BOLETAS_REWARDS, ScheduleStatus } from '@rank-app/shared'
import { ScheduledMatch, ScheduledMatchDocument } from './schemas/scheduled-match.schema'
import { CreateScheduleDto } from './dto/create-schedule.dto'
import { UpdateScheduleDto } from './dto/update-schedule.dto'
import { QuerySchedulesDto } from './dto/query-schedules.dto'
import { PlayersService } from '../players/players.service'

const POPULATE_FIELDS = 'name avatar city level gender elo sport'

@Injectable()
export class SchedulesService {
  constructor(
    @InjectModel(ScheduledMatch.name)
    private readonly scheduleModel: Model<ScheduledMatchDocument>,
    private readonly playersService: PlayersService,
  ) {}

  async create(organizerId: string, dto: CreateScheduleDto): Promise<ScheduledMatchDocument> {
    // Organizer can only create schedules for the sport they registered for
    const organizer = await this.playersService.findById(organizerId)
    if (!organizer) throw new NotFoundException('Organizador não encontrado')
    if (organizer.sport !== dto.sport) {
      throw new BadRequestException(
        `Você só pode criar partidas do esporte que se cadastrou (${organizer.sport})`,
      )
    }

    const schedule = new this.scheduleModel({
      ...dto,
      date: new Date(dto.date),
      organizer: new Types.ObjectId(organizerId),
      players: [new Types.ObjectId(organizerId)],
      pendingPlayers: [],
      status: ScheduleStatus.OPEN,
    })
    await schedule.save()

    // Reward boletas for creating a schedule (fire-and-forget)
    this.playersService
      .addBoletas(organizerId, BOLETAS_REWARDS.SCHEDULE_CREATE)
      .catch(() => undefined)

    return schedule
  }

  async findAll(query: QuerySchedulesDto) {
    const { sport, matchType, genderType, status, city, from, playerId, page = 1, limit = 20 } = query
    const filter: Record<string, unknown> = {}

    if (sport) filter.sport = sport
    if (matchType) filter.matchType = matchType
    if (genderType) filter.genderType = genderType
    if (status) filter.status = status
    else filter.status = { $ne: ScheduleStatus.CANCELLED }
    if (city) filter.city = { $regex: city, $options: 'i' }
    if (from) filter.date = { $gte: new Date(from) }
    else if (!playerId) filter.date = { $gte: new Date() }

    // Filter by player: organizer OR approved participant
    if (playerId) {
      const playerObjId = new Types.ObjectId(playerId)
      filter.$or = [{ organizer: playerObjId }, { players: playerObjId }]
    }

    const [data, total] = await Promise.all([
      this.scheduleModel
        .find(filter)
        .populate('organizer', POPULATE_FIELDS)
        .populate('players', POPULATE_FIELDS)
        .sort({ date: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.scheduleModel.countDocuments(filter),
    ])

    return { data, total, page, limit }
  }

  async findById(id: string): Promise<ScheduledMatchDocument> {
    const schedule = await this.scheduleModel
      .findById(id)
      .populate('organizer', POPULATE_FIELDS)
      .populate('players', POPULATE_FIELDS)
      .populate('pendingPlayers', POPULATE_FIELDS)
      .populate('mvpWinner', POPULATE_FIELDS)
      .lean()
    if (!schedule) throw new NotFoundException('Agendamento não encontrado')
    return schedule as ScheduledMatchDocument
  }

  /** Player applies to join (candidacy) — goes to pendingPlayers queue */
  async apply(scheduleId: string, playerId: string): Promise<ScheduledMatchDocument> {
    await this.playersService.checkSuspension(playerId)

    const schedule = await this.scheduleModel.findById(scheduleId)
    if (!schedule) throw new NotFoundException('Agendamento não encontrado')
    if (schedule.status !== ScheduleStatus.OPEN) {
      throw new BadRequestException('Este agendamento não está aberto para candidaturas')
    }

    const playerObjId = new Types.ObjectId(playerId)

    if (schedule.organizer.equals(playerObjId)) {
      throw new BadRequestException('Você é o organizador desta partida')
    }
    if (schedule.players.some((p) => p.equals(playerObjId))) {
      throw new BadRequestException('Você já está confirmado nesta partida')
    }
    if (schedule.pendingPlayers.some((p) => p.equals(playerObjId))) {
      throw new BadRequestException('Você já tem uma candidatura pendente nesta partida')
    }

    schedule.pendingPlayers.push(playerObjId)
    await schedule.save()
    return this.findById(scheduleId)
  }

  /** Player withdraws their pending candidacy */
  async withdraw(scheduleId: string, playerId: string): Promise<ScheduledMatchDocument> {
    const schedule = await this.scheduleModel.findById(scheduleId)
    if (!schedule) throw new NotFoundException('Agendamento não encontrado')
    if (schedule.status === ScheduleStatus.CANCELLED) {
      throw new BadRequestException('Este agendamento foi cancelado')
    }

    const playerObjId = new Types.ObjectId(playerId)
    const isOrganizer = schedule.organizer.equals(playerObjId)
    if (isOrganizer) {
      throw new BadRequestException(
        'O organizador não pode sair. Cancele o agendamento se necessário.',
      )
    }

    const inPending  = schedule.pendingPlayers.some((p) => p.equals(playerObjId))
    const inApproved = schedule.players.some((p) => p.equals(playerObjId))

    if (!inPending && !inApproved) {
      throw new BadRequestException('Você não está neste agendamento')
    }

    if (inPending) {
      schedule.pendingPlayers = schedule.pendingPlayers.filter((p) => !p.equals(playerObjId))
    }
    if (inApproved) {
      schedule.players = schedule.players.filter((p) => !p.equals(playerObjId))
      if (schedule.status === ScheduleStatus.FULL) {
        schedule.status = ScheduleStatus.OPEN
      }
    }

    await schedule.save()
    return this.findById(scheduleId)
  }

  /** Organizer approves a pending candidate */
  async approvePlayer(
    scheduleId: string,
    organizerId: string,
    candidateId: string,
  ): Promise<ScheduledMatchDocument> {
    const schedule = await this.scheduleModel.findById(scheduleId)
    if (!schedule) throw new NotFoundException('Agendamento não encontrado')

    if (!schedule.organizer.equals(new Types.ObjectId(organizerId))) {
      throw new ForbiddenException('Somente o organizador pode aprovar candidatos')
    }
    if (schedule.status === ScheduleStatus.CANCELLED) {
      throw new BadRequestException('Este agendamento foi cancelado')
    }
    if (schedule.status === ScheduleStatus.FULL) {
      throw new BadRequestException('O agendamento já está lotado')
    }

    const candidateObjId = new Types.ObjectId(candidateId)
    const inPending = schedule.pendingPlayers.some((p) => p.equals(candidateObjId))
    if (!inPending) throw new BadRequestException('Candidato não está na fila de espera')

    // Move from pending → approved
    schedule.pendingPlayers = schedule.pendingPlayers.filter((p) => !p.equals(candidateObjId))
    schedule.players.push(candidateObjId)

    if (schedule.players.length >= schedule.maxPlayers) {
      schedule.status = ScheduleStatus.FULL
    }

    await schedule.save()
    return this.findById(scheduleId)
  }

  /** Organizer rejects a pending candidate */
  async rejectPlayer(
    scheduleId: string,
    organizerId: string,
    candidateId: string,
  ): Promise<ScheduledMatchDocument> {
    const schedule = await this.scheduleModel.findById(scheduleId)
    if (!schedule) throw new NotFoundException('Agendamento não encontrado')

    if (!schedule.organizer.equals(new Types.ObjectId(organizerId))) {
      throw new ForbiddenException('Somente o organizador pode rejeitar candidatos')
    }

    const candidateObjId = new Types.ObjectId(candidateId)
    const inPending = schedule.pendingPlayers.some((p) => p.equals(candidateObjId))
    if (!inPending) throw new BadRequestException('Candidato não está na fila de espera')

    schedule.pendingPlayers = schedule.pendingPlayers.filter((p) => !p.equals(candidateObjId))
    await schedule.save()
    return this.findById(scheduleId)
  }

  /** Approved participant votes for the MVP (only valid after match date, 3+ participants) */
  async voteMvp(
    scheduleId: string,
    voterId: string,
    nomineeId: string,
  ): Promise<ScheduledMatchDocument> {
    const schedule = await this.scheduleModel.findById(scheduleId)
    if (!schedule) throw new NotFoundException('Agendamento não encontrado')

    if (schedule.players.length < 3) {
      throw new BadRequestException('Votação de MVP só é válida para partidas com 3 ou mais participantes')
    }

    const matchDate = new Date(schedule.date)
    if (matchDate > new Date()) {
      throw new BadRequestException('Só é possível votar após a data da partida')
    }

    const voterObjId   = new Types.ObjectId(voterId)
    const nomineeObjId = new Types.ObjectId(nomineeId)

    if (!schedule.players.some((p) => p.equals(voterObjId))) {
      throw new ForbiddenException('Somente participantes aprovados podem votar')
    }
    if (!schedule.players.some((p) => p.equals(nomineeObjId))) {
      throw new BadRequestException('O indicado não é um participante aprovado')
    }
    if (voterObjId.equals(nomineeObjId)) {
      throw new BadRequestException('Você não pode votar em si mesmo')
    }
    if (schedule.mvpVotes.some((v) => v.voter.equals(voterObjId))) {
      throw new BadRequestException('Você já votou no MVP desta partida')
    }

    schedule.mvpVotes.push({ voter: voterObjId, nominee: nomineeObjId })

    // Check if everyone eligible has voted (all players except organizer, or all players if desired)
    const eligibleVoters = schedule.players.length
    if (schedule.mvpVotes.length >= eligibleVoters && !schedule.mvpWinner) {
      // Tally votes
      const tally = new Map<string, number>()
      for (const vote of schedule.mvpVotes) {
        const key = String(vote.nominee)
        tally.set(key, (tally.get(key) ?? 0) + 1)
      }
      // Pick the winner (most votes; ties broken by first occurrence)
      let winnerKey = ''
      let maxVotes  = 0
      for (const [key, count] of tally) {
        if (count > maxVotes) {
          maxVotes  = count
          winnerKey = key
        }
      }
      if (winnerKey) {
        schedule.mvpWinner = new Types.ObjectId(winnerKey)
        // Award boletas (fire-and-forget)
        this.playersService
          .addBoletas(winnerKey, BOLETAS_REWARDS.MVP_VOTE)
          .catch(() => undefined)
      }
    }

    await schedule.save()
    return this.findById(scheduleId)
  }

  async cancel(scheduleId: string, requesterId: string): Promise<ScheduledMatchDocument> {
    const schedule = await this.scheduleModel.findById(scheduleId)
    if (!schedule) throw new NotFoundException('Agendamento não encontrado')

    if (!schedule.organizer.equals(new Types.ObjectId(requesterId))) {
      throw new ForbiddenException('Somente o organizador pode cancelar o agendamento')
    }
    if (schedule.status === ScheduleStatus.CANCELLED) {
      throw new BadRequestException('Este agendamento já foi cancelado')
    }

    schedule.status = ScheduleStatus.CANCELLED
    await schedule.save()

    // Penalidade por cancelar agendamento (fire-and-forget)
    this.playersService
      .addBoletas(String(schedule.organizer), BOLETAS_REWARDS.SCHEDULE_CANCEL)
      .catch(() => undefined)

    return schedule
  }

  async update(
    scheduleId: string,
    requesterId: string,
    dto: UpdateScheduleDto,
  ): Promise<ScheduledMatchDocument> {
    const schedule = await this.scheduleModel.findById(scheduleId)
    if (!schedule) throw new NotFoundException('Agendamento não encontrado')

    if (!schedule.organizer.equals(new Types.ObjectId(requesterId))) {
      throw new ForbiddenException('Somente o organizador pode editar o agendamento')
    }
    if (schedule.status === ScheduleStatus.CANCELLED) {
      throw new BadRequestException('Não é possível editar um agendamento cancelado')
    }
    if (schedule.status === ScheduleStatus.COMPLETED) {
      throw new BadRequestException('Não é possível editar um agendamento concluído')
    }

    const updateData: Partial<ScheduledMatch> = {}
    if (dto.title !== undefined)       updateData.title       = dto.title
    if (dto.description !== undefined) updateData.description = dto.description
    if (dto.date !== undefined)        updateData.date        = new Date(dto.date)
    if (dto.time !== undefined)        updateData.time        = dto.time
    if (dto.location !== undefined)    updateData.location    = dto.location
    if (dto.city !== undefined)        updateData.city        = dto.city
    if (dto.sport !== undefined)       updateData.sport       = dto.sport
    if (dto.matchType !== undefined)   updateData.matchType   = dto.matchType
    if (dto.genderType !== undefined)  updateData.genderType  = dto.genderType

    if (dto.costPerPlayer  !== undefined) updateData.costPerPlayer  = dto.costPerPlayer
    if (dto.pixKey         !== undefined) updateData.pixKey         = dto.pixKey
    if (dto.costDescription !== undefined) updateData.costDescription = dto.costDescription

    if (dto.maxPlayers !== undefined) {
      if (dto.maxPlayers < schedule.players.length) {
        throw new BadRequestException(
          `Limite mínimo é ${schedule.players.length} (jogadores já confirmados)`,
        )
      }
      updateData.maxPlayers = dto.maxPlayers
      // Reabre se estava lotado e novo limite é maior
      if (schedule.status === ScheduleStatus.FULL && dto.maxPlayers > schedule.players.length) {
        updateData.status = ScheduleStatus.OPEN
      }
    }

    await this.scheduleModel.findByIdAndUpdate(scheduleId, updateData)
    return this.findById(scheduleId)
  }

  async kickPlayer(
    scheduleId: string,
    requesterId: string,
    targetPlayerId: string,
  ): Promise<ScheduledMatchDocument> {
    const schedule = await this.scheduleModel.findById(scheduleId)
    if (!schedule) throw new NotFoundException('Agendamento não encontrado')

    if (!schedule.organizer.equals(new Types.ObjectId(requesterId))) {
      throw new ForbiddenException('Somente o organizador pode remover jogadores')
    }
    if (schedule.status === ScheduleStatus.CANCELLED) {
      throw new BadRequestException('Este agendamento foi cancelado')
    }

    const targetObjId = new Types.ObjectId(targetPlayerId)
    if (schedule.organizer.equals(targetObjId)) {
      throw new BadRequestException('O organizador não pode ser removido da partida')
    }

    const inApproved = schedule.players.some((p) => p.equals(targetObjId))
    const inPending  = schedule.pendingPlayers.some((p) => p.equals(targetObjId))

    if (!inApproved && !inPending) {
      throw new BadRequestException('Jogador não está neste agendamento')
    }

    if (inApproved) {
      schedule.players = schedule.players.filter((p) => !p.equals(targetObjId))
      if (schedule.status === ScheduleStatus.FULL) {
        schedule.status = ScheduleStatus.OPEN
      }
    }
    if (inPending) {
      schedule.pendingPlayers = schedule.pendingPlayers.filter((p) => !p.equals(targetObjId))
    }

    await schedule.save()
    return this.findById(scheduleId)
  }

  async markResultRegistered(scheduleId: string): Promise<void> {
    await this.scheduleModel.findByIdAndUpdate(scheduleId, {
      resultRegistered: true,
      status: ScheduleStatus.COMPLETED,
    })
  }

  async findExpiredWithoutResult(hoursThreshold: number): Promise<ScheduledMatchDocument[]> {
    const cutoff = new Date()
    cutoff.setHours(cutoff.getHours() - hoursThreshold)

    return this.scheduleModel.find({
      status: { $in: [ScheduleStatus.OPEN, ScheduleStatus.FULL] },
      date: { $lte: cutoff },
      resultRegistered: false,
    })
  }

  async markExpiredCompleted(id: string): Promise<void> {
    await this.scheduleModel.findByIdAndUpdate(id, {
      status: ScheduleStatus.COMPLETED,
    })
  }
}
