import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMail() {
    try {
      const info = await this.mailerService.sendMail({
        from: process.env.EMAIL_FROM || '"Moeen Hasan" <mashruf125@gmail.com>',
        to: process.env.EMAIL_TO || 'rahim126444@gmail.com',
        subject: 'Hello',
        text: 'Hello world?',
        html: '<b>Hello world?</b>',
      });

      console.log('Message sent: %s', info.messageId);
    } catch (err) {
      console.error('Error while sending mail:', err);
    }
  }
}
