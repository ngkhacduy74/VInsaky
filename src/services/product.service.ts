import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { BaseResponseDto } from 'src/common/dto/base-response.dto';
import { ProductAbstract } from 'src/abstracts/product.abstract';
import { ProductRepository } from 'src/repositories/product.repositories';
import { CreateProductDto } from 'src/dtos/request/product/create-product.dto';
import { ProductResponseDto } from 'src/dtos/response/product.dto';
import { plainToInstance } from 'class-transformer';
import { PaginationResponse } from 'src/dtos/response/paging.dto';
import { GetAllProductQueryDto } from 'src/dtos/request/product/get-all-product.dto';
import { UpdateProductDto } from 'src/dtos/request/product/update-product.dto';
import { SearchProductsDto } from 'src/dtos/request/product/search-product.dto';

@Injectable()
export class ProductService implements ProductAbstract {
  constructor(private readonly productRepositories: ProductRepository) {}
  async createProduct(
    data: CreateProductDto,
  ): Promise<BaseResponseDto<ProductResponseDto>> {
    try {
      const created = await this.productRepositories.createProduct(data);
      const plain = created.toObject();
      const response = plainToInstance(ProductResponseDto, plain, {
        excludeExtraneousValues: true,
      });
      return {
        success: true,
        data: response,
      };
    } catch (err) {
      if (err?.code === 11000) {
        const duplicateField =
          (err?.keyPattern && Object.keys(err.keyPattern)[0]) ||
          (err?.keyValue && Object.keys(err.keyValue)[0]) ||
          'unknown';

        throw new ConflictException({
          message: 'Sản phẩm đã tồn tại',
          errors: { [duplicateField]: 'DUPLICATE_KEY' },
        });
      }

      throw new InternalServerErrorException({
        message: 'Tạo sản phẩm thất bại',
        errors: err?.message,
      });
    }
  }
  async loadAllProduct(
    data: GetAllProductQueryDto,
  ): Promise<BaseResponseDto<PaginationResponse<ProductResponseDto>>> {
    try {
      const { skip = 0, limit = 10 } = data;

      const safeSkip = Math.max(0, skip);
      const safeLimit = Math.min(100, Math.max(1, limit));

      const [items, total] = await Promise.all([
        this.productRepositories.findAllProducts(safeSkip, safeLimit),
        this.productRepositories.countAllProducts(),
      ]);

      const responseItems = plainToInstance(ProductResponseDto, items, {
        excludeExtraneousValues: true,
      });

      return {
        success: true,
        data: {
          items: responseItems,
          total,
          skip: safeSkip,
          limit: safeLimit,
        },
      };
    } catch (err: any) {
      throw new InternalServerErrorException({
        message: 'Lấy danh sách sản phẩm thất bại',
        errors: err?.message,
      });
    }
  }
  async getProductById(
    id: string,
  ): Promise<BaseResponseDto<ProductResponseDto>> {
    try {
      if (!id) {
        throw new BadRequestException('Id không được để trống');
      }

      const product = await this.productRepositories.findByProductId(id);

      if (!product) {
        throw new NotFoundException('Không tìm thấy sản phẩm');
      }

      const response = plainToInstance(
        ProductResponseDto,
        product.toObject ? product.toObject() : product,
        { excludeExtraneousValues: true },
      );

      return {
        success: true,
        data: response,
      };
    } catch (err: any) {
      if (
        err instanceof NotFoundException ||
        err instanceof BadRequestException
      ) {
        throw err;
      }

      throw new InternalServerErrorException({
        message: 'Lấy sản phẩm thất bại',
        errors: err?.message,
      });
    }
  }
  async loadAllBrands(): Promise<BaseResponseDto<string[]>> {
    try {
      const brands = await this.productRepositories.loadAllBrands();

      return {
        success: true,
        data: brands,
      };
    } catch (err: any) {
      throw new InternalServerErrorException({
        message: 'Lấy danh sách hãng thất bại',
        errors: err?.message,
      });
    }
  }
  async updateProduct(
    id: string,
    data: UpdateProductDto,
  ): Promise<BaseResponseDto<ProductResponseDto>> {
    try {
      if (!id) {
        throw new BadRequestException('Id không được để trống');
      }
      if (!data || Object.keys(data).length === 0) {
        throw new BadRequestException('Dữ liệu cập nhật không được để trống');
      }

      const updated = await this.productRepositories.updateByProductId(
        id,
        data,
      );

      if (!updated) {
        throw new NotFoundException('Không tìm thấy sản phẩm để cập nhật');
      }

      const response = plainToInstance(
        ProductResponseDto,
        updated.toObject ? updated.toObject() : updated,
        { excludeExtraneousValues: true },
      );

      return {
        success: true,
        data: response,
      };
    } catch (err: any) {
      if (err?.code === 11000) {
        const duplicateField =
          (err?.keyPattern && Object.keys(err.keyPattern)[0]) ||
          (err?.keyValue && Object.keys(err.keyValue)[0]) ||
          'unknown';

        throw new ConflictException({
          message: 'Dữ liệu bị trùng',
          errors: { [duplicateField]: 'DUPLICATE_KEY' },
        });
      }

      if (
        err instanceof BadRequestException ||
        err instanceof NotFoundException ||
        err instanceof ConflictException
      ) {
        throw err;
      }

      throw new InternalServerErrorException({
        message: 'Cập nhật sản phẩm thất bại',
        errors: err?.message,
      });
    }
  }
  async deleteProduct(
    id: string,
  ): Promise<BaseResponseDto<ProductResponseDto>> {
    try {
      if (!id) {
        throw new BadRequestException('Id không được để trống');
      }

      const deleted = await this.productRepositories.deleteByProductId(id);

      if (!deleted) {
        throw new NotFoundException('Không tìm thấy sản phẩm để xóa');
      }

      const response = plainToInstance(
        ProductResponseDto,
        deleted.toObject ? deleted.toObject() : deleted,
        { excludeExtraneousValues: true },
      );

      return {
        success: true,
        data: response,
      };
    } catch (err: any) {
      if (
        err instanceof BadRequestException ||
        err instanceof NotFoundException
      ) {
        throw err;
      }

      throw new InternalServerErrorException({
        message: 'Xóa sản phẩm thất bại',
        errors: err?.message,
      });
    }
  }
  async searchProducts(
    data: SearchProductsDto,
  ): Promise<BaseResponseDto<PaginationResponse<ProductResponseDto>>> {
    try {
      const {
        q,
        category,
        brand,
        status,
        minPrice,
        maxPrice,
        skip = 0,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = data;

      const safeSkip = Math.max(0, skip);
      const safeLimit = Math.min(100, Math.max(1, limit));

      // 🔥 Không dùng FilterQuery nữa
      const query: Record<string, any> = {};

      if (q) {
        query.$or = [
          { name: { $regex: q, $options: 'i' } },
          { brand: { $regex: q, $options: 'i' } },
        ];
      }

      if (category) {
        query.category = category;
      }

      if (brand) {
        query.brand = { $regex: brand, $options: 'i' };
      }

      if (status) {
        query.status = status;
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        query.price = {};
        if (minPrice !== undefined) query.price.$gte = minPrice;
        if (maxPrice !== undefined) query.price.$lte = maxPrice;
      }

      const sort: Record<string, 1 | -1> = {
        [sortBy]: sortOrder === 'desc' ? -1 : 1,
      };

      const [items, total] = await Promise.all([
        this.productRepositories.searchProducts(
          query,
          safeSkip,
          safeLimit,
          sort,
        ),
        this.productRepositories.countSearchProducts(query),
      ]);

      const responseItems = plainToInstance(ProductResponseDto, items, {
        excludeExtraneousValues: true,
      });

      return {
        success: true,
        data: {
          items: responseItems,
          total,
          skip: safeSkip,
          limit: safeLimit,
        },
      };
    } catch (err: any) {
      if (err instanceof BadRequestException) throw err;

      throw new InternalServerErrorException({
        message: 'Tìm kiếm sản phẩm thất bại',
        errors: err?.message,
      });
    }
  }
}
