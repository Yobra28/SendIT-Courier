/* eslint-disable prettier/prettier */
import { IsString, IsNotEmpty, IsEmail, MinLength, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';
import { RegisterDtoInterface } from '../interfaces/auth-interfaces';

export class RegisterDto implements RegisterDtoInterface {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEnum(Role)
  role: Role;
}
