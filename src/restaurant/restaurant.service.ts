import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RestaurantEntity } from '@app/restaurant/entities/restaurant.entity';
import { ILike, Repository } from 'typeorm';
import { CoreResponse } from '@app/common/dtos/coreResponse.dto';
import { CreateRestaurantDto } from '@app/restaurant/dtos/createRestaurant.dto';
import { UserEntity } from '@app/user/entities/user.entity';
import { CategoryEntity } from '@app/category/entities/category.entity';
import { UpdateRestaurantDto } from '@app/restaurant/dtos/updateRestaurant.dto';
import { GetRestaurantsResponse } from '@app/restaurant/dtos/getRestaurantsResponse.dto';
import { ENTITIES_PER_PAGE } from '@app/common/constants/entitiesPerPage';
import { GetRestaurantResponse } from '@app/restaurant/dtos/getRestaurantResponse.dto';
import { Errors } from '@app/common/constants/errors';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(RestaurantEntity)
    private readonly restaurantRepository: Repository<RestaurantEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async createRestaurant(
    user: UserEntity,
    createRestaurantDto: CreateRestaurantDto,
  ): Promise<CoreResponse> {
    const restaurant = await this.restaurantRepository.create(
      createRestaurantDto,
    );

    restaurant.owner = user;

    const category = await this.getCategory(createRestaurantDto.categoryName);

    restaurant.category = category;

    await this.restaurantRepository.save(restaurant);

    return {
      isSuccess: true,
    };
  }

  async updateRestaurant(
    user: UserEntity,
    updateRestaurantDto: UpdateRestaurantDto,
  ): Promise<CoreResponse> {
    const restaurant = await this.restaurantRepository.findOne(
      updateRestaurantDto.id,
    );

    if (!restaurant) {
      return {
        isSuccess: false,
        error: Errors.NOT_FOUND,
      };
    }

    if (restaurant.ownerId !== user.id) {
      return {
        isSuccess: false,
        error: Errors.PERMISSON_ERROR,
      };
    }

    let category: CategoryEntity = null;

    if (updateRestaurantDto.categoryName) {
      category = await this.getCategory(updateRestaurantDto.categoryName);
    }

    await this.restaurantRepository.save({
      ...updateRestaurantDto,
      ...(category ? { category } : {}),
    });

    return {
      isSuccess: true,
    };
  }

  async deleteRestaurant(
    user: UserEntity,
    restaurantId: number,
  ): Promise<CoreResponse> {
    const restaurant = await this.restaurantRepository.findOne(restaurantId);

    if (!restaurant) {
      return {
        isSuccess: false,
        error: Errors.NOT_FOUND,
      };
    }

    if (restaurant.ownerId !== user.id) {
      return {
        isSuccess: false,
        error: Errors.PERMISSON_ERROR,
      };
    }

    await this.restaurantRepository.delete(restaurantId);

    return {
      isSuccess: true,
    };
  }

  async getRestaurants(page: number): Promise<GetRestaurantsResponse> {
    /* eslint-disable-next-line operator-linebreak */
    const [restaurants, countOfRestaurants] =
      await this.restaurantRepository.findAndCount({
        take: ENTITIES_PER_PAGE,
        skip: (page - 1) * ENTITIES_PER_PAGE,
      });

    const totalPages = Math.ceil(countOfRestaurants / ENTITIES_PER_PAGE);

    return {
      isSuccess: true,
      restaurants,
      totalPages,
    };
  }

  async getRestaurantById(id: number): Promise<GetRestaurantResponse> {
    const restaurant = await this.restaurantRepository.findOne(id, {
      relations: ['dishes'],
    });

    if (!restaurant) {
      return {
        isSuccess: false,
        error: Errors.NOT_FOUND,
      };
    }

    return {
      isSuccess: true,
      restaurant,
    };
  }

  async getRestaurantsBySearch(page: number, query: string) {
    if (!query) {
      return this.getRestaurants(page);
    }

    /* eslint-disable-next-line operator-linebreak */
    const [restaurants, countOfRestaurants] =
      await this.restaurantRepository.findAndCount({
        where: {
          name: ILike(`%${query}%`),
        },
        take: ENTITIES_PER_PAGE,
        skip: (page - 1) * ENTITIES_PER_PAGE,
      });

    const totalPages = Math.ceil(countOfRestaurants / ENTITIES_PER_PAGE);

    return {
      isSuccess: true,
      restaurants,
      totalPages,
    };
  }

  async getCategory(categoryName: string): Promise<CategoryEntity> {
    const formatedCategoryName = categoryName.toLowerCase().trim();
    const slug = formatedCategoryName.replace(/\s+/g, '-');

    let category = await this.categoryRepository.findOne({ slug });
    if (!category) {
      category = await this.categoryRepository.create({
        slug,
        name: formatedCategoryName,
      });
      await this.categoryRepository.save(category);
    }
    return category;
  }
}
