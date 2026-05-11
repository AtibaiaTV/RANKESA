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
import { AuthGuard } from '@nestjs/passport'
import { BoletasPurchasesService } from './boletas-purchases.service'
import { CreatePurchaseDto } from './dto/create-purchase.dto'
import { ResolvePurchaseDto } from './dto/resolve-purchase.dto'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { SystemRole, BoletasPurchaseStatus } from '@rank-app/shared'

@ApiTags('Boletas Purchases')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('boletas-purchases')
export class BoletasPurchasesController {
  constructor(private readonly service: BoletasPurchasesService) {}

  /** Player creates a purchase request */
  @Post()
  create(
    @Request() req: { user: { sub: string } },
    @Body() dto: CreatePurchaseDto,
  ) {
    return this.service.create(req.user.sub, dto)
  }

  /** Player views their own history */
  @Get('mine')
  findMine(@Request() req: { user: { sub: string } }) {
    return this.service.findMine(req.user.sub)
  }

  /** Player cancels their own pending request */
  @Delete(':id')
  cancel(
    @Request() req: { user: { sub: string } },
    @Param('id') id: string,
  ) {
    return this.service.cancel(id, req.user.sub)
  }

  /** Admin: list all purchases (optionally filtered by status) */
  @Get()
  @UseGuards(RolesGuard)
  @Roles(SystemRole.ADMIN)
  findAll(@Query('status') status?: BoletasPurchaseStatus) {
    return this.service.findAll(status)
  }

  /** Admin: approve or reject a purchase */
  @Patch(':id/resolve')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.ADMIN)
  resolve(
    @Param('id') id: string,
    @Body() dto: ResolvePurchaseDto,
  ) {
    return this.service.resolve(id, dto)
  }
}
