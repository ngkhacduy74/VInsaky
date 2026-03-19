import { ClientSession } from "mongoose";
import { CreateOrderItemDto } from "src/dtos/request/order/create-order.dto";
import { Product, ProductDocument } from "src/schemas/product.schema";


export abstract class ProductRepoAbstract {
    abstract createProduct(payload: Partial<Product>): Promise<ProductDocument>;
    abstract findAllProducts(skip: number, limit: number): Promise<ProductDocument[]>;
    abstract countAllProducts(): Promise<number>;
    abstract findByProductId(id: string): Promise<ProductDocument | null>;
    abstract loadAllBrands(): Promise<string[]>;
    abstract updateByProductId(id: string, data: any): Promise<ProductDocument | null>;
    abstract deleteByProductId(id: string): Promise<ProductDocument | null>;
    abstract searchProducts(
        query: Record<string, any>,
        skip: number,
        limit: number,
        sort: Record<string, 1 | -1>
    ): Promise<ProductDocument[]>;
    abstract countSearchProducts(query: Record<string, any>): Promise<number>;
    abstract decrementIfEnough(
        productId: string,
        qty: number,
        session?: ClientSession
    ): Promise<boolean>;
    abstract checkAndReserveStock(items: CreateOrderItemDto[], session?: ClientSession): Promise<{ ok: true } | { ok: false; failedItemName: string }>; 
}
