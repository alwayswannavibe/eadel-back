import { Field, InputType, PartialType } from '@nestjs/graphql';
import { CreateRestaurantDto } from '@app/restaurant/dtos/createRestaurant.dto';

@InputType()
export class UpdateRestaurantDto extends PartialType(CreateRestaurantDto) {
  @Field(() => Number)
  id: number;
}
