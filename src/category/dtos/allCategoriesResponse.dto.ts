import { CoreResponse } from '@app/common/dtos/coreResponse.dto';
import { Field, ObjectType } from '@nestjs/graphql';
import { CategoryEntity } from '@app/category/entities/category.entity';

@ObjectType()
export class AllCategoriesResponseDto extends CoreResponse {
  @Field(() => [CategoryEntity], { nullable: true })
  categories?: CategoryEntity[];
}
