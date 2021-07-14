import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class PaginationDto {
  @Field(() => Int, { defaultValue: 1 })
  page: number;
}
