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
    const result = await this.productService.createProduct(body);
    return {
      message: 'Tạo sản phẩm thành công',
      data: result,
    };
  }
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async updateProduct(@Param('id') id: string, @Body() body: UpdateProductDto) {
    const result = await this.productService.updateProduct(id, body);
    return {
      message: 'Cập nhập sản phẩm thành công',
      data: result,
    };
  }
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async deleteProduct(@Param('id') id: string) {
    const result = await this.productService.deleteProduct(id);
    return {
      message: 'Xóa sản phẩm thành công',
      data: result,
    };
  }
  @Get('brands')
  @HttpCode(HttpStatus.OK)
  async loadAllBrands() {
    const result = await this.productService.loadAllBrands();
    return {
      message: 'Lấy hãng sản xuất thành công',
      data: result,
    };
  }
  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.USER)
  @HttpCode(HttpStatus.OK)
  async listProducts(@Query() query: SearchProductsDto) {
    const result = await this.productService.searchProducts(query);
    return {
      message: 'Lấy danh sách sản phẩm thành công',
      data: result,
    };
  }
  @Get(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.USER)
  @HttpCode(HttpStatus.OK)
  async getProductById(@Param('id') id: string) {
    const result = this.productService.getProductById(id);
    return {
      message: 'Lấy sản phẩm theo id thành công',
      data: result,
    };
  }
}
