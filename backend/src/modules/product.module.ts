import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductAbstract } from 'src/abstracts/product.abstract';

import { UserAbstract } from 'src/abstracts/user.abstract';
import { ProductController } from 'src/controllers/product.controller';
import { UserController } from 'src/controllers/user.controller';
import { ProductRepository } from 'src/repositories/product.repositories';
import { UserRepository } from 'src/repositories/user.repositories';
import { Product, ProductSchema } from 'src/schemas/product.schema';
import { User, UserSchema } from 'src/schemas/user.schema';
import { ProductService } from 'src/services/product.service';
import { UserService } from 'src/services/user.service';
import { AuthModule } from './auth.module';
import { PostService } from 'src/services/post.service';
import { PostModule } from './post.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    AuthModule,
    PostModule,
  ],
  controllers: [ProductController],
  providers: [
    ProductRepository,
    {
      provide: ProductAbstract,
      useClass: ProductService,
    },
  ],
  exports: [ProductAbstract, ProductRepository],
})
export class ProductModule {}
