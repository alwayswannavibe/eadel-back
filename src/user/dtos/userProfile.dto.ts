import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class UserProfileDto {
  @Field(() => Number)
  id: number;
}
