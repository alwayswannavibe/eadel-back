import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEntity } from '@app/category/entities/category.entity';
import { Repository } from 'typeorm';
import { AllCategoriesResponseDto } from '@app/category/dtos/allCategoriesResponse.dto';
import { RestaurantEntity } from '@app/restaurant/entities/restaurant.entity';
import { OneCategoryDtoResponse } from '@app/category/dtos/oneCategoryResponse.dto';
import { ENTITY_PER_PAGE } from '@app/common/constants/entityPerPage';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(RestaurantEntity)
    private readonly restaurantRepository: Repository<RestaurantEntity>,
  ) {}

  async getAllCategories(): Promise<AllCategoriesResponseDto> {
    const categories = await this.categoryRepository.find();

    return {
      isSuccess: true,
      categories,
    };
  }

  async countRestaurants(category: CategoryEntity): Promise<number> {
    return this.restaurantRepository.count({ category });
  }

  async getOneCategory(
    categorySlug: string,
    page: number,
  ): Promise<OneCategoryDtoResponse> {
    const category = await this.categoryRepository.findOne({
      slug: categorySlug,
    });

    if (!category) {
      return {
        isSuccess: false,
        error: 'Category not found',
      };
    }

    const totalPages = Math.ceil(
      (await this.countRestaurants(category)) / ENTITY_PER_PAGE,
    );

    const restaurants = await this.restaurantRepository.find({
      where: {
        category,
      },
      take: ENTITY_PER_PAGE,
      skip: (page - 1) * ENTITY_PER_PAGE,
    });

    category.restaurants = restaurants;

    return {
      isSuccess: true,
      category,
      totalPages,
    };
  }
}
