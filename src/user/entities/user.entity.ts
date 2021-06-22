import { BeforeInsert, Column, Entity } from 'typeorm';
import { UserRole } from '@app/user/types/userRole.type';
import { CoreEntity } from '@app/common/entities/core.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import * as bcrypt from 'bcrypt';

@ObjectType()
@Entity('users')
export class UserEntity extends CoreEntity {
  @Column()
  @Field(() => String)
  email: string;

  @Column()
  @Field(() => String)
  password: string;

  @Column()
  @Field(() => UserRole)
  role: UserRole;

  @BeforeInsert()
  async hashPassword(): Promise<void> {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
