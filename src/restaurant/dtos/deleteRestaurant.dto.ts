import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class DeleteRestaurantDto {
  @Field(() => Number)
  id: number;
}
