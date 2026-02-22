import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument } from 'src/schemas/user.schema';
import { Post, PostDocument } from 'src/schemas/post.schema';
import { Product, ProductDocument } from 'src/schemas/product.schema';
import {
  BannerProduct,
  BannerProductDocument,
} from 'src/schemas/banner.schema';

@Injectable()
export class DashboardRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(BannerProduct.name)
    private readonly bannerModel: Model<BannerProductDocument>,
  ) {}

  countUsers(filter: Record<string, any> = {}) {
    return this.userModel.countDocuments(filter);
  }

  countPosts(filter: Record<string, any> = {}) {
    return this.postModel.countDocuments(filter);
  }

  countProducts(filter: Record<string, any> = {}) {
    return this.productModel.countDocuments(filter);
  }

  countBanners(filter: Record<string, any> = {}) {
    return this.bannerModel.countDocuments(filter);
  }

  aggregatePostsByMonth(startDate: Date, endDate: Date) {
    return this.postModel.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
  }

  aggregateUsersByMonth(startDate: Date, endDate: Date) {
    return this.userModel.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
  }

  aggregateDailyRegistrations(startDate: Date) {
    return this.userModel.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  aggregateTopCategories(limit: number = 5) {
    return this.productModel.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);
  }

  getRecentPosts(limit: number = 5) {
    return this.postModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('title content createdAt seller');
  }
}
