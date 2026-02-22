import { Module } from '@nestjs/common';

import { UserModule } from './user.module';
import { DashboardController } from 'src/controllers/dashboard.controller';
import { DashboardRepository } from 'src/repositories/dashboard.repositories';
import { DashboardService } from 'src/services/dashboard.service';
import { User, UserSchema } from 'src/schemas/user.schema';
import { Post, PostSchema } from 'src/schemas/post.schema';
import { Product, ProductSchema } from 'src/schemas/product.schema';
import { BannerProduct, BannerProductSchema } from 'src/schemas/banner.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Post.name, schema: PostSchema },
      { name: Product.name, schema: ProductSchema },
      { name: BannerProduct.name, schema: BannerProductSchema },
    ]),
    JwtModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardRepository, DashboardService],
})
export class DashboardModule {}
