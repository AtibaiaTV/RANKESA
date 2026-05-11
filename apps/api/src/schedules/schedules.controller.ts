import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { SchedulesService } from './schedules.service'
import { CreateScheduleDto } from './dto/create-schedule.dto'
import { UpdateScheduleDto } from './dto/update-schedule.dto'
import { QuerySchedulesDto } from './dto/query-schedules.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@ApiTags('Schedules')
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get()
  findAll(@Query() query: QuerySchedulesDto) {
    return this.schedulesService.findAll(query)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.schedulesService.findById(id)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req: { user: { sub: string } }, @Body() dto: CreateScheduleDto) {
    return this.schedulesService.create(req.user.sub, dto)
  }

  /** Organizer edits schedule details */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req: { user: { sub: string } },
    @Body() dto: UpdateScheduleDto,
  ) {
    return this.schedulesService.update(id, req.user.sub, dto)
  }

  /** Player applies to join (candidacy) */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/apply')
  apply(@Param('id') id: string, @Request() req: { user: { sub: string } }) {
    return this.schedulesService.apply(id, req.user.sub)
  }

  /** Player withdraws their candidacy or leaves if already approved */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/withdraw')
  withdraw(@Param('id') id: string, @Request() req: { user: { sub: string } }) {
    return this.schedulesService.withdraw(id, req.user.sub)
  }

  /** Organizer approves a pending candidate */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/approve/:playerId')
  approvePlayer(
    @Param('id') id: string,
    @Param('playerId') playerId: string,
    @Request() req: { user: { sub: string } },
  ) {
    return this.schedulesService.approvePlayer(id, req.user.sub, playerId)
  }

  /** Organizer rejects a pending candidate */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/reject/:playerId')
  rejectPlayer(
    @Param('id') id: string,
    @Param('playerId') playerId: string,
    @Request() req: { user: { sub: string } },
  ) {
    return this.schedulesService.rejectPlayer(id, req.user.sub, playerId)
  }

  /** Approved participant votes for MVP */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/vote-mvp/:nomineeId')
  voteMvp(
    @Param('id') id: string,
    @Param('nomineeId') nomineeId: string,
    @Request() req: { user: { sub: string } },
  ) {
    return this.schedulesService.voteMvp(id, req.user.sub, nomineeId)
  }

  /** Organizer removes a player (approved or pending) from the schedule */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/kick/:playerId')
  kickPlayer(
    @Param('id') id: string,
    @Param('playerId') playerId: string,
    @Request() req: { user: { sub: string } },
  ) {
    return this.schedulesService.kickPlayer(id, req.user.sub, playerId)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  cancel(@Param('id') id: string, @Request() req: { user: { sub: string } }) {
    return this.schedulesService.cancel(id, req.user.sub)
  }
}
