import { Field, InputType, PickType } from '@nestjs/graphql';
import { RestaurantEntity } from '@app/restaurant/entities/restaurant.entity';

@InputType()
export class CreateRestaurantDto extends PickType(
  RestaurantEntity,
  ['name', 'backgroundImage', 'address'],
  InputType,
) {
  @Field(() => String)
  categoryName: string;
}
