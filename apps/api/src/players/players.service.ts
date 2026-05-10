import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import * as bcrypt from 'bcrypt'
import { Player, PlayerDocument } from './schemas/player.schema'
import { CreatePlayerDto } from './dto/create-player.dto'
import { UpdatePlayerDto } from './dto/update-player.dto'
import { QueryPlayersDto } from './dto/query-players.dto'

@Injectable()
export class PlayersService {
  constructor(@InjectModel(Player.name) private readonly playerModel: Model<PlayerDocument>) {}

  async create(dto: CreatePlayerDto): Promise<PlayerDocument> {
    const existing = await this.playerModel.findOne({ email: dto.email }).lean()
    if (existing) throw new ConflictException('E-mail já cadastrado')

    const password = await bcrypt.hash(dto.password, 12)
    const player = new this.playerModel({ ...dto, password })
    return player.save()
  }

  async findAll(query: QueryPlayersDto) {
    const { city, level, page = 1, limit = 20 } = query
    const filter: Record<string, unknown> = {}
    if (city) filter.city = { $regex: city, $options: 'i' }
    if (level) filter.level = level

    const [data, total] = await Promise.all([
      this.playerModel
        .find(filter)
        .sort({ elo: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.playerModel.countDocuments(filter),
    ])

    return { data, total, page, limit }
  }

  async findById(id: string): Promise<PlayerDocument> {
    const player = await this.playerModel.findById(id).lean()
    if (!player) throw new NotFoundException('Jogador não encontrado')
    return player as PlayerDocument
  }

  async findByEmail(email: string): Promise<PlayerDocument | null> {
    return this.playerModel.findOne({ email: email.toLowerCase() }).select('+password').lean()
  }

  async update(id: string, dto: UpdatePlayerDto): Promise<PlayerDocument> {
    const player = await this.playerModel
      .findByIdAndUpdate(id, dto, { new: true })
      .lean()
    if (!player) throw new NotFoundException('Jogador não encontrado')
    return player as PlayerDocument
  }

  async updateElo(
    winnerId: string,
    loserId: string,
    newWinnerElo: number,
    newLoserElo: number,
  ): Promise<void> {
    await Promise.all([
      this.playerModel.findByIdAndUpdate(winnerId, {
        elo: newWinnerElo,
        $inc: { wins: 1, matchesPlayed: 1 },
      }),
      this.playerModel.findByIdAndUpdate(loserId, {
        elo: newLoserElo,
        $inc: { losses: 1, matchesPlayed: 1 },
      }),
    ])
  }
}
