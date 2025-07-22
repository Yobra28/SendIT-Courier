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
    const where: any = { receiverId: userId, status: 'DELIVERED', deletedAt: null };
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

  async updateAddresses(id: string, pickupLocation: string, destination: string) {
    const parcel = await this.prisma.parcel.update({
      where: { id },
      data: { pickupLocation, destination },
      include: { sender: true, receiver: true },
    });
    return this.toParcelOrder(parcel);
  }

  async getParcelByTrackingNumber(trackingNumber: string) {
    const parcel = await this.prisma.parcel.findUnique({
      where: { trackingNumber },
      include: { sender: true, receiver: true, trackingSteps: { orderBy: { timestamp: 'asc' } } },
    });
    if (!parcel) return { message: 'Parcel not found' };
    return {
      ...this.toParcelOrder(parcel),
      origin: parcel.pickupLocation, // Ensure always present
      destination: parcel.destination, // Ensure always present
      steps: parcel.trackingSteps.map((step: any) => ({
        status: step.status,
        description: `Status: ${step.status}`,
        location: step.location,
        lat: step.lat,
        lng: step.lng,
        timestamp: step.timestamp,
        completed: step.status === 'DELIVERED',
      })),
    };
  }

  async addTrackingStep(parcelId: string, dto: any) {
    const step = await this.prisma.parcelTrackingStep.create({
      data: {
        parcelId,
        status: dto.status,
        location: dto.location,
        lat: dto.lat,
        lng: dto.lng,
        timestamp: dto.timestamp || new Date(),
      },
    });
    return step;
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
