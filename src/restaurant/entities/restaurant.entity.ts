import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { CoreEntity } from '@app/common/entities/core.entity';
import { IsString } from 'class-validator';
import { CategoryEntity } from '@app/category/entities/category.entity';
import { UserEntity } from '@app/user/entities/user.entity';
import { DishEntity } from '@app/dish/entities/dish.entity';

@ObjectType()
@Entity('restaurants')
export class RestaurantEntity extends CoreEntity {
  @Field(() => String)
  @Column()
  @IsString()
  name: string;

  @Field(() => String)
  @Column()
  @IsString()
  backgroundImage: string;

  @Field(() => String)
  @Column()
  @IsString()
  address: string;

  @ManyToOne(() => CategoryEntity, (category) => category.restaurants, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @Field(() => CategoryEntity, { nullable: true })
  category: CategoryEntity;

  @ManyToOne(() => UserEntity, (owner) => owner.restaurants, {
    onDelete: 'CASCADE',
  })
  @Field(() => UserEntity)
  owner: UserEntity;

  @RelationId((restaurant: RestaurantEntity) => restaurant.owner)
  ownerId: number;

  @Field(() => [DishEntity], { nullable: true })
  @OneToMany(() => DishEntity, (dish) => dish.restaurant)
  dishes: DishEntity[];
}
