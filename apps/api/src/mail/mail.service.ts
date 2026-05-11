import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as nodemailer from 'nodemailer'

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: config.get('SMTP_HOST'),
      port: config.get<number>('SMTP_PORT', 587),
      auth: {
        user: config.get('SMTP_USER'),
        pass: config.get('SMTP_PASS'),
      },
    })
  }

  async sendPasswordReset(toEmail: string, toName: string, resetLink: string) {
    await this.transporter.sendMail({
      from: this.config.get('SMTP_FROM', 'noreply@rank.app'),
      to: toEmail,
      subject: 'Redefinição de senha — RANK',
      html: `
        <h2>Redefinir senha</h2>
        <p>Olá ${toName},</p>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
        <p>Clique no botão abaixo para criar uma nova senha. O link é válido por <strong>1 hora</strong>.</p>
        <a href="${resetLink}" style="background:#4f46e5;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;margin-top:16px">
          Redefinir senha
        </a>
        <p style="margin-top:24px;color:#888;font-size:12px">
          Se você não solicitou isso, ignore este e-mail. Sua senha permanece a mesma.
        </p>
      `,
    })
  }

  async sendMatchReviewRequest(
    toEmail: string,
    toName: string,
    opponentName: string,
    score: string,
    matchId: string,
  ) {
    const appUrl = this.config.get('APP_URL', 'http://localhost:3000')
    await this.transporter.sendMail({
      from: this.config.get('SMTP_FROM', 'noreply@rank.app'),
      to: toEmail,
      subject: `${opponentName} registrou uma partida contra você`,
      html: `
        <h2>Resultado registrado</h2>
        <p>Olá ${toName},</p>
        <p><strong>${opponentName}</strong> registrou um resultado de partida contra você.</p>
        <p>Placar: <strong>${score}</strong></p>
        <p>Você tem 48 horas para confirmar ou disputar o resultado.</p>
        <a href="${appUrl}/matches/${matchId}" style="background:#16a34a;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;margin-top:16px">
          Ver partida
        </a>
      `,
    })
  }
}
