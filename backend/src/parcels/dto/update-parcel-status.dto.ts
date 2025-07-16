import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateParcelStatusDto {
  @IsString()
  @IsNotEmpty()
  status: string;
} 