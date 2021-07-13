import { InputType, PartialType, PickType } from '@nestjs/graphql';
import { DishEntity } from '@app/dish/entities/dish.entity';

@InputType()
export class UpdateDishDto extends PickType(
  PartialType(DishEntity),
  ['name', 'description', 'price', 'image', 'id'],
  InputType,
) {}
