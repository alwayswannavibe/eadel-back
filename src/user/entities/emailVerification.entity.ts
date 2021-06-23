import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { CoreEntity } from '@app/common/entities/core.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { UserEntity } from '@app/user/entities/user.entity';

@Entity()
@ObjectType()
export class EmailVerificationEntity extends CoreEntity {
  @Column()
  @Field(() => String)
  code: string;

  @OneToOne(() => UserEntity)
  @JoinColumn()
  user: UserEntity;
}
