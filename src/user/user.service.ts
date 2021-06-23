import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '@app/user/entities/user.entity';
import { MutationResponseDto } from '@app/common/dtos/mutationResponse.dto';
import { CreateAccountDto } from '@app/user/dtos/createAccount.dto';
import { LoginDto } from '@app/user/dtos/login.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { LoginResponseDto } from '@app/user/dtos/loginResponse.dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@app/jwt/jwt.service';

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

  async getUserById(id: number): Promise<UserEntity> {
    return this.userRepository.findOne(id);
  }
}
