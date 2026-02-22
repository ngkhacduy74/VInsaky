import { BaseResponseDto } from 'src/common/dto/base-response.dto';
import { CreateOrderDto } from 'src/dtos/request/order/create-order.dto';
import { OrderResponseDto } from 'src/dtos/response/order.dto';
import { SepayCheckoutResponseDto } from 'src/dtos/response/sepay-checkout-response.dto';


export abstract class OrderAbstract {
  abstract checkoutSepay(
    userId: string | undefined,
    payload: CreateOrderDto, 
  ): Promise<BaseResponseDto<SepayCheckoutResponseDto>>;

  abstract handleSepayIpn(
    headers: Record<string, any>,
    body: any,
  ): Promise<BaseResponseDto<null>>;

  abstract getOrderByInvoice(
    invoice: string,
  ): Promise<BaseResponseDto<OrderResponseDto>>;
}