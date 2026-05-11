import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ReportsService } from './reports.service'
import { CreateReportDto } from './dto/create-report.dto'
import { ResolveReportDto } from './dto/resolve-report.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { ReportStatus, SystemRole } from '@rank-app/shared'

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /** Jogador reporta má conduta de adversário */
  @Post()
  create(
    @Request() req: { user: { sub: string } },
    @Body() dto: CreateReportDto,
  ) {
    return this.reportsService.create(req.user.sub, dto, false)
  }

  /** Admin lista todas as denúncias */
  @UseGuards(RolesGuard)
  @Roles(SystemRole.ADMIN)
  @Get()
  findAll(@Query('status') status?: ReportStatus) {
    return this.reportsService.findAll(status)
  }

  /** Admin resolve (age ou rejeita) uma denúncia */
  @UseGuards(RolesGuard)
  @Roles(SystemRole.ADMIN)
  @Post(':id/resolve')
  resolve(@Param('id') id: string, @Body() dto: ResolveReportDto) {
    return this.reportsService.resolve(id, dto)
  }
}
