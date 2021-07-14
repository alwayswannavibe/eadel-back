import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class IdDto {
  @Field(() => Int)
  id: number;
}
