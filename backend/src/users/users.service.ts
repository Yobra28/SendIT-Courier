/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
    const where: any = { deletedAt: null };
    if (options.search) {
      where.OR = [
        { name: { contains: options.search, mode: 'insensitive' } },
        { email: { contains: options.search, mode: 'insensitive' } },
        { phone: { contains: options.search, mode: 'insensitive' } },
      ];
    }
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({ where, skip, take: limit }),
      this.prisma.user.count({ where }),
    ]);
    const data = users.map(({ password, ...rest }) => rest);
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
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user || user.deletedAt) return null;
    const { password, ...rest } = user;
    return rest;
  }

  async update(id: string, updateUserDto: any) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { ...updateUserDto },
    });
    const { password, ...rest } = user;
    return rest;
  }

  async softDelete(id: string) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    const { password, ...rest } = user;
    return rest;
  }
}
