import {
  BeforeInsert, BeforeUpdate, Column, Entity
} from 'typeorm';
import { UserRole } from '@app/user/types/userRole.type';
import { CoreEntity } from '@app/common/entities/core.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import * as bcrypt from 'bcrypt';
import { IsEmail, IsEnum, IsString } from 'class-validator';

@ObjectType()
@Entity('users')
export class UserEntity extends CoreEntity {
  @Column()
  @Field(() => String)
  @IsEmail()
  email: string;

  @Column()
  @Field(() => String)
  @IsString()
  password: string;

  @Column()
  @Field(() => UserRole)
  @IsEnum(UserRole)
  role: UserRole;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
