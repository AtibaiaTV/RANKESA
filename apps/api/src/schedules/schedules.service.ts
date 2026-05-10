import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { ScheduleStatus } from '@tennis-rank/shared'
import { ScheduledMatch, ScheduledMatchDocument } from './schemas/scheduled-match.schema'
import { CreateScheduleDto } from './dto/create-schedule.dto'
import { QuerySchedulesDto } from './dto/query-schedules.dto'

const POPULATE_FIELDS = 'name avatar city level gender elo'

@Injectable()
export class SchedulesService {
  constructor(
    @InjectModel(ScheduledMatch.name)
    private readonly scheduleModel: Model<ScheduledMatchDocument>,
  ) {}

  async create(organizerId: string, dto: CreateScheduleDto): Promise<ScheduledMatchDocument> {
    const schedule = new this.scheduleModel({
      ...dto,
      date: new Date(dto.date),
      organizer: new Types.ObjectId(organizerId),
      players: [new Types.ObjectId(organizerId)],
      status: ScheduleStatus.OPEN,
    })
    return schedule.save()
  }

  async findAll(query: QuerySchedulesDto) {
    const { sport, matchType, genderType, status, city, from, page = 1, limit = 20 } = query
    const filter: Record<string, unknown> = {}

    if (sport) filter.sport = sport
    if (matchType) filter.matchType = matchType
    if (genderType) filter.genderType = genderType
    if (status) filter.status = status
    else filter.status = { $ne: ScheduleStatus.CANCELLED }
    if (city) filter.city = { $regex: city, $options: 'i' }
    if (from) filter.date = { $gte: new Date(from) }
    else filter.date = { $gte: new Date() }

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
      .lean()
    if (!schedule) throw new NotFoundException('Agendamento não encontrado')
    return schedule as ScheduledMatchDocument
  }

  async join(scheduleId: string, playerId: string): Promise<ScheduledMatchDocument> {
    const schedule = await this.scheduleModel.findById(scheduleId)
    if (!schedule) throw new NotFoundException('Agendamento não encontrado')
    if (schedule.status !== ScheduleStatus.OPEN) {
      throw new BadRequestException('Este agendamento não está aberto para participação')
    }

    const playerObjId = new Types.ObjectId(playerId)
    const alreadyIn = schedule.players.some((p) => p.equals(playerObjId))
    if (alreadyIn) throw new BadRequestException('Você já está nesta partida')

    schedule.players.push(playerObjId)
    if (schedule.players.length >= schedule.maxPlayers) {
      schedule.status = ScheduleStatus.FULL
    }

    await schedule.save()
    return this.findById(scheduleId)
  }

  async leave(scheduleId: string, playerId: string): Promise<ScheduledMatchDocument> {
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

    schedule.players = schedule.players.filter((p) => !p.equals(playerObjId))
    if (schedule.status === ScheduleStatus.FULL) {
      schedule.status = ScheduleStatus.OPEN
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
    return schedule
  }
}
