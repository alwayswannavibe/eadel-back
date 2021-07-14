import { BeforeInsert, Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { CoreEntity } from '@app/common/entities/core.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { UserEntity } from '@app/user/entities/user.entity';

@Entity('emails')
@ObjectType()
export class EmailEntity extends CoreEntity {
  @Column()
  @Field(() => String)
  code: string;

  @OneToOne(() => UserEntity)
  @JoinColumn()
  user: UserEntity;

  @Column({ default: false })
  @Field(() => Boolean)
  isVerified: boolean;

  @BeforeInsert()
  createCode(): void {
    // Generate random code
    this.code = Math.random().toString(36).substring(2);
  }
}
