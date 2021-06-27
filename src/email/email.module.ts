import { Module } from '@nestjs/common';
import { EmailService } from '@app/email/email.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailResolver } from '@app/email/email.resolver';
import { EmailEntity } from '@app/email/entities/email.entity';
import { NodeMailerModule } from '@app/nodeMailer/nodeMailer.module';

@Module({
  imports: [TypeOrmModule.forFeature([EmailEntity]), NodeMailerModule],
  providers: [EmailService, EmailResolver],
  exports: [EmailService],
})
export class EmailModule {}
