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
import { MatchesService } from './matches.service'
import { CreateMatchDto } from './dto/create-match.dto'
import { DisputeMatchDto } from './dto/dispute-match.dto'
import { ResolveDisputeDto } from './dto/resolve-dispute.dto'
import { QueryMatchesDto } from './dto/query-matches.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { SystemRole } from '@rank-app/shared'

@ApiTags('Matches')
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  findAll(@Query() query: QueryMatchesDto) {
    return this.matchesService.findAll(query)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.matchesService.findById(id)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Request() req: { user: { sub: string } },
    @Body() dto: CreateMatchDto,
  ) {
    return this.matchesService.create(req.user.sub, dto)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/confirm')
  confirm(@Param('id') id: string, @Request() req: { user: { sub: string } }) {
    return this.matchesService.confirm(id, req.user.sub)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/dispute')
  dispute(
    @Param('id') id: string,
    @Request() req: { user: { sub: string } },
    @Body() dto: DisputeMatchDto,
  ) {
    return this.matchesService.dispute(id, req.user.sub, dto)
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.ADMIN)
  @Post(':id/admin-resolve')
  adminResolve(@Param('id') id: string, @Body() dto: ResolveDisputeDto) {
    return this.matchesService.adminResolve(id, dto)
  }
}
