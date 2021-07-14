import { Field, InputType } from '@nestjs/graphql';
import { PaginationDto } from '@app/common/dtos/pagination.dto';

@InputType()
export class OneCategoryDto extends PaginationDto {
  @Field(() => String)
  categorySlug: string;
}
