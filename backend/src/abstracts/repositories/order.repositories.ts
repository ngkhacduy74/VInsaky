import { ClientSession } from "mongoose";
import { CreateOrderDto } from "src/dtos/request/order/create-order.dto";
import { OrderDocument } from "src/schemas/order.schema";
import { UserDocument } from "src/schemas/user.schema";

export abstract class OrderRepoAbstract {
  abstract startTransactionSession(): Promise<ClientSession>;
  abstract createOrder(
    userId: string | undefined,
     dto: CreateOrderDto,
     invoice: string,
     total_prices: number,
     session?: ClientSession,): Promise<OrderDocument[]>;
  abstract findByInvoice(invoice: string): Promise<OrderDocument | null>;
  abstract markPaid(invoice: string, transactionId?: string, raw?: any): Promise<void>;
  abstract checkTotal(items: CreateOrderDto['items']): Promise<number>;
  abstract markEmailSent(invoice: string, session?: ClientSession): Promise<boolean>;

}
