import { UserEntity } from '@app/user/entities/user.entity';
import {
  Args, Mutation, Query, Resolver,
} from '@nestjs/graphql';
import { UserService } from '@app/user/user.service';
import { CreateAccountDto } from '@app/user/dtos/createAccount.dto';
import { CoreResponse } from '@app/common/dtos/coreResponse.dto';
import { LoginDto } from '@app/user/dtos/login.dto';
import { LoginResponseDto } from '@app/user/dtos/loginResponse.dto';
import { UseGuards } from '@nestjs/common/decorators/core';
import { AuthGuard } from '@app/auth/auth.guard';
import { User } from '@app/auth/decorators/user.decorator';
import { UserProfileDto } from '@app/user/dtos/userProfile.dto';
import { UserProfileResponse } from '@app/user/dtos/userProfileResponse.dto';
import { UpdateProfileDto } from '@app/user/dtos/updateProfile.dto';

@Resolver(() => UserEntity)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => UserEntity)
  @UseGuards(AuthGuard)
  self(@User() user: UserEntity) {
    try {
      return user;
    } catch (error) {
      return {
        isSuccess: false,
        error: 'Internal server error',
      };
    }
  }

  @Query(() => UserProfileResponse)
  @UseGuards(AuthGuard)
  async userProfile(
    @Args() userProfileDto: UserProfileDto,
  ): Promise<UserProfileResponse> {
    try {
      return await this.userService.getUserById(userProfileDto.id);
    } catch (error) {
      return {
        isSuccess: false,
        error: 'Internal server error',
      };
    }
  }

  @Mutation(() => CoreResponse)
  async createAccount(
    @Args('input') createAccountDto: CreateAccountDto,
  ): Promise<CoreResponse> {
    try {
      return await this.userService.createAccount(createAccountDto);
    } catch (error) {
      return {
        isSuccess: false,
        error: 'Internal server error',
      };
    }
  }

  @Mutation(() => LoginResponseDto)
  async login(@Args('input') loginDto: LoginDto): Promise<LoginResponseDto> {
    try {
      return await this.userService.login(loginDto);
    } catch (error) {
      return {
        isSuccess: false,
        error: 'Internal server error',
      };
    }
  }

  @UseGuards(AuthGuard)
  @Mutation(() => CoreResponse)
  /* eslint-disable @typescript-eslint/indent */
  async updateProfile(
    @User() user: UserEntity,
    @Args('input') updateProfileDto: UpdateProfileDto,
  ): Promise<CoreResponse> {
    try {
      return await this.userService.updateProfile(user.id, updateProfileDto);
    } catch (error) {
      return {
        isSuccess: false,
        error: 'Internal server error',
      };
    }
  }
}
