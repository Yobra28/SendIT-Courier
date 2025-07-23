/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { EmailService } from '../email/email.service';

@Injectable()
export class ContactService {
  constructor(private readonly emailService: EmailService) {}

  async handleContactRequest(name: string, email: string, message: string) {
    // Send notification to admin
    await this.emailService.sendContactNotificationToAdmin(name, email, message);
    // Send confirmation to user
    await this.emailService.sendContactConfirmationToUser(name, email);
  }
}
