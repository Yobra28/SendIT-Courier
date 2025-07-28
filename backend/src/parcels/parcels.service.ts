/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateParcelDto } from './dto/create-parcel.dto';
import { CreateParcelTrackingStepDto } from './dto/create-parcel-tracking-step.dto';
import { UpdateParcelDto } from './dto/update-parcel.dto';
import { ParcelStatus, Prisma } from '@prisma/client';
import fetch from 'node-fetch';

interface ParcelListOptions {
  page?: number;
  limit?: number;
  search?: string;
}

export interface ParcelWithRelations {
  id: string;
  sender?: { name: string } | null;
  receiver?: { name: string } | null;
  courier?: { name: string } | null;
  pickupLocation: string;
  destination: string;
  status: string;
  createdAt: Date;
  trackingNumber: string;
  pricing: number;
  estimatedDelivery?: Date | null;
  currentLat?: number | null;
  currentLng?: number | null;
}

type ParcelWhereCondition = Prisma.ParcelWhereInput;

interface TrackingStep {
  status: string;
  location: string;
  lat: number;
  lng: number;
  timestamp: Date;
}

@Injectable()
export class ParcelsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async assignCourierToParcel(parcelId: string, courierId: string) {
    
    const parcel = await this.prisma.parcel.update({
      where: { id: parcelId },
      data: { courierId },
      include: { sender: true, receiver: true, courier: true },
    });
    
    if (parcel.courier && parcel.receiver) {
      await this.emailService.sendCourierAssignedEmail(parcel.courier.email, {
        courierName: parcel.courier.name,
        trackingNumber: parcel.trackingNumber,
        pickupLocation: parcel.pickupLocation,
        destination: parcel.destination,
        receiverName: parcel.receiver.name,
        receiverPhone: parcel.receiver.phone,
        receiverEmail: parcel.receiver.email,
        year: new Date().getFullYear(),
      });
    }
    return this.toParcelOrder(parcel);
  }

  async geocodeAddress(address: string): Promise<{ lat: number, lng: number } | null> {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    try {
      const results = await fetch(url).then(res => res.json()) as any[];
      if (results && results.length > 0) {
        return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
      }
    // eslint-disable-next-line no-empty
    } catch (e) {}
    return null;
  }

  async create(createParcelDto: CreateParcelDto, adminId: string) {
    const trackingNumber = 'ST' + Math.random().toString().substr(2, 9);
    const allowedPricing = [500, 1200, 2000];
    let pricing = Number(createParcelDto.pricing);
    if (!allowedPricing.includes(pricing)) {
      pricing = 500;
    }
    let currentLat: number | undefined = undefined;
    let currentLng: number | undefined = undefined;
    const geo = await this.geocodeAddress(createParcelDto.pickupLocation);
    if (geo) {
      currentLat = geo.lat;
      currentLng = geo.lng;
    }
    const parcel = await this.prisma.parcel.create({
      data: {
        senderId: createParcelDto.senderId || adminId,
        receiverId: createParcelDto.receiverId,
        pickupLocation: createParcelDto.pickupLocation,
        destination: createParcelDto.destination,
        status: 'PENDING',
        trackingNumber,
        pricing,
        currentLat,
        currentLng,
        ...(createParcelDto.courierId ? { courierId: createParcelDto.courierId } : {}),
        ...(createParcelDto.estimatedDelivery ? { estimatedDelivery: createParcelDto.estimatedDelivery } : {}),
      },
      include: { sender: true, receiver: true, courier: true },
    });
    
    await this.emailService.sendParcelCreatedReceiver(parcel.receiver.email, {
      name: parcel.receiver.name,
      trackingNumber: parcel.trackingNumber,
      status: parcel.status,
      estimatedDelivery: parcel.estimatedDelivery ? new Date(parcel.estimatedDelivery).toLocaleString() : '',
      price: parcel.pricing,
      destination: parcel.destination,
      year: new Date().getFullYear(),
      ...(parcel.courier ? {
        courierName: parcel.courier.name,
        courierPhone: parcel.courier.phone,
        courierEmail: parcel.courier.email,
      } : {}),
    });
   
    await this.emailService.sendParcelCreatedSender(parcel.sender.email, {
      name: parcel.sender.name,
      recipient: parcel.receiver.name,
      destination: parcel.destination,
      trackingNumber: parcel.trackingNumber,
      estimatedDelivery: parcel.estimatedDelivery ? new Date(parcel.estimatedDelivery).toLocaleString() : '',
      year: new Date().getFullYear(),
      ...(parcel.courier ? {
        courierName: parcel.courier.name,
        courierPhone: parcel.courier.phone,
        courierEmail: parcel.courier.email,
      } : {}),
    });
    
    if (createParcelDto.courierId) {
      await this.prisma.notification.create({
        data: {
          userId: createParcelDto.courierId,
          type: 'assigned',
          title: 'New Parcel Assigned',
          message: `You have been assigned a new parcel (${trackingNumber}) by the admin.`,
          parcelId: parcel.id,
        },
      });
    }
    return this.toParcelOrder(parcel);
  }

  async getSentParcels(userId: string, options: ParcelListOptions = {}) {
    const page = Number(options.page) > 0 ? Number(options.page) : 1;
    const limit = Number(options.limit) > 0 ? Number(options.limit) : 10;
    const skip = (page - 1) * limit;
    const where: ParcelWhereCondition = { senderId: userId, deletedAt: null };
    if (options.search) {
      where.OR = [
        { pickupLocation: { contains: options.search, mode: 'insensitive' } },
        { destination: { contains: options.search, mode: 'insensitive' } },
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
    const where: ParcelWhereCondition = { receiverId: userId, deletedAt: null };
    if (options.search) {
      where.OR = [
        { pickupLocation: { contains: options.search, mode: 'insensitive' } },
        { destination: { contains: options.search, mode: 'insensitive' } },
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
   
    const statusMap: Record<string, string> = {
      'Pending': 'PENDING',
      'In Transit': 'IN_TRANSIT',
      'Out for Pickup': 'OUT_FOR_PICKUP',
      'Delivered': 'DELIVERED',
    };
    const enumStatus = statusMap[status] || status; 
    const parcel = await this.prisma.parcel.update({
      where: { id },
      data: { status: enumStatus as ParcelStatus },
      include: { sender: true, receiver: true },
    });
    
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
      origin: parcel.pickupLocation,
      destination: parcel.destination,
      steps: parcel.trackingSteps.map((step: TrackingStep) => ({
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

  async addTrackingStep(parcelId: string, dto: CreateParcelTrackingStepDto) {
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
    const where: ParcelWhereCondition = { courierId, deletedAt: null };
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

  async getUserNotifications(userId: string, userRole?: string) {
    if (userRole === 'COURIER') {
      // Only return notifications of type 'assigned' for couriers
      return this.prisma.notification.findMany({
        where: { userId, type: 'assigned' },
        orderBy: { createdAt: 'desc' },
      });
    }
    // Default: return all notifications
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

  async updateCurrentLocation(parcelId: string, lat: number, lng: number) {
    return this.prisma.parcel.update({
      where: { id: parcelId },
      data: { currentLat: lat, currentLng: lng },
    });
  }

  async updateParcel(id: string, data: UpdateParcelDto) {
    // Only allow updating certain fields
    const updateData: Partial<{
      pickupLocation: string;
      destination: string;
      pricing: number;
      estimatedDelivery: string;
      courierId: string;
    }> = {};
    
    if (data.origin || data.pickupLocation) updateData.pickupLocation = data.origin || data.pickupLocation;
    if (data.destination) updateData.destination = data.destination;
    if (data.pricing) updateData.pricing = Number(data.pricing);
    if (data.estimatedDelivery) updateData.estimatedDelivery = data.estimatedDelivery;
    if (data.courierId) updateData.courierId = data.courierId;
    
    const parcel = await this.prisma.parcel.update({
      where: { id },
      data: updateData,
      include: { sender: true, receiver: true, courier: true },
    });
    return this.toParcelOrder(parcel);
  }

  async getTrackingSteps(parcelId: string) {
    return this.prisma.parcelTrackingStep.findMany({
      where: { parcelId },
      orderBy: { timestamp: 'asc' },
    });
  }

  async markAllNotificationsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return { success: true };
  }

  // Helper to map DB parcel to ParcelOrder shape
  toParcelOrder(parcel: ParcelWithRelations) {
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
      currentLat: parcel.currentLat ?? null,
      currentLng: parcel.currentLng ?? null,
    };
  }
}
