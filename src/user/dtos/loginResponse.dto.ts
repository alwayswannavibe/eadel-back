import { Field, ObjectType } from '@nestjs/graphql';
import { MutationResponseDto } from '@app/common/dtos/mutationResponse.dto';

@ObjectType()
export class LoginResponseDto extends MutationResponseDto {
  @Field(() => String, { nullable: true })
  token?: string;
}
