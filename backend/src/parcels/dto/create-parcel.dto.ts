/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsUUID, IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateParcelDto {
  @IsUUID()
  receiverId: string;

  @IsUUID()
  @IsOptional()
  courierId?: string;

  @IsString()
  @IsNotEmpty()
  pickupLocation: string;

  @IsString()
  @IsNotEmpty()
  destination: string;

  @IsNumber()
  pricing: number;

  @IsOptional()
  @Type(() => Date)
  estimatedDelivery?: Date;
} 