/* eslint-disable prettier/prettier */
import { Role } from '@prisma/client';


export interface RegisterDtoInterface {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: Role;
}

export interface LoginDtoInterface {
  email: string;
  password: string;
} 