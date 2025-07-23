import { Body, Controller, Post } from '@nestjs/common';
import { ContactService } from './contact.service';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async contact(@Body() body: { name: string; email: string; message: string }) {
    await this.contactService.handleContactRequest(body.name, body.email, body.message);
    return { message: 'Your message has been received. We will get back to you soon.' };
  }
}
