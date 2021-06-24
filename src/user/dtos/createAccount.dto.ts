import { InputType, PickType } from '@nestjs/graphql';
import { UserEntity } from '@app/user/entities/user.entity';

@InputType()
export class CreateAccountDto extends PickType(
  UserEntity,
  ['email', 'password', 'role'],
  InputType,
) {}
