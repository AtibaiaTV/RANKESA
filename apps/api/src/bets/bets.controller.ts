import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { BetsService } from './bets.service'
import { PlaceBetDto } from './dto/place-bet.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@ApiTags('Bets')
@Controller('matches/:matchId/bets')
export class BetsController {
  constructor(private readonly betsService: BetsService) {}

  @Get()
  findByMatch(@Param('matchId') matchId: string) {
    return this.betsService.findByMatch(matchId)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  place(
    @Param('matchId') matchId: string,
    @Request() req: { user: { sub: string } },
    @Body() dto: PlaceBetDto,
  ) {
    return this.betsService.place(matchId, req.user.sub, dto)
  }
}
