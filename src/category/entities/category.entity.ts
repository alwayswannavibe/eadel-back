import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, OneToMany } from 'typeorm';
import { CoreEntity } from '@app/common/entities/core.entity';
import { IsString } from 'class-validator';
import { RestaurantEntity } from '@app/restaurant/entities/restaurant.entity';

@ObjectType()
@Entity('categories')
export class CategoryEntity extends CoreEntity {
  @Field(() => String)
  @Column()
  @IsString()
  name: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  image?: string;

  @Field(() => String)
  @Column({ unique: true })
  @IsString()
  slug: string;

  @OneToMany(() => RestaurantEntity, (restaurant) => restaurant.category)
  @Field(() => [RestaurantEntity])
  restaurants: RestaurantEntity[];
}
