import { Field, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from '@app/common/entities/core.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { IsNumber, IsString, Length } from 'class-validator';
import { RestaurantEntity } from '@app/restaurant/entities/restaurant.entity';

@ObjectType()
@Entity('dishes')
export class DishEntity extends CoreEntity {
  @Field(() => String)
  @Column()
  @IsString()
  @Length(2, 30)
  name: string;

  @Field(() => Number)
  @Column()
  @IsNumber()
  price: number;

  @Field(() => String)
  @Column()
  @IsString()
  @Length(20, 400)
  description: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  image?: string;

  @Field(() => RestaurantEntity)
  @ManyToOne(() => RestaurantEntity, (restaurant) => restaurant.dishes, {
    onDelete: 'CASCADE',
  })
  restaurant: RestaurantEntity;

  @RelationId((dish: DishEntity) => dish.restaurant)
  restaurantId: number;
}
