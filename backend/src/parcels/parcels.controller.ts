import { Controller, Post, Body, Get, Patch, Param, Delete, ParseUUIDPipe, Request, Query } from '@nestjs/common';
import { ParcelsService } from './parcels.service';
import { CreateParcelDto } from './dto/create-parcel.dto';
import { UpdateParcelStatusDto } from './dto/update-parcel-status.dto';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { Roles } from '../common/decorators/roles/roles.decorator';
// import { Role } from 'generated/prisma';

@Controller('parcels')
export class ParcelsController {
  constructor(private readonly parcelsService: ParcelsService) {}

  // @UseGuards(JwtAuthGuard)
  // @Roles(Role.ADMIN)
  @Post()
  async create(@Body() createParcelDto: CreateParcelDto, @Request() req) {
    // req.user.id is the admin creating the parcel
    return this.parcelsService.create(createParcelDto, req.user.id);
  }

  // @UseGuards(JwtAuthGuard)
  @Get('sent')
  async getSentParcels(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string
  ) {
    return this.parcelsService.getSentParcels(req.user.id, { page, limit, search });
  }

  // @UseGuards(JwtAuthGuard)
  @Get('received')
  async getReceivedParcels(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string
  ) {
    return this.parcelsService.getReceivedParcels(req.user.id, { page, limit, search });
  }

  // @UseGuards(JwtAuthGuard)
  // @Roles(Role.ADMIN)
  @Patch(':id/status')
  async updateStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateParcelStatusDto: UpdateParcelStatusDto
  ) {
    return this.parcelsService.updateStatus(id, updateParcelStatusDto.status);
  }

  // @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async softDelete(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.parcelsService.softDelete(id);
  }
}
