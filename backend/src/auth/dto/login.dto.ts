/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEmail, IsString, MinLength } from 'class-validator';
import { LoginDtoInterface } from '../interfaces/auth-interfaces';

export class LoginDto implements LoginDtoInterface {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
