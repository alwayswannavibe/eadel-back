import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ResponseDto {
  @Field(() => String, { nullable: true })
  error?: string;

  @Field(() => Boolean)
  isSuccess: boolean;
}
