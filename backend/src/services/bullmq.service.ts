import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SendEmailDto } from 'src/dtos/request/sms/email.dto';

@Injectable()
export class BullMQService {
  constructor(@InjectQueue('email_queue_bull') private emailQueue: Queue) {}

  async sendWelcomeEmail(data: SendEmailDto) {
    console.log('📤 Add job to queue');

    await this.emailQueue.add('send-email', data);
  }
}
