/* eslint-disable prettier/prettier */
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('admin/stats')
  async getAdminStats() {
    const [
      totalParcels,
      pendingParcels,
      inTransitParcels,
      deliveredParcels,
      totalRevenue,
      activeUsers,
    ] = await Promise.all([
      this.prisma.parcel.count({ where: { deletedAt: null } }),
      this.prisma.parcel.count({
        where: { status: 'PENDING', deletedAt: null },
      }),
      this.prisma.parcel.count({
        where: { status: 'IN_TRANSIT', deletedAt: null },
      }),
      this.prisma.parcel.count({
        where: { status: 'DELIVERED', deletedAt: null },
      }),
      this.prisma.parcel
        .aggregate({ _sum: { pricing: true }, where: { deletedAt: null } })
        .then((r) => r._sum.pricing || 0),
      this.prisma.user.count({ where: { deletedAt: null } }),
    ]);
    return {
      totalParcels,
      pendingParcels,
      inTransitParcels,
      deliveredParcels,
      totalRevenue,
      activeUsers,
    };
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
