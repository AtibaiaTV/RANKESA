import { Controller, Get, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { PlayersService } from '../players/players.service'
import { QueryPlayersDto } from '../players/dto/query-players.dto'

@ApiTags('Rankings')
@Controller('rankings')
export class RankingsController {
  constructor(private readonly playersService: PlayersService) {}

  @Get()
  getRanking(@Query() query: QueryPlayersDto) {
    return this.playersService.findAll(query)
  }
}
