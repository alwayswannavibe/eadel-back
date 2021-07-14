import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantEntity } from '@app/restaurant/entities/restaurant.entity';
import { CategoryEntity } from '@app/category/entities/category.entity';
import { RestaurantService } from '@app/restaurant/restaurant.service';
import { RestaurantResolver } from '@app/restaurant/restaurant.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([RestaurantEntity, CategoryEntity])],
  providers: [RestaurantService, RestaurantResolver],
})
export class RestaurantModule {}
