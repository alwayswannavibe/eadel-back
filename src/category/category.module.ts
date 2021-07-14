import { Module } from '@nestjs/common';
import { CategoryService } from '@app/category/category.service';
import { CategoryResolver } from '@app/category/category.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from '@app/category/entities/category.entity';
import { RestaurantEntity } from '@app/restaurant/entities/restaurant.entity';

@Module({
  providers: [CategoryService, CategoryResolver],
  imports: [TypeOrmModule.forFeature([CategoryEntity, RestaurantEntity])],
})
export class CategoryModule {}
