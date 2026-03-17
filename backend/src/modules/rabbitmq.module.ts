import { Module } from '@nestjs/common';
import { RabbitMQService } from 'src/configs/rabbitmq.config';

import { MailModule } from './mail.module';
import { EmailConsumer } from 'src/services/rabbitmq/consumers/email.consumer';
import { EmailProducer } from 'src/services/rabbitmq/producers/email.producer';

@Module({
  imports: [MailModule],
  providers: [RabbitMQService, EmailConsumer, EmailProducer],
  exports: [RabbitMQService, EmailProducer, EmailConsumer],
})
export class RabbitMQModule {}
