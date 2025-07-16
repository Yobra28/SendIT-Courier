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

  async create(createParcelDto: any, adminId: string) {
    // createParcelDto should include receiverId, weight, pickupLocation, destination
    const parcel = await this.prisma.parcel.create({
      data: {
        senderId: adminId,
        receiverId: createParcelDto.receiverId,
        weight: createParcelDto.weight,
        pickupLocation: createParcelDto.pickupLocation,
        destination: createParcelDto.destination,
        status: 'PENDING',
      },
    });
    return parcel;
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
      this.prisma.parcel.findMany({ where, skip, take: limit }),
      this.prisma.parcel.count({ where }),
    ]);
    return {
      data: parcels,
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
      this.prisma.parcel.findMany({ where, skip, take: limit }),
      this.prisma.parcel.count({ where }),
    ]);
    return {
      data: parcels,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateStatus(id: string, status: string) {
    const parcel = await this.prisma.parcel.update({
      where: { id },
      data: { status },
    });
    // Fetch receiver's email
    const receiver = await this.prisma.user.findUnique({ where: { id: parcel.receiverId } });
    if (receiver && receiver.email) {
      await this.emailService.sendStatusUpdateEmail(receiver.email, parcel);
    }
    return parcel;
  }

  async softDelete(id: string) {
    return this.prisma.parcel.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
