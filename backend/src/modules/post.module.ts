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
import { PostController } from 'src/controllers/post.controller';
import { PostService } from 'src/services/post.service';
import { PostRepository } from 'src/repositories/post.repositories';
import { PostAbstract } from 'src/abstracts/post.abstract';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    JwtModule,
    UserModule,
  ],
  controllers: [PostController],
  providers: [
    PostRepository,
    PostService,
    {
      provide: PostAbstract,
      useClass: PostService,
    },
  ],
  exports: [PostAbstract, PostRepository],
})
export class PostModule {}
