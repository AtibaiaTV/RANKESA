import { BadRequestException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { PlayersService } from '../players/players.service'
import { AsaasService } from '../asaas/asaas.service'
import { MailService } from '../mail/mail.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { ForgotPasswordDto } from './dto/forgot-password.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { JwtPayload } from '@rank-app/shared'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly playersService: PlayersService,
    private readonly jwtService: JwtService,
    private readonly asaasService: AsaasService,
    private readonly mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    // Calcula data de fim do trial (3 meses a partir de hoje)
    const trialEndsAt = new Date()
    trialEndsAt.setMonth(trialEndsAt.getMonth() + 3)

    const player = await this.playersService.create({ ...dto, trialEndsAt })

    // Cria o cliente no Asaas em background (não bloqueia o cadastro)
    this.asaasService.createCustomer({ name: dto.name, email: dto.email })
      .then(async (customer) => {
        if (customer) {
          await this.playersService.update(String(player._id), { asaasCustomerId: customer.id })
          this.logger.log(`Cliente Asaas criado para ${dto.email}: ${customer.id}`)
        }
      })
      .catch((err: unknown) => this.logger.error('Falha ao criar cliente Asaas pós-cadastro', err))

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

  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const player = await this.playersService.findByEmail(dto.email).catch(() => null)
    // Responde sem erro mesmo que o e-mail não exista (evita enumeração de contas)
    if (!player) return

    const resetToken = this.jwtService.sign(
      { sub: String(player._id), email: player.email, purpose: 'reset' },
      { expiresIn: '1h' },
    )

    const appUrl = process.env.APP_URL ?? 'http://localhost:3000'
    const resetLink = `${appUrl}/reset-password?token=${resetToken}`

    await this.mailService.sendPasswordReset(player.email, player.name, resetLink).catch(() => {
      this.logger.warn(`Falha ao enviar e-mail de redefinição para ${player.email}`)
    })
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    let payload: { sub: string; purpose: string }
    try {
      payload = this.jwtService.verify(dto.token)
    } catch {
      throw new BadRequestException('Token inválido ou expirado')
    }

    if (payload.purpose !== 'reset') {
      throw new BadRequestException('Token inválido')
    }

    const player = await this.playersService.findById(payload.sub).catch(() => null)
    if (!player) throw new NotFoundException('Jogador não encontrado')

    const hashed = await bcrypt.hash(dto.newPassword, 10)
    await this.playersService.updatePassword(payload.sub, hashed)
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
