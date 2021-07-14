import { CategoryEntity } from '@app/category/entities/category.entity';
import { CategoryService } from '@app/category/category.service';
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { AllCategoriesResponseDto } from '@app/category/dtos/AllCategoriesResponse.dto';
import { OneCategoryDtoResponse } from '@app/category/dtos/oneCategoryResponse.dto';
import { OneCategoryDto } from '@app/category/dtos/oneCategory.dto';

@Resolver(() => CategoryEntity)
export class CategoryResolver {
  constructor(private readonly categoryService: CategoryService) {}

  @Query(() => AllCategoriesResponseDto)
  async allCategories() {
    return this.categoryService.getAllCategories();
  }

  @ResolveField(() => Number)
  async countRestaurants(@Parent() category: CategoryEntity): Promise<number> {
    return this.categoryService.countRestaurants(category);
  }

  @Query(() => OneCategoryDtoResponse)
  category(
    @Args('input') restaurantsByCategoryDto: OneCategoryDto,
  ): Promise<OneCategoryDtoResponse> {
    return this.categoryService.getOneCategory(
      restaurantsByCategoryDto.categorySlug,
      restaurantsByCategoryDto.page,
    );
  }
}
