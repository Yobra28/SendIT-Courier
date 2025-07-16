/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsUUID, IsNumber, Min, IsString, IsNotEmpty } from 'class-validator';

export class CreateParcelDto {
  @IsUUID()
  receiverId: string;

  @IsNumber()
  @Min(0.01)
  weight: number;

  @IsString()
  @IsNotEmpty()
  pickupLocation: string;

  @IsString()
  @IsNotEmpty()
  destination: string;
} 