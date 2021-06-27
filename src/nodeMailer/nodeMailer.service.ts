import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class NodeMailerService {
  constructor(private readonly mailerService: MailerService) {}

  async sendCode(mail: string, code: string): Promise<void> {
    this.mailerService.sendMail({
      to: mail,
      subject: 'Verify your email',
      text: `Your verification code is ${code}`,
      html: `<h1>Verification</h1><br><b>Your verification code is ${code}<b>`,
    });
  }
}
