import { Injectable } from '@nestjs/common';
import { CoreResponse } from '@app/common/dtos/coreResponse.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailEntity } from '@app/email/entities/email.entity';
import { UserEntity } from '@app/user/entities/user.entity';

@Injectable()
export class EmailService {
  constructor(
    @InjectRepository(EmailEntity)
    private readonly emailRepository: Repository<EmailEntity>,
  ) {}

  async verifyEmail(userId: number, code: string): Promise<CoreResponse> {
    const email = await this.emailRepository.findOne({ user: { id: userId } });

    if (email.isVerified) {
      return {
        isSuccess: false,
        error: 'Email already verified',
      };
    }

    if (email.code !== code) {
      return {
        isSuccess: false,
        error: 'Wrong confirmation code',
      };
    }

    email.isVerified = true;
    await this.emailRepository.save(email);
    return {
      isSuccess: true,
    };
  }

  async updateEmail(user: UserEntity): Promise<void> {
    await this.emailRepository.delete({ user });
    const updatedEmail = await this.emailRepository.create({ user });
    await this.emailRepository.save(updatedEmail);
  }

  async createEmail(user: UserEntity): Promise<void> {
    const email = await this.emailRepository.create({ user });
    await this.emailRepository.save(email);
  }
}
