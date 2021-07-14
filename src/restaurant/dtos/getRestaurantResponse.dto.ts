import { Field, ObjectType } from '@nestjs/graphql';
import { CoreResponse } from '@app/common/dtos/coreResponse.dto';
import { RestaurantEntity } from '@app/restaurant/entities/restaurant.entity';

@ObjectType()
export class GetRestaurantResponse extends CoreResponse {
  @Field(() => RestaurantEntity, { nullable: true })
  restaurant?: RestaurantEntity;
}
