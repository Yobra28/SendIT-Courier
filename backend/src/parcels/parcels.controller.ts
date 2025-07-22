import { Controller, Post, Body, Get, Patch, Param, Delete, ParseUUIDPipe, Request, Query, UseGuards } from '@nestjs/common';
import { ParcelsService } from './parcels.service';
import { CreateParcelDto } from './dto/create-parcel.dto';
import { UpdateParcelStatusDto } from './dto/update-parcel-status.dto';
import { CreateParcelTrackingStepDto } from './dto/create-parcel-tracking-step.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { Roles } from '../common/decorators/roles/roles.decorator';
import { Role } from 'generated/prisma';

@Controller('parcels')
export class ParcelsController {
  constructor(private readonly parcelsService: ParcelsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  async create(@Body() createParcelDto: CreateParcelDto, @Request() req) {
    // req.user.id is the admin creating the parcel
    return this.parcelsService.create(createParcelDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('sent')
  async getSentParcels(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string
  ) {
    return this.parcelsService.getSentParcels(req.user.id, { page, limit, search });
  }

  @UseGuards(JwtAuthGuard)
  @Get('received')
  async getReceivedParcels(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string
  ) {
    return this.parcelsService.getReceivedParcels(req.user.id, { page, limit, search });
  }

  @UseGuards(JwtAuthGuard)
  @Get('track/:trackingNumber')
  async getParcelByTrackingNumber(@Param('trackingNumber') trackingNumber: string) {
    return this.parcelsService.getParcelByTrackingNumber(trackingNumber);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  async getAllParcels() {
    return this.parcelsService.getAllParcels();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/status')
  async updateStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateParcelStatusDto: UpdateParcelStatusDto
  ) {
    return this.parcelsService.updateStatus(id, updateParcelStatusDto.status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post(':id/steps')
  async addTrackingStep(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: CreateParcelTrackingStepDto
  ) {
    return this.parcelsService.addTrackingStep(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/addresses')
  async updateAddresses(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: { pickupLocation: string; destination: string }
  ) {
    return this.parcelsService.updateAddresses(id, body.pickupLocation, body.destination);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async softDelete(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.parcelsService.softDelete(id);
  }
}
