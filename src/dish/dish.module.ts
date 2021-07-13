import { Module } from '@nestjs/common';
import { DishResolver } from '@app/dish/dish.resolver';
import { DishService } from '@app/dish/dish.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DishEntity } from '@app/dish/entities/dish.entity';
import { RestaurantEntity } from '@app/restaurant/entities/restaurant.entity';

@Module({
  providers: [DishService, DishResolver],
  imports: [TypeOrmModule.forFeature([DishEntity, RestaurantEntity])],
})
export class DishModule {}
