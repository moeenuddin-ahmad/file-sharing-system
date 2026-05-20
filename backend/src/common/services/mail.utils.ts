import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailServices {
  constructor(private readonly mailerService: MailerService) {}

  async sendMail(
    to: string,
    subject: string,
    html: string,
    template?: string,
    context?: any,
  ) {
    try {
      const info = await this.mailerService.sendMail({
        from: process.env.EMAIL_FROM || '"Moeen Hasan" <mashruf125@gmail.com>',
        to,
        subject,
        html,
        template,
        context,
      });

      console.log('Email sent successfully to %s: %s', to, info.messageId);
      return info;
    } catch (err) {
      console.error('Error while sending mail to %s:', to, err);
      throw err;
    }
  }
}
