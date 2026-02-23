import { IsArray, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import {
  OtherFeatures,
  Product,
  ProductStatus,
} from 'src/schemas/product.schema';

export class CreateProductDto {
  @IsOptional() @IsArray() image?: string[];
  @IsOptional() @IsArray() video?: string[];

  @IsString() name: string;
  @IsString() brand: string;
  @IsString() category: string;

  @IsNumber() @Min(0) price: number;

  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() size?: string;
  @IsOptional() @IsString() weight?: number;

  @IsOptional() @IsString() status?: ProductStatus;
  @IsOptional() @IsString() warranty_period?: number;
  @IsOptional() @IsString() business_phone?: string;

  @IsOptional() @IsString() voltage?: string;
  @IsOptional() @IsString() features?: OtherFeatures[];

  @IsOptional() @IsNumber() @Min(0) quantity?: number;
}
