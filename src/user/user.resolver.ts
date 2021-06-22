import { UserEntity } from '@app/user/entities/user.entity';
import {
  Args, Mutation, Query, Resolver,
} from '@nestjs/graphql';
import { UserService } from '@app/user/user.service';
import { CreateAccountDto } from '@app/user/dtos/createAccount.dto';
import { ResponseDto } from '@app/common/dtos/response.dto';

@Resolver(() => UserEntity)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => Boolean)
  hi() {
    return true;
  }

  @Mutation(() => ResponseDto)
  async createAccount(
    @Args('input') createAccountDto: CreateAccountDto,
  ): Promise<ResponseDto> {
    return this.userService.createAccount(createAccountDto);
  }
}
