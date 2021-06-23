import { UserEntity } from '@app/user/entities/user.entity';
import {
  Args, Context, Mutation, Query, Resolver,
} from '@nestjs/graphql';
import { UserService } from '@app/user/user.service';
import { CreateAccountDto } from '@app/user/dtos/createAccount.dto';
import { MutationResponseDto } from '@app/common/dtos/mutationResponse.dto';
import { LoginDto } from '@app/user/dtos/login.dto';
import { LoginResponseDto } from '@app/user/dtos/loginResponse.dto';

@Resolver(() => UserEntity)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => UserEntity)
  me(@Context() ctx) {
    if (!ctx.user) {
      return 'error';
    }
    return ctx.user;
  }

  @Mutation(() => MutationResponseDto)
  async createAccount(
    @Args('input') createAccountDto: CreateAccountDto,
  ): Promise<MutationResponseDto> {
    return this.userService.createAccount(createAccountDto);
  }

  @Mutation(() => LoginResponseDto)
  async login(@Args('input') loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.userService.login(loginDto);
  }
}
