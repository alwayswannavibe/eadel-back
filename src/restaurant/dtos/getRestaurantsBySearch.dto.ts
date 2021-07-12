import { Field, InputType } from '@nestjs/graphql';
import { PaginationDto } from '@app/common/dtos/pagination.dto';

@InputType()
export class GetRestaurantsBySearchDto extends PaginationDto {
  @Field(() => String, { nullable: true })
  query?: string;
}
