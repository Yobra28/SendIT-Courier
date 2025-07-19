/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

@Injectable()
export class EmailService {
  async sendWelcomeEmail(email: string, name: string) {
    let templatePath = path.join(__dirname, 'templates', 'welcome.hbs');
    if (!fs.existsSync(templatePath)) {
      templatePath = path.join(process.cwd(), 'src', 'email', 'templates', 'welcome.hbs');
    }
    const source = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(source);
    const html = template({ name });
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: 'Welcome to SendIT!',
      text: `Hello ${name},\n\nWelcome to SendIT! We are excited to have you on board.`,
      html,
    });
  }

  async sendStatusUpdateEmail(email: string, parcel: any) {
    let templatePath = path.join(__dirname, 'templates', 'status-update.hbs');
    if (!fs.existsSync(templatePath)) {
      templatePath = path.join(process.cwd(), 'src', 'email', 'templates', 'status-update.hbs');
    }
    const source = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(source);
    const html = template({ id: parcel.id, status: parcel.status });
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: `Parcel Status Update: ${parcel.status}`,
      text: `Your parcel (ID: ${parcel.id}) status has been updated to: ${parcel.status}.`,
      html,
    });
  }

  async sendPasswordResetEmail(email: string, name: string, code: string) {
    let templatePath = path.join(__dirname, 'templates', 'password-reset.hbs');
    if (!fs.existsSync(templatePath)) {
      templatePath = path.join(process.cwd(), 'src', 'email', 'templates', 'password-reset.hbs');
    }
    const source = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(source);
    const html = template({ name, code });
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: 'Password Reset Request',
      text: `Hello ${name},\n\nWe received a request to reset your password. Use the following code to set a new password: ${code}\n\nIf you did not request this, please ignore this email.`,
      html,
    });
  }
}
