import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class UpdateParcelDto {
  @IsOptional()
  @IsString()
  origin?: string;

  @IsOptional()
  @IsString()
  pickupLocation?: string;

  @IsOptional()
  @IsString()
  destination?: string;

  @IsOptional()
  @IsNumber()
  pricing?: number;

  @IsOptional()
  @IsDateString()
  estimatedDelivery?: string;

  @IsOptional()
  @IsString()
  courierId?: string;
} 