import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '@app/user/entities/user.entity';
import { CoreResponse } from '@app/common/dtos/coreResponse.dto';
import { CreateAccountDto } from '@app/user/dtos/createAccount.dto';
import { LoginDto } from '@app/user/dtos/login.dto';
import * as bcrypt from 'bcrypt';
import { LoginResponseDto } from '@app/user/dtos/loginResponse.dto';
import { JwtService } from '@app/jwt/jwt.service';
import { UserProfileResponse } from '@app/user/dtos/userProfileResponse.dto';
import { UpdateProfileDto } from '@app/user/dtos/updateProfile.dto';
import { EmailService } from '@app/email/email.service';
import { Errors } from '@app/common/constants/errors';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async createAccount(
    createAccountDto: CreateAccountDto,
  ): Promise<CoreResponse> {
    const isEmailUsed = await this.userRepository.findOne({
      email: createAccountDto.email,
    });

    if (isEmailUsed) {
      return {
        isSuccess: false,
        error: Errors.EMAIL_TAKEN,
      };
    }

    const user = await this.userRepository.create(createAccountDto);

    await this.userRepository.save(user);

    await this.emailService.createEmail(user);

    return {
      isSuccess: true,
    };
  }

  async login({ email, password }: LoginDto): Promise<LoginResponseDto> {
    const user = await this.userRepository.findOne(
      { email },
      { select: ['password', 'id'] },
    );

    if (!user) {
      return {
        isSuccess: false,
        error: Errors.EMAIL_OR_PASSWORD_WRONG,
      };
    }

    const isPasswordCorrect = await this.checkPassword(password, user);

    if (!isPasswordCorrect) {
      return {
        isSuccess: false,
        error: Errors.EMAIL_OR_PASSWORD_WRONG,
      };
    }

    const token = this.jwtService.sign({ id: user.id });

    return {
      isSuccess: true,
      token,
    };
  }

  async checkPassword(password: string, user): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  async getUserById(id: number): Promise<UserProfileResponse> {
    const user = await this.userRepository.findOne(id);
    if (!user) {
      return {
        error: Errors.NOT_FOUND,
        isSuccess: false,
      };
    }
    return {
      isSuccess: true,
      user,
    };
  }

  async updateProfile(
    userId: number,
    updateProfileDto: UpdateProfileDto,
  ): Promise<CoreResponse> {
    const user = await this.userRepository.findOne(userId);
    const updatedUser = { ...user, ...updateProfileDto };
    // TODO: fix @BeforeUpdate hook
    if (updateProfileDto.password) {
      updatedUser.password = await bcrypt.hash(updatedUser.password, 10);
    }

    if (updateProfileDto.email) {
      this.emailService.updateEmail(updatedUser);
    }

    await this.userRepository.save(updatedUser);
    return {
      isSuccess: true,
    };
  }
}
