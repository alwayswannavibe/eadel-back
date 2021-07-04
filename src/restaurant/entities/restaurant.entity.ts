import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne } from 'typeorm';
import { CoreEntity } from '@app/common/entities/core.entity';
import { IsString } from 'class-validator';
import { CategoryEntity } from '@app/restaurant/entities/category.entity';
import { UserEntity } from '@app/user/entities/user.entity';

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
}
