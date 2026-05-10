import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { PlayersService } from './players.service'
import { UpdatePlayerDto } from './dto/update-player.dto'
import { QueryPlayersDto } from './dto/query-players.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@ApiTags('Players')
@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get()
  findAll(@Query() query: QueryPlayersDto) {
    return this.playersService.findAll(query)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.playersService.findById(id)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMe(@Request() req: { user: { sub: string } }, @Body() dto: UpdatePlayerDto) {
    return this.playersService.update(req.user.sub, dto)
  }
}
