import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersService } from './users/users.service';
import { UsersModule } from './users/users.module';
import { ParcelsService } from './parcels/parcels.service';
import { ParcelsController } from './parcels/parcels.controller';
import { ParcelsModule } from './parcels/parcels.module';
import { EmailService } from './email/email.service';
import { EmailModule } from './email/email.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { ContactService } from './contact/contact.service';
import { ContactController } from './contact/contact.controller';
import { ContactModule } from './contact/contact.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    ParcelsModule,
    EmailModule,
    PrismaModule,
    ContactModule,
  ],
  controllers: [AppController, ParcelsController, ContactController],
  providers: [
    AppService,
    UsersService,
    ParcelsService,
    EmailService,
    PrismaService,
    ContactService,
  ],
})
export class AppModule {}
