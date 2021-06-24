import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@app/user/entities/user.entity';
import { UserResolver } from '@app/user/user.resolver';
import { UserService } from '@app/user/user.service';
import { EmailModule } from '@app/email/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), EmailModule],
  providers: [UserResolver, UserService],
  exports: [UserService],
})
export class UserModule {}
