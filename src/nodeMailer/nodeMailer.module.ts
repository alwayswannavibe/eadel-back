import { Module } from '@nestjs/common';
import { NodeMailerService } from '@app/nodeMailer/nodeMailer.service';

@Module({
  providers: [NodeMailerService],
  exports: [NodeMailerService],
})
export class NodeMailerModule {}
