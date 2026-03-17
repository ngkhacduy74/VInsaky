import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BullMQService } from 'src/services/bullmq.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email_queue_bull',
    }),
  ],
  providers: [BullMQService],
  exports: [BullMQService],
})
export class BullMQModule {}
