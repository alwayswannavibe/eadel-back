import { Column, Entity } from 'typeorm';
import { UserRoleType } from '@app/user/types/userRole.type';
import { CoreEntity } from '@app/common/entities/core.entity';

@Entity('users')
export class UserEntity extends CoreEntity {
  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  role: UserRoleType;
}
