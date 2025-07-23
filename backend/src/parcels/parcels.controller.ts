import { Controller, Post, Body, Get, Patch, Param, Delete, ParseUUIDPipe, Request, Query, UseGuards, Response, Res } from '@nestjs/common';
import { ParcelsService } from './parcels.service';
import { CreateParcelDto } from './dto/create-parcel.dto';
import { UpdateParcelStatusDto } from './dto/update-parcel-status.dto';
import { CreateParcelTrackingStepDto } from './dto/create-parcel-tracking-step.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { Roles } from '../common/decorators/roles/roles.decorator';
import { Role as PrismaRole } from '@prisma/client';
import { Response as ExpressResponse } from 'express';
import PDFDocument from 'pdfkit';

@Controller('parcels')
export class ParcelsController {
  constructor(private readonly parcelsService: ParcelsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PrismaRole.ADMIN)
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
  @Roles(PrismaRole.ADMIN)
  @Get()
  async getAllParcels() {
    return this.parcelsService.getAllParcels();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PrismaRole.ADMIN)
  @Patch(':id/status')
  async updateStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateParcelStatusDto: UpdateParcelStatusDto
  ) {
    return this.parcelsService.updateStatus(id, updateParcelStatusDto.status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PrismaRole.ADMIN, PrismaRole.COURIER)
  @Post(':id/steps')
  async addTrackingStep(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: CreateParcelTrackingStepDto
  ) {
    return this.parcelsService.addTrackingStep(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PrismaRole.ADMIN)
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PrismaRole.COURIER)
  @Get('assigned')
  async getAssignedParcels(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string
  ) {
    return this.parcelsService.getParcelsForCourier(req.user.id, { page, limit, search });
  }

  @UseGuards(JwtAuthGuard)
  @Get('notifications')
  async getUserNotifications(@Request() req) {
    return this.parcelsService.getUserNotifications(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/receipt')
  async getParcelReceipt(@Param('id') id: string, @Res() res: ExpressResponse) {
    const parcel = await this.parcelsService.getParcelById(id);
    if (!parcel) {
      return res.status(404).send('Parcel not found');
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${id}.pdf`);
    const doc = new PDFDocument();
    doc.pipe(res);
    doc.fontSize(20).text('Parcel Receipt', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Tracking Number: ${parcel.trackingNumber}`);
    doc.text(`Recipient: ${parcel.receiver?.name || 'N/A'}`);
    doc.text(`Destination: ${parcel.destination}`);
    doc.text(`Status: ${parcel.status}`);
    doc.text(`Price: $${parcel.pricing}`);
    doc.text(`Created: ${new Date(parcel.createdAt).toLocaleString()}`);
    // Always mock estimatedDelivery as createdAt + 3 days
    const estDelivery = new Date(new Date(parcel.createdAt).getTime() + 3 * 24 * 60 * 60 * 1000);
    doc.text(`Est. Delivery: ${estDelivery.toLocaleString()}`);
    doc.moveDown();
    doc.text('Thank you for using SendIT!', { align: 'center' });
    doc.end();
  }
}
