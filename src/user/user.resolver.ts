import { UserEntity } from '@app/user/entities/user.entity';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from '@app/user/user.service';
import { CreateAccountDto } from '@app/user/dtos/createAccount.dto';
import { CoreResponse } from '@app/common/dtos/coreResponse.dto';
import { LoginDto } from '@app/user/dtos/login.dto';
import { LoginResponseDto } from '@app/user/dtos/loginResponse.dto';
import { User } from '@app/auth/decorators/user.decorator';
import { UserProfileDto } from '@app/user/dtos/userProfile.dto';
import { UserProfileResponse } from '@app/user/dtos/userProfileResponse.dto';
import { UpdateProfileDto } from '@app/user/dtos/updateProfile.dto';
import { Role } from '@app/auth/decorators/role.decorator';

@Resolver(() => UserEntity)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => UserEntity)
  @Role('Any')
  self(@User() user: UserEntity) {
    return user;
  }

  @Query(() => UserProfileResponse)
  @Role('Any')
  async userProfile(
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

  @Mutation(() => CoreResponse)
  @Role('Any')
  /* eslint-disable @typescript-eslint/indent */
  async updateProfile(
    @User() user: UserEntity,
    @Args('input') updateProfileDto: UpdateProfileDto,
  ): Promise<CoreResponse> {
    return this.userService.updateProfile(user.id, updateProfileDto);
  }
}
