import { Field, Int, ObjectType } from '@nestjs/graphql';
import { CoreResponse } from '@app/common/dtos/coreResponse.dto';

@ObjectType()
export class ResponseWithPagination extends CoreResponse {
  @Field(() => Int, { nullable: true })
  totalPages?: number;
}
