import { Controller, Get, Request, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { BetsService } from './bets.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@ApiTags('Bets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bets/me')
export class MyBetsController {
  constructor(private readonly betsService: BetsService) {}

  @Get()
  myBets(@Request() req: { user: { sub: string } }) {
    return this.betsService.findByPlayer(req.user.sub)
  }
}
