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
  getSelf(@User() user: UserEntity) {
    return user;
  }

  @Query(() => UserProfileResponse)
  @UseGuards(AuthGuard)
  async getUserProfile(
    @Args() userProfileDto: UserProfileDto,
  ): Promise<UserProfileResponse> {
    return this.userService.getUserById(userProfileDto.id);
  }

  @Mutation(() => CoreResponse)
  async createAccount(
    @Args('input') createAccountDto: CreateAccountDto,
  ): Promise<CoreResponse> {
    return this.userService.createAccount(createAccountDto);
  }

  @Mutation(() => LoginResponseDto)
  async login(@Args('input') loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.userService.login(loginDto);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => CoreResponse)
  /* eslint-disable @typescript-eslint/indent */
  async updateProfile(
    @User() user: UserEntity,
    @Args('input') updateProfileDto: UpdateProfileDto,
  ): Promise<CoreResponse> {
    return this.userService.updateProfile(user.id, updateProfileDto);
  }
}
