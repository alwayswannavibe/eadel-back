import { UserEntity } from '@app/user/entities/user.entity';
import {
  Args, Mutation, Query, Resolver,
} from '@nestjs/graphql';
import { UserService } from '@app/user/user.service';
import { CreateAccountDto } from '@app/user/dtos/createAccount.dto';
import { MutationResponseDto } from '@app/common/dtos/mutationResponse.dto';

@Resolver(() => UserEntity)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => Boolean)
  hi() {
    return true;
  }

  @Mutation(() => MutationResponseDto)
  async createAccount(
    @Args('input') createAccountDto: CreateAccountDto,
  ): Promise<MutationResponseDto> {
    return this.userService.createAccount(createAccountDto);
  }
}
