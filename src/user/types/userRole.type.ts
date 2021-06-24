import { registerEnumType } from '@nestjs/graphql';

export enum UserRole {
  Client,
  Delivery,
  Owner,
}

registerEnumType(UserRole, { name: 'UserRole' });
