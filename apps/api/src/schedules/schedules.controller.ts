import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { SchedulesService } from './schedules.service'
import { CreateScheduleDto } from './dto/create-schedule.dto'
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

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/join')
  join(@Param('id') id: string, @Request() req: { user: { sub: string } }) {
    return this.schedulesService.join(id, req.user.sub)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/leave')
  leave(@Param('id') id: string, @Request() req: { user: { sub: string } }) {
    return this.schedulesService.leave(id, req.user.sub)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  cancel(@Param('id') id: string, @Request() req: { user: { sub: string } }) {
    return this.schedulesService.cancel(id, req.user.sub)
  }
}
