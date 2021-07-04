import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { RestaurantEntity } from '@app/restaurant/entities/restaurant.entity';
import { RestaurantService } from '@app/restaurant/restaurant.service';
import { CreateRestaurantDto } from '@app/restaurant/dtos/createRestaurant.dto';
import { CoreResponse } from '@app/common/dtos/coreResponse.dto';
import { User } from '@app/auth/decorators/user.decorator';
import { UserEntity } from '@app/user/entities/user.entity';
import { UserRole } from '@app/user/types/userRole.type';
import { Role } from '@app/auth/decorators/role.decorator';

@Resolver(() => RestaurantEntity)
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation(() => CoreResponse)
  @Role(UserRole.Owner)
  /* eslint-disable @typescript-eslint/indent */
  async createRestaurant(
    @Args('input') createRestaurantDto: CreateRestaurantDto,
    @User() user: UserEntity,
  ): Promise<CoreResponse> {
    return this.restaurantService.createRestaurant(user, createRestaurantDto);
  }
}
