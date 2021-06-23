import { Field, ObjectType } from '@nestjs/graphql';
import { UserEntity } from '@app/user/entities/user.entity';
import { CoreResponse } from '@app/common/dtos/coreResponse.dto';

@ObjectType()
export class UserProfileResponse extends CoreResponse {
  @Field(() => UserEntity, { nullable: true })
  user?: UserEntity;
}
