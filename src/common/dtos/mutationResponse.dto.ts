import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MutationResponseDto {
  @Field(() => String, { nullable: true })
  error?: string;

  @Field(() => Boolean)
  isSuccess: boolean;
}
