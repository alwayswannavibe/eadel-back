import { Field, InputType, Int, PickType } from '@nestjs/graphql';
import { DishEntity } from '@app/dish/entities/dish.entity';

@InputType()
export class CreateDishDto extends PickType(
  DishEntity,
  ['name', 'price', 'image', 'description'],
  InputType,
) {
  @Field(() => Int)
  restaurantId: number;
}
