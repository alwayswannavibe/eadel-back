import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CoreResponse {
  @Field(() => String, { nullable: true })
  error?: string;

  @Field(() => Boolean)
  isSuccess: boolean;
}
