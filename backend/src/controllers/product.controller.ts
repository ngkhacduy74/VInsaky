import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProductAbstract } from 'src/abstracts/product.abstract';
import { Role, Roles } from 'src/decorators/role.decorator';
import { CreateProductDto } from 'src/dtos/request/product/create-product.dto';
import { SearchProductsDto } from 'src/dtos/request/product/search-product.dto';
import { UpdateProductDto } from 'src/dtos/request/product/update-product.dto';
import { JwtAuthGuard } from 'src/guard/permission.guard';
import { RoleGuard } from 'src/guard/role.guard';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductAbstract) {}
  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async createProduct(@Body() body: CreateProductDto) {
    return await this.productService.createProduct(body);
  }
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async updateProduct(@Param('id') id: string, @Body() body: UpdateProductDto) {
    return await this.productService.updateProduct(id, body);
  }
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async deleteProduct(@Param('id') id: string) {
    return await this.productService.deleteProduct(id);
  }
  @Get('brands')
  @HttpCode(HttpStatus.OK)
  async loadAllBrands() {
    return await this.productService.loadAllBrands();
  }
  @Get()
  // @UseGuards(JwtAuthGuard, RoleGuard)
  // @Roles(Role.ADMIN, Role.USER)
  @HttpCode(HttpStatus.OK)
  async listProducts(@Query() query: SearchProductsDto) {
    return await this.productService.searchProducts(query);
  }
  @Get(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.USER)
  @HttpCode(HttpStatus.OK)
  async getProductById(@Param('id') id: string) {
    return await this.productService.getProductById(id);
  }
}
