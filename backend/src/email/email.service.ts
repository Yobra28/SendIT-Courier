/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import { PrismaService } from '../prisma/prisma.service';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465, // Fix: only use secure for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

@Injectable()
export class EmailService {
  constructor(private readonly prisma: PrismaService) {}

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

  async sendContactNotificationToAdmin(name: string, email: string, message: string) {
    let templatePath = path.join(__dirname, 'templates', 'contact-admin.hbs');
    if (!fs.existsSync(templatePath)) {
      templatePath = path.join(process.cwd(), 'src', 'email', 'templates', 'contact-admin.hbs');
    }
    const source = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(source);
    const html = template({ name, email, message });
    // Fetch admin email from the database
    const admin = await this.prisma.user.findFirst({ where: { role: 'ADMIN', deletedAt: null } });
    if (!admin) throw new Error('No admin user found');
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: admin.email,
      subject: 'New Contact Request from SendIT',
      text: `New contact request from ${name} (${email}):\n${message}`,
      html,
    });
  }

  async sendContactConfirmationToUser(name: string, email: string) {
    let templatePath = path.join(__dirname, 'templates', 'contact-user.hbs');
    if (!fs.existsSync(templatePath)) {
      templatePath = path.join(process.cwd(), 'src', 'email', 'templates', 'contact-user.hbs');
    }
    const source = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(source);
    const html = template({ name });
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: 'We Received Your Message! | SendIT',
      text: `Hello ${name},\n\nThank you for contacting SendIT. We have received your message and will get back to you soon.`,
      html,
    });
  }

  async sendParcelCreatedReceiver(email: string, data: any) {
    let templatePath = path.join(__dirname, 'templates', 'parcel-created-receiver.hbs');
    if (!fs.existsSync(templatePath)) {
      templatePath = path.join(process.cwd(), 'src', 'email', 'templates', 'parcel-created-receiver.hbs');
    }
    const source = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(source);
    const html = template(data);
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: `Your Parcel is on the Way! | Tracking: ${data.trackingNumber}`,
      text: `Your parcel is on the way! Tracking: ${data.trackingNumber}`,
      html,
    });
  }

  async sendParcelCreatedSender(email: string, data: any) {
    let templatePath = path.join(__dirname, 'templates', 'parcel-created-sender.hbs');
    if (!fs.existsSync(templatePath)) {
      templatePath = path.join(process.cwd(), 'src', 'email', 'templates', 'parcel-created-sender.hbs');
    }
    const source = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(source);
    const html = template(data);
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: `Parcel Order Confirmed | Tracking: ${data.trackingNumber}`,
      text: `Your parcel order is confirmed! Tracking: ${data.trackingNumber}`,
      html,
    });
  }

  async sendStatusUpdateReceiver(email: string, data: any) {
    let templatePath = path.join(__dirname, 'templates', 'status-update.hbs');
    if (!fs.existsSync(templatePath)) {
      templatePath = path.join(process.cwd(), 'src', 'email', 'templates', 'status-update.hbs');
    }
    const source = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(source);
    const html = template(data);
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: `Parcel Status Update: ${data.status}`,
      text: `Your parcel (${data.trackingNumber}) status is now: ${data.status}`,
      html,
    });
  }

  async sendStatusUpdateSender(email: string, data: any) {
    let templatePath = path.join(__dirname, 'templates', 'status-update.hbs');
    if (!fs.existsSync(templatePath)) {
      templatePath = path.join(process.cwd(), 'src', 'email', 'templates', 'status-update.hbs');
    }
    const source = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(source);
    const html = template(data);
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: `Parcel Status Update: ${data.status}`,
      text: `A parcel you sent (${data.trackingNumber}) status is now: ${data.status}`,
      html,
    });
  }

  async sendCourierAssignedEmail(email: string, data: any) {
    let templatePath = path.join(__dirname, 'templates', 'courier-assigned.hbs');
    if (!fs.existsSync(templatePath)) {
      templatePath = path.join(process.cwd(), 'src', 'email', 'templates', 'courier-assigned.hbs');
    }
    const source = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(source);
    const html = template(data);
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: `New Parcel Assigned | Tracking: ${data.trackingNumber}`,
      text: `You have been assigned a new parcel. Tracking: ${data.trackingNumber}`,
      html,
    });
  }
}
