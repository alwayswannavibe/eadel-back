import { Field, ObjectType } from '@nestjs/graphql';
import { ResponseWithPagination } from '@app/common/dtos/responseWithPagination.dto';
import { RestaurantEntity } from '@app/restaurant/entities/restaurant.entity';

@ObjectType()
export class GetRestaurantsResponse extends ResponseWithPagination {
  @Field(() => [RestaurantEntity], { nullable: true })
  restaurants?: RestaurantEntity[];
}
