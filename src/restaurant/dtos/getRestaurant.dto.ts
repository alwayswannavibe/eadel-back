import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class GetRestaurantDto {
  @Field(() => Int)
  id: number;
}
