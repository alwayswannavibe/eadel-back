import { Field, ObjectType } from '@nestjs/graphql';
import { CategoryEntity } from '@app/category/entities/category.entity';
import { ResponseWithPagination } from '@app/common/dtos/responseWithPagination.dto';

@ObjectType()
export class OneCategoryDtoResponse extends ResponseWithPagination {
  @Field(() => CategoryEntity, { nullable: true })
  category?: CategoryEntity;
}
