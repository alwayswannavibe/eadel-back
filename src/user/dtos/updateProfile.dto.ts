import { InputType, PartialType, PickType } from '@nestjs/graphql';
import { UserEntity } from '@app/user/entities/user.entity';

@InputType()
export class UpdateProfileDto extends PartialType(
  PickType(UserEntity, ['email', 'password'], InputType),
) {}
