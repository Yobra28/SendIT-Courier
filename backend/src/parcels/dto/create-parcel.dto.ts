/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsUUID, IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateParcelDto {
  @IsUUID()
  receiverId: string;

  @IsString()
  @IsNotEmpty()
  pickupLocation: string;

  @IsString()
  @IsNotEmpty()
  destination: string;

  @IsNumber()
  pricing: number;
} 