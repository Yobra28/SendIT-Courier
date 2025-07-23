/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
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
        ...(createParcelDto.courierId ? { courierId: createParcelDto.courierId } : {}),
        ...(createParcelDto.estimatedDelivery ? { estimatedDelivery: createParcelDto.estimatedDelivery } : {}),
      },
      include: { sender: true, receiver: true },
    });
    // Send email to receiver
    await this.emailService.sendParcelCreatedReceiver(parcel.receiver.email, {
      name: parcel.receiver.name,
      trackingNumber: parcel.trackingNumber,
      status: parcel.status,
      estimatedDelivery: parcel.estimatedDelivery ? new Date(parcel.estimatedDelivery).toLocaleString() : '',
      price: parcel.pricing,
      destination: parcel.destination,
      year: new Date().getFullYear(),
    });
    // Send email to sender
    await this.emailService.sendParcelCreatedSender(parcel.sender.email, {
      name: parcel.sender.name,
      recipient: parcel.receiver.name,
      destination: parcel.destination,
      trackingNumber: parcel.trackingNumber,
      estimatedDelivery: parcel.estimatedDelivery ? new Date(parcel.estimatedDelivery).toLocaleString() : '',
      year: new Date().getFullYear(),
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
    // Map human-readable status to enum
    const statusMap: Record<string, string> = {
      'Pending': 'PENDING',
      'In Transit': 'IN_TRANSIT',
      'Out for Pickup': 'OUT_FOR_PICKUP',
      'Delivered': 'DELIVERED',
    };
    const enumStatus = statusMap[status] || status; // fallback if already enum
    const parcel = await this.prisma.parcel.update({
      where: { id },
      data: { status: enumStatus as ParcelStatus },
      include: { sender: true, receiver: true },
    });
    // Create notification for receiver
    await this.prisma.notification.create({
      data: {
        userId: parcel.receiverId,
        type: 'parcel_status',
        title: `Parcel Status Updated`,
        message: `Your parcel (${parcel.trackingNumber}) status is now: ${enumStatus.replace('_', ' ')}`,
        parcelId: parcel.id,
      },
    });
    // Create notification for sender (admin)
    await this.prisma.notification.create({
      data: {
        userId: parcel.senderId,
        type: 'parcel_status',
        title: `Parcel Status Updated`,
        message: `A parcel you sent (${parcel.trackingNumber}) status is now: ${enumStatus.replace('_', ' ')}`,
        parcelId: parcel.id,
      },
    });
    // Create notification for courier (if assigned)
    if (parcel.courierId) {
      await this.prisma.notification.create({
        data: {
          userId: parcel.courierId,
          type: 'parcel_status',
          title: `Parcel Status Updated`,
          message: `A parcel you are delivering (${parcel.trackingNumber}) status is now: ${enumStatus.replace('_', ' ')}`,
          parcelId: parcel.id,
        },
      });
    }
    // Send email to receiver for every status update
    await this.emailService.sendStatusUpdateReceiver(parcel.receiver.email, {
      name: parcel.receiver.name,
      trackingNumber: parcel.trackingNumber,
      status: parcel.status,
      estimatedDelivery: parcel.estimatedDelivery ? new Date(parcel.estimatedDelivery).toLocaleString() : '',
      price: parcel.pricing,
      destination: parcel.destination,
      year: new Date().getFullYear(),
    });
    // Send email to sender only if delivered
    if (parcel.status === 'DELIVERED') {
      await this.emailService.sendStatusUpdateSender(parcel.sender.email, {
        name: parcel.sender.name,
        trackingNumber: parcel.trackingNumber,
        status: parcel.status,
        estimatedDelivery: parcel.estimatedDelivery ? new Date(parcel.estimatedDelivery).toLocaleString() : '',
        price: parcel.pricing,
        destination: parcel.destination,
        year: new Date().getFullYear(),
      });
    }
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

  async getParcelsForCourier(courierId: string, options: ParcelListOptions = {}) {
    const page = Number(options.page) > 0 ? Number(options.page) : 1;
    const limit = Number(options.limit) > 0 ? Number(options.limit) : 10;
    const skip = (page - 1) * limit;
    const where: any = { courierId, deletedAt: null };
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

  async getUserNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getParcelById(id: string) {
    return this.prisma.parcel.findUnique({
      where: { id },
      include: { receiver: true },
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
      estimatedDelivery: parcel.estimatedDelivery,
    };
  }
}
