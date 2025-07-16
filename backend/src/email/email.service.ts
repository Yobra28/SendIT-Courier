/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  async sendWelcomeEmail(email: string, name: string) {
    // Simulate sending a welcome email
    console.log(`Sending welcome email to ${email} (name: ${name})`);
    // TODO: Integrate with real email provider
  }

  async sendStatusUpdateEmail(email: string, parcel: any) {
    // Simulate sending a status update email
    console.log(`Sending status update email to ${email} for parcel ${parcel.id} (status: ${parcel.status})`);
    // TODO: Integrate with real email provider
  }
}
