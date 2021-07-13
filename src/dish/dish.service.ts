import { Injectable } from '@nestjs/common';
import { CreateDishDto } from '@app/dish/dtos/createDish.dto';
import { CoreResponse } from '@app/common/dtos/coreResponse.dto';
import { UserEntity } from '@app/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { RestaurantEntity } from '@app/restaurant/entities/restaurant.entity';
import { Repository } from 'typeorm';
import { DishEntity } from '@app/dish/entities/dish.entity';
import { UpdateDishDto } from '@app/dish/dtos/updateDish.dto';
import { IdDto } from '@app/common/dtos/id.dto';

@Injectable()
export class DishService {
  constructor(
    @InjectRepository(RestaurantEntity)
    private readonly restaurantRepository: Repository<RestaurantEntity>,
    @InjectRepository(DishEntity)
    private readonly dishRepository: Repository<DishEntity>,
  ) {}

  async createDish(
    createDishDto: CreateDishDto,
    user: UserEntity,
  ): Promise<CoreResponse> {
    const restaurant = await this.restaurantRepository.findOne(
      createDishDto.restaurantId,
    );

    if (!restaurant) {
      return {
        isSuccess: false,
        error: 'No restaurant found',
      };
    }

    if (restaurant.ownerId !== user.id) {
      return {
        isSuccess: false,
        error: "You haven't permission",
      };
    }

    const dish = this.dishRepository.create({ ...createDishDto, restaurant });
    await this.dishRepository.save(dish);

    return {
      isSuccess: true,
    };
  }

  async updateDish(
    updateDishDto: UpdateDishDto,
    user: UserEntity,
  ): Promise<CoreResponse> {
    const dish = await this.dishRepository.findOne(updateDishDto.id, {
      relations: ['restaurant'],
    });

    if (!dish) {
      return {
        isSuccess: false,
        error: 'Dish not found',
      };
    }

    if (dish.restaurant.ownerId !== user.id) {
      return {
        isSuccess: false,
        error: "You haven't permission",
      };
    }

    await this.dishRepository.save({ ...updateDishDto });

    return {
      isSuccess: true,
    };
  }

  async deleteDish(
    deleteDishDto: IdDto,
    user: UserEntity,
  ): Promise<CoreResponse> {
    const dish = await this.dishRepository.findOne(deleteDishDto.id, {
      relations: ['restaurant'],
    });

    if (!dish) {
      return {
        isSuccess: false,
        error: 'Dish not found',
      };
    }

    if (dish.restaurant.ownerId !== user.id) {
      return {
        isSuccess: false,
        error: "You haven't permission",
      };
    }

    await this.dishRepository.delete(dish.id);

    return {
      isSuccess: true,
    };
  }
}
