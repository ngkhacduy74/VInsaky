import { BaseResponseDto } from 'src/common/dto/base-response.dto';
import { CreateProductDto } from 'src/dtos/request/product/create-product.dto';
import { GetAllProductQueryDto } from 'src/dtos/request/product/get-all-product.dto';
import { SearchProductsDto } from 'src/dtos/request/product/search-product.dto';
import { UpdateProductDto } from 'src/dtos/request/product/update-product.dto';
import { PaginationResponse } from 'src/dtos/response/paging.dto';
import { ProductResponseDto } from 'src/dtos/response/product.dto';

export abstract class ProductAbstract {
  abstract createProduct(
    data: CreateProductDto,
  ): Promise<BaseResponseDto<ProductResponseDto>>;
  abstract updateProduct(
    id: string,
    data: UpdateProductDto,
  ): Promise<BaseResponseDto<ProductResponseDto>>;
  abstract deleteProduct(
    id: string,
  ): Promise<BaseResponseDto<ProductResponseDto>>;
  abstract getProductById(
    id: string,
  ): Promise<BaseResponseDto<ProductResponseDto>>;
  abstract loadAllProduct(
    data: GetAllProductQueryDto,
  ): Promise<BaseResponseDto<PaginationResponse<ProductResponseDto>>>;
  // abstract loadProductByUserEmail(
  //   email: string,
  // ): Promise<BaseResponseDto<PaginationResponse<ProductResponseDto>>>;
  abstract searchProducts(
    data: SearchProductsDto,
  ): Promise<BaseResponseDto<PaginationResponse<ProductResponseDto>>>;
  abstract loadAllBrands(): Promise<any>;
}
