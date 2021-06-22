import { InputType, PickType } from '@nestjs/graphql';
import { CreateAccountDto } from '@app/user/dtos/createAccount.dto';

@InputType()
export class LoginDto extends PickType(
  CreateAccountDto,
  ['email', 'password'],
  InputType,
) {}
