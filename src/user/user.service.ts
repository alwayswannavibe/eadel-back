import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '@app/user/entities/user.entity';
import { CoreResponse } from '@app/common/dtos/coreResponse.dto';
import { CreateAccountDto } from '@app/user/dtos/createAccount.dto';
import { LoginDto } from '@app/user/dtos/login.dto';
import * as bcrypt from 'bcrypt';
import { LoginResponseDto } from '@app/user/dtos/loginResponse.dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@app/jwt/jwt.service';
import { UserProfileResponse } from '@app/user/dtos/userProfileResponse.dto';
import { UpdateProfileDto } from '@app/user/dtos/updateProfile.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private configService: ConfigService,
    private jwtService: JwtService,
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
        error: 'This email is already taken',
      };
    }

    const user = await this.userRepository.create(createAccountDto);

    await this.userRepository.save(user);
    return {
      isSuccess: true,
    };
  }

  async login({ email, password }: LoginDto): Promise<LoginResponseDto> {
    const user = await this.userRepository.findOne({ email });

    if (!user) {
      return {
        isSuccess: false,
        error: 'User with with email not found',
      };
    }

    const isPasswordCorrect = await this.checkPassword(password, user);

    if (!isPasswordCorrect) {
      return {
        isSuccess: false,
        error: 'Password is wrong',
      };
    }

    return {
      isSuccess: true,
      token: this.jwtService.sign({ id: user.id }),
    };
  }

  async checkPassword(password: string, user): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  async getUserById(id: number): Promise<UserProfileResponse> {
    const user = await this.userRepository.findOne(id);
    if (!user) {
      return {
        error: 'User not found',
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
    updatedUser.password = await bcrypt.hash(updatedUser.password, 10);
    await this.userRepository.save(updatedUser);
    return {
      isSuccess: true,
    };
  }
}
