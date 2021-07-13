import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { DishEntity } from '@app/dish/entities/dish.entity';
import { CoreResponse } from '@app/common/dtos/coreResponse.dto';
import { CreateDishDto } from '@app/dish/dtos/createDish.dto';
import { Role } from '@app/auth/decorators/role.decorator';
import { UserRole } from '@app/user/types/userRole.type';
import { User } from '@app/auth/decorators/user.decorator';
import { UserEntity } from '@app/user/entities/user.entity';
import { DishService } from '@app/dish/dish.service';
import { UpdateDishDto } from '@app/dish/dtos/updateDish.dto';
import { IdDto } from '@app/common/dtos/id.dto';

@Resolver(() => DishEntity)
export class DishResolver {
  constructor(private readonly dishService: DishService) {}

  @Mutation(() => CoreResponse)
  @Role(UserRole.Owner)
  async createDish(
    @Args('input') createDishDto: CreateDishDto,
    @User() user: UserEntity,
  ): Promise<CoreResponse> {
    return this.dishService.createDish(createDishDto, user);
  }

  @Mutation(() => CoreResponse)
  @Role(UserRole.Owner)
  async updateDish(
    @Args('input') updateDishDto: UpdateDishDto,
    @User() user: UserEntity,
  ): Promise<CoreResponse> {
    return this.dishService.updateDish(updateDishDto, user);
  }

  @Mutation(() => CoreResponse)
  @Role(UserRole.Owner)
  async deleteDish(
    @Args('input') deleteDishDto: IdDto,
    @User() user: UserEntity,
  ): Promise<CoreResponse> {
    return this.dishService.deleteDish(deleteDishDto, user);
  }
}
