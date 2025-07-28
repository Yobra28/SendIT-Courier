/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';

interface FindAllOptions {
  page?: number;
  limit?: number;
  search?: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(options: FindAllOptions = {}) {
    const page = Number(options.page) > 0 ? Number(options.page) : 1;
    const limit = Number(options.limit) > 0 ? Number(options.limit) : 10;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { deletedAt: null };
    if (options.search) {
      where.OR = [
        { name: { contains: options.search, mode: 'insensitive' } },
        { email: { contains: options.search, mode: 'insensitive' } },
        { phone: { contains: options.search, mode: 'insensitive' } },
      ];
    }
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({ where, skip, take: limit, include: { parcelsSent: true } }),
      this.prisma.user.count({ where }),
    ]);
    const data = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role, // Include role for filtering couriers
      totalPackages: user.parcelsSent.length,
      status: user.deletedAt ? 'Inactive' : 'Active',
      joinDate: user.createdAt,
    }));
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        deletedAt: true,
        notifyEmail: true,
        notifySms: true,
        notifyPush: true,
        parcelsSent: true,
      },
    });
    if (!user || user.deletedAt) return null;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      totalPackages: user.parcelsSent.length,
      status: user.deletedAt ? 'Inactive' : 'Active',
      createdAt: user.createdAt,
      notifyEmail: user.notifyEmail,
      notifySms: user.notifySms,
      notifyPush: user.notifyPush,
    };
  }

  async create(createUserDto: CreateUserDto) {
    // Check if email already exists
    const existing = await this.prisma.user.findUnique({ where: { email: createUserDto.email } });
    if (existing) {
      throw new Error('Email address already in use.');
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        phone: createUserDto.phone,
        password: hashedPassword,
        role: (createUserDto.role as Role) || Role.USER,
      },
    });
    const { password, ...rest } = user;
    return rest;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // Only allow updating fields that exist in the model
    const allowedFields = ['name', 'email', 'phone', 'notifyEmail', 'notifySms', 'notifyPush'];
    const data: Partial<UpdateUserDto> = {};
    for (const key of allowedFields) {
      if ((updateUserDto as Record<string, unknown>)[key] !== undefined) {
        (data as Record<string, unknown>)[key] = (updateUserDto as Record<string, unknown>)[key];
      }
    }
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data,
      });
      const { password, ...rest } = user;
      return rest;
    } catch (e) {
      console.error('Update error:', JSON.stringify(e, null, 2));
      // Handle Prisma unique constraint error
      if (e.code === 'P2002' && e.meta?.target?.includes('email')) {
        throw new Error('Email address already in use.');
      }
      throw e;
    }
  }

  async softDelete(id: string) {
    // Hard delete: permanently remove the user
    const user = await this.prisma.user.delete({
      where: { id },
    });
    const { password, ...rest } = user;
    return rest;
  }

  async setTwoFactorSecret(id: string, secret: string) {
    return this.prisma.user.update({ where: { id }, data: { twoFactorSecret: secret } });
  }

  async enableTwoFactor(id: string) {
    return this.prisma.user.update({ where: { id }, data: { twoFactorEnabled: true } });
  }

  async findOneRaw(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: { equals: email.trim(), mode: 'insensitive' },
        deletedAt: null
      }
    });
    if (!user) return null;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
      notifyEmail: user.notifyEmail,
      notifySms: user.notifySms,
      notifyPush: user.notifyPush
    };
  }
}
