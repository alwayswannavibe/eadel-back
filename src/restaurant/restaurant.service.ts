import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RestaurantEntity } from '@app/restaurant/entities/restaurant.entity';
import { Repository } from 'typeorm';
import { CoreResponse } from '@app/common/dtos/coreResponse.dto';
import { CreateRestaurantDto } from '@app/restaurant/dtos/createRestaurant.dto';
import { UserEntity } from '@app/user/entities/user.entity';
import { CategoryEntity } from '@app/restaurant/entities/category.entity';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(RestaurantEntity)
    private readonly restaurantRepository: Repository<RestaurantEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>
  ) {
  }

  async createRestaurant(
    owner: UserEntity,
    createRestaurantDto: CreateRestaurantDto
  ): Promise<CoreResponse> {
    try {
      const restaurant = await this.restaurantRepository.create(
        createRestaurantDto
      );

      restaurant.owner = owner;

      const categoryName = createRestaurantDto.categoryName
        .toLowerCase()
        .trim();
      const slug = categoryName.replace(/\s+/g, '-');

      let category = await this.categoryRepository.findOne({ slug });
      if (!category) {
        const newCategory = await this.categoryRepository.create({
          slug,
          name: categoryName,
        });
        category = await this.categoryRepository.save(newCategory);
      }
      restaurant.category = category;

      await this.restaurantRepository.save(restaurant);

      return {
        isSuccess: true,
      };
    } catch (error) {
      return {
        isSuccess: false,
        error: 'Internal server error'
      };
    }
  }
}
