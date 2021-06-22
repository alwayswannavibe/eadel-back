import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '@app/user/entities/user.entity';
import { MutationResponseDto } from '@app/common/dtos/mutationResponse.dto';
import { CreateAccountDto } from '@app/user/dtos/createAccount.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createAccount(
    createAccountDto: CreateAccountDto,
  ): Promise<MutationResponseDto> {
    const isEmailUsed = await this.userRepository.findOne({
      email: createAccountDto.email,
    });
    if (isEmailUsed) {
      return {
        isSuccess: false,
        error: 'This email is already taken',
      };
    }
    const user = await this.userRepository.create(createAccountDto);
    await this.userRepository.save(user);
    return {
      isSuccess: true,
    };
  }
}
