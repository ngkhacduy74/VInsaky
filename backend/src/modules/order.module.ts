import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderAbstract } from 'src/abstracts/services/order.abstract';
import { OrdersController } from 'src/controllers/order.controller';
import { OrderRepository } from 'src/repositories/order.repositories';
import { Order, OrderSchema } from 'src/schemas/order.schema';
import { OrderService } from 'src/services/order.service';
import { ProductModule } from './product.module';
import { MailModule } from './mail.module';

import { UserModule } from './user.module';
import { OrderRepoAbstract } from 'src/abstracts/repositories/order.repositories';

@Module({
  imports: [MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]), ProductModule, MailModule, UserModule],
  controllers: [OrdersController],
  providers: [OrderService, OrderRepository, {
        provide: OrderAbstract,
        useClass: OrderService,
      },
    {
        provide: OrderRepoAbstract,
        useClass: OrderRepository,
      }],
})
export class OrdersModule {}