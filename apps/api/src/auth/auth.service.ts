import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { PlayersService } from '../players/players.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { JwtPayload } from '@tennis-rank/shared'

@Injectable()
export class AuthService {
  constructor(
    private readonly playersService: PlayersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const player = await this.playersService.create(dto)
    const token = this.signToken(player)
    return { accessToken: token, player }
  }

  async login(dto: LoginDto) {
    const player = await this.playersService.findByEmail(dto.email)
    if (!player) throw new UnauthorizedException('Credenciais inválidas')

    const isValid = await bcrypt.compare(dto.password, player.password)
    if (!isValid) throw new UnauthorizedException('Credenciais inválidas')

    const token = this.signToken(player)
    const { password: _pw, ...safePlayer } = player.toObject ? player.toObject() : player
    return { accessToken: token, player: safePlayer }
  }

  private signToken(player: { _id: unknown; email: string; role: string }): string {
    const payload: JwtPayload = {
      sub: String(player._id),
      email: player.email,
      role: player.role as JwtPayload['role'],
    }
    return this.jwtService.sign(payload)
  }
}
