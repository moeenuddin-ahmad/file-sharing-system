import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailServices {
  constructor(private readonly mailerService: MailerService) {}

  async sendMail(to: string, subject: string, html: string) {
    try {
      const info = await this.mailerService.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html,
      });
      return info;
    } catch (err) {
      console.error('Error while sending mail to %s:', to, err);
      throw err;
    }
  }
}
