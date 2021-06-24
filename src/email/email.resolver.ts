import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { EmailEntity } from '@app/email/entities/email.entity';
import { EmailService } from '@app/email/email.service';
import { CoreResponse } from '@app/common/dtos/coreResponse.dto';
import { VerifyEmailDto } from '@app/email/dtos/verifyEmail.dto';
import { User } from '@app/auth/decorators/user.decorator';
import { UserEntity } from '@app/user/entities/user.entity';

@Resolver(() => EmailEntity)
export class EmailResolver {
  constructor(private readonly emailService: EmailService) {}

  @Mutation(() => CoreResponse)
  /* eslint-disable @typescript-eslint/indent */
  async verifyEmail(
    @Args('input') verifyEmailDto: VerifyEmailDto,
    @User() user: UserEntity,
  ) {
    return this.emailService.verifyEmail(user.id, verifyEmailDto.code);
  }
}
