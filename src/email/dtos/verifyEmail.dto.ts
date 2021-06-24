import { InputType, PickType } from '@nestjs/graphql';
import { EmailEntity } from '@app/email/entities/email.entity';

@InputType()
export class VerifyEmailDto extends PickType(
  EmailEntity,
  ['code'],
  InputType,
) {}
