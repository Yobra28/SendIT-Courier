import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateParcelTrackingStepDto {
  @IsString()
  @IsNotEmpty()
  status: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;

  @IsOptional()
  timestamp?: Date;
} 