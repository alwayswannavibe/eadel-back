// eslint-disable-next-line import/no-extraneous-dependencies
import { Request } from 'express';
import { UserEntity } from '@app/user/entities/user.entity';

export interface RequestWithUser extends Request {
  user: UserEntity;
}
