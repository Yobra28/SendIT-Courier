/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as Joi from 'joi';
import * as bcrypt from 'bcrypt';
import { BadRequestException, Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  private registerSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().required(),
    role: Joi.string().valid('USER', 'ADMIN').required(),
  });

  async register(registerDto: RegisterDto) {
    // Validate input
    const { error } = this.registerSchema.validate(registerDto);
    if (error) {
      throw new BadRequestException(error.details[0].message);
    }

    // Check if user exists
    const existing = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });
    if (existing) {
      throw new BadRequestException('Email already in use');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        name: registerDto.name,
        email: registerDto.email,
        password: hashedPassword,
        phone: registerDto.phone,
        role: registerDto.role,
      },
    });

    // Send welcome email
    await this.emailService.sendWelcomeEmail(user.email, user.name);

    // Return user (omit password)
    const { password, ...result } = user;
    return result;
  }

  private loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });

  async login(loginDto: LoginDto) {
    // Validate input
    const { error } = this.loginSchema.validate(loginDto);
    if (error) {
      throw new BadRequestException(error.details[0].message);
    }

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });
    if (!user || user.deletedAt) {
      throw new BadRequestException('Invalid credentials');
    }

    // Compare password
    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatch) {
      throw new BadRequestException('Invalid credentials');
    }

    // Generate JWT
    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = await this.jwtService.signAsync(payload);

    return { access_token: token };
  }
}
