import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class DeleteRestourantDto {
  @Field(() => Number)
  id: number;
}
