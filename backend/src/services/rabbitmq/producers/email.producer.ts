import { Injectable } from '@nestjs/common';
import { RabbitMQService } from 'src/configs/rabbitmq.config';

@Injectable()
export class EmailProducer {
  constructor(private readonly rabbit: RabbitMQService) {}
  async sendEmailJob(data: any) {
    const channel = this.rabbit.getChannel();

    await channel.assertQueue('email_queue', {
      durable: true,
    });

    channel.sendToQueue('email_queue', Buffer.from(JSON.stringify(data)), {
      persistent: true,
    });
  }
}
