import { Field, ObjectType } from '@nestjs/graphql';
import { CoreResponse } from '@app/common/dtos/coreResponse.dto';

@ObjectType()
export class LoginResponseDto extends CoreResponse {
  @Field(() => String, { nullable: true })
  token?: string;
}
