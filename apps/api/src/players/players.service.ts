import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
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

  async create(dto: CreatePlayerDto & { trialEndsAt?: Date }): Promise<PlayerDocument> {
    const existing = await this.playerModel.findOne({ email: dto.email }).lean()
    if (existing) throw new ConflictException('E-mail já cadastrado')

    const password = await bcrypt.hash(dto.password, 12)
    const player = new this.playerModel({ ...dto, password })
    return player.save()
  }

  async findAll(query: QueryPlayersDto) {
    const {
      sport,
      city,
      venue,
      region,
      state,
      country,
      level,
      gender,
      minAge,
      maxAge,
      page = 1,
      limit = 20,
    } = query

    const filter: Record<string, unknown> = {}

    if (sport) filter.sport = sport
    if (city) filter.city = { $regex: city, $options: 'i' }
    if (venue) filter.venue = { $regex: venue, $options: 'i' }
    if (region) filter.region = { $regex: region, $options: 'i' }
    if (state) filter.state = { $regex: state, $options: 'i' }
    if (country) filter.country = { $regex: country, $options: 'i' }
    if (level) filter.level = level
    if (gender) filter.gender = gender

    if (minAge !== undefined || maxAge !== undefined) {
      const now = new Date()
      const birthDateFilter: Record<string, Date> = {}
      if (minAge !== undefined) {
        const maxBirth = new Date(now)
        maxBirth.setFullYear(now.getFullYear() - minAge)
        birthDateFilter.$lte = maxBirth
      }
      if (maxAge !== undefined) {
        const minBirth = new Date(now)
        minBirth.setFullYear(now.getFullYear() - maxAge - 1)
        birthDateFilter.$gt = minBirth
      }
      filter.birthDate = birthDateFilter
    }

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
    return this.playerModel.findOne({ email: email.toLowerCase() }).select('+password') as Promise<PlayerDocument | null>
  }

  async update(id: string, dto: UpdatePlayerDto): Promise<PlayerDocument> {
    const player = await this.playerModel
      .findByIdAndUpdate(id, dto, { new: true })
      .lean()
    if (!player) throw new NotFoundException('Jogador não encontrado')
    return player as PlayerDocument
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await this.playerModel.findByIdAndUpdate(id, { password: hashedPassword })
  }

  async addBoletas(playerId: string, amount: number): Promise<void> {
    if (amount < 0) {
      // Nunca deixar boletas negativas
      await this.playerModel.findByIdAndUpdate(playerId, {
        $inc: { boletas: amount },
      })
      await this.playerModel.findByIdAndUpdate(playerId, {
        boletas: { $max: ['$boletas', 0] },
      })
    } else {
      await this.playerModel.findByIdAndUpdate(playerId, {
        $inc: { boletas: amount },
      })
    }
  }

  async applySuspension(playerId: string): Promise<{ offenseNumber: number; days: number; flaggedForBan: boolean }> {
    const player = await this.playerModel.findById(playerId)
    if (!player) throw new Error('Jogador não encontrado')

    const newCount = (player.suspensionCount ?? 0) + 1
    const days = newCount === 1 ? 7 : newCount === 2 ? 14 : 30
    const flaggedForBan = newCount >= 3

    const suspendedUntil = new Date()
    suspendedUntil.setDate(suspendedUntil.getDate() + days)

    await this.playerModel.findByIdAndUpdate(playerId, {
      suspensionCount: newCount,
      suspendedUntil,
      flaggedForBan,
    })

    return { offenseNumber: newCount, days, flaggedForBan }
  }

  async checkSuspension(playerId: string): Promise<void> {
    const player = await this.playerModel.findById(playerId).lean()
    if (!player) return
    if (player.suspendedUntil && new Date(player.suspendedUntil) > new Date()) {
      const until = new Date(player.suspendedUntil).toLocaleDateString('pt-BR')
      throw new ForbiddenException(`Conta suspensa até ${until} por violação das regras de fair play`)
    }
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
