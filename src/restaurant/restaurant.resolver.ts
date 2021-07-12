import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { RestaurantEntity } from '@app/restaurant/entities/restaurant.entity';
import { RestaurantService } from '@app/restaurant/restaurant.service';
import { CreateRestaurantDto } from '@app/restaurant/dtos/createRestaurant.dto';
import { CoreResponse } from '@app/common/dtos/coreResponse.dto';
import { User } from '@app/auth/decorators/user.decorator';
import { UserEntity } from '@app/user/entities/user.entity';
import { UserRole } from '@app/user/types/userRole.type';
import { Role } from '@app/auth/decorators/role.decorator';
import { UpdateRestaurantDto } from '@app/restaurant/dtos/updateRestaurant.dto';
import { DeleteRestaurantDto } from '@app/restaurant/dtos/deleteRestaurant.dto';

import { GetRestaurantsResponse } from '@app/restaurant/dtos/getRestaurantsResponse.dto';
import { PaginationDto } from '@app/common/dtos/pagination.dto';
import { GetRestaurantResponse } from '@app/restaurant/dtos/getRestaurantResponse.dto';
import { GetRestaurantDto } from '@app/restaurant/dtos/getRestaurant.dto';
import { GetRestaurantsBySearchDto } from '@app/restaurant/dtos/getRestaurantsBySearch.dto';

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

  @Mutation(() => CoreResponse)
  @Role(UserRole.Owner)
  async updateRestaurant(
    @Args('input') updateRestaurantDto: UpdateRestaurantDto,
    @User() user: UserEntity,
  ): Promise<CoreResponse> {
    return this.restaurantService.updateRestaurant(user, updateRestaurantDto);
  }

  @Mutation(() => CoreResponse)
  @Role(UserRole.Owner)
  async deleteRestaurant(
    @Args('input') deleteRestourantDto: DeleteRestaurantDto,
    @User() user: UserEntity,
  ): Promise<CoreResponse> {
    return this.restaurantService.deleteRestaurant(
      user,
      deleteRestourantDto.id,
    );
  }

  @Query(() => GetRestaurantsResponse)
  restaurants(
    @Args('input') getRestaurantsDto: PaginationDto,
  ): Promise<GetRestaurantsResponse> {
    return this.restaurantService.getRestaurants(getRestaurantsDto.page);
  }

  @Query(() => GetRestaurantResponse)
  restaurant(
    @Args('input') getRestaurantDto: GetRestaurantDto,
  ): Promise<GetRestaurantResponse> {
    return this.restaurantService.getRestaurantById(getRestaurantDto.id);
  }

  @Query(() => GetRestaurantsResponse)
  searchRestaurants(
    @Args('input') getRestaurantsBySearchDto: GetRestaurantsBySearchDto,
  ): Promise<GetRestaurantsResponse> {
    return this.restaurantService.getRestaurantsBySearch(
      getRestaurantsBySearchDto.page,
      getRestaurantsBySearchDto.query,
    );
  }
}
