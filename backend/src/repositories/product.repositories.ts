import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, UpdateQuery } from 'mongoose';
import { LoginDto } from 'src/dtos/request/auth/login.dto';
import { CreateOrderItemDto } from 'src/dtos/request/order/create-order.dto';
import { Product, ProductDocument } from 'src/schemas/product.schema';
import { User, UserDocument } from 'src/schemas/user.schema';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}
  async createProduct(payload: Partial<Product>): Promise<ProductDocument> {
    const doc = new this.productModel(payload);
    return await doc.save();
  }
  async findAllProducts(skip: number, limit: number) {
    return this.productModel
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();
  }
  async countAllProducts(): Promise<number> {
    return this.productModel.countDocuments({}).exec();
  }
  async findByProductId(id: string): Promise<ProductDocument | null> {
    return await this.productModel.findOne({ id }).exec();
  }
  async loadAllBrands(): Promise<string[]> {
    return this.productModel.distinct('brand').exec();
  }
  async updateByProductId(id: string, data: any) {
    return this.productModel
      .findOneAndUpdate({ id }, { $set: data }, { new: true })
      .exec();
  }
  async deleteByProductId(id: string) {
    return this.productModel.findOneAndDelete({ id }).exec();
  }
  async searchProducts(
    query: Record<string, any>,
    skip: number,
    limit: number,
    sort: Record<string, 1 | -1>,
  ) {
    return this.productModel
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();
  }

  async countSearchProducts(query: Record<string, any>): Promise<number> {
    return this.productModel.countDocuments(query).exec();
  }
   async decrementIfEnough(
    productId: string,
    qty: number,
    session?: ClientSession,
  ): Promise<boolean> {
    const res = await this.productModel.updateOne(
      { id: productId, quantity: { $gte: qty } },
      { $inc: { quantity: -qty } },
      session ? { session } : undefined,
    );
    return res.modifiedCount > 0;
  }

  async checkAndReserveStock(items: CreateOrderItemDto[], session?: ClientSession): Promise<{ ok: true } | { ok: false; failedIndex: number }> {
    for (let i = 0; i < items.length; i++) {
      const ok = await this.decrementIfEnough(items[i].product_id, Number(items[i].quantity), session);
      if (!ok) return { ok: false, failedIndex: i };
    }
    return { ok: true };
  }
}
