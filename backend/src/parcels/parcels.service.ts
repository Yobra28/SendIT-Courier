/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateParcelDto } from './dto/create-parcel.dto';
import { ParcelStatus } from '@prisma/client';

interface ParcelListOptions {
  page?: number;
  limit?: number;
  search?: string;
}

@Injectable()
export class ParcelsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async create(createParcelDto: CreateParcelDto, adminId: string) {
    // Generate tracking number and set pricing based on frontend options
    const trackingNumber = 'ST' + Math.random().toString().substr(2, 9);
    // Accept pricing from DTO, default to 500 (Standard)
    const allowedPricing = [500, 1200, 2000];
    let pricing = Number(createParcelDto.pricing);
    if (!allowedPricing.includes(pricing)) {
      pricing = 500;
    }
    const parcel = await this.prisma.parcel.create({
      data: {
        senderId: adminId,
        receiverId: createParcelDto.receiverId,
        pickupLocation: createParcelDto.pickupLocation,
        destination: createParcelDto.destination,
        status: 'PENDING',
        trackingNumber,
        pricing,
      },
      include: { sender: true, receiver: true },
    });
    return this.toParcelOrder(parcel);
  }

  async getSentParcels(userId: string, options: ParcelListOptions = {}) {
    const page = Number(options.page) > 0 ? Number(options.page) : 1;
    const limit = Number(options.limit) > 0 ? Number(options.limit) : 10;
    const skip = (page - 1) * limit;
    const where: any = { senderId: userId, deletedAt: null };
    if (options.search) {
      where.OR = [
        { pickupLocation: { contains: options.search, mode: 'insensitive' } },
        { destination: { contains: options.search, mode: 'insensitive' } },
        { status: { contains: options.search, mode: 'insensitive' } },
      ];
    }
    const [parcels, total] = await Promise.all([
      this.prisma.parcel.findMany({ where, skip, take: limit, include: { sender: true, receiver: true } }),
      this.prisma.parcel.count({ where }),
    ]);
    return {
      data: parcels.map(this.toParcelOrder),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getReceivedParcels(userId: string, options: ParcelListOptions = {}) {
    const page = Number(options.page) > 0 ? Number(options.page) : 1;
    const limit = Number(options.limit) > 0 ? Number(options.limit) : 10;
    const skip = (page - 1) * limit;
    const where: any = { receiverId: userId, deletedAt: null };
    if (options.search) {
      where.OR = [
        { pickupLocation: { contains: options.search, mode: 'insensitive' } },
        { destination: { contains: options.search, mode: 'insensitive' } },
        { status: { contains: options.search, mode: 'insensitive' } },
      ];
    }
    const [parcels, total] = await Promise.all([
      this.prisma.parcel.findMany({ where, skip, take: limit, include: { sender: true, receiver: true } }),
      this.prisma.parcel.count({ where }),
    ]);
    return {
      data: parcels.map(this.toParcelOrder),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAllParcels() {
    const parcels = await this.prisma.parcel.findMany({
      where: { deletedAt: null },
      include: { sender: true, receiver: true },
    });
    return parcels.map(this.toParcelOrder);
  }

  async updateStatus(id: string, status: string) {
    const parcel = await this.prisma.parcel.update({
      where: { id },
      data: { status: status as ParcelStatus },
      include: { sender: true, receiver: true },
    });
    return this.toParcelOrder(parcel);
  }

  async softDelete(id: string) {
    return this.prisma.parcel.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // Helper to map DB parcel to ParcelOrder shape
  toParcelOrder(parcel: any) {
    return {
      id: parcel.id,
      sender: parcel.sender?.name || '',
      recipient: parcel.receiver?.name || '',
      origin: parcel.pickupLocation,
      destination: parcel.destination,
      status: parcel.status,
      createdAt: parcel.createdAt,
      trackingNumber: parcel.trackingNumber,
      pricing: parcel.pricing,
    };
  }
}
