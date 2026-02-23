import { IsArray, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { OtherFeatures, ProductStatus } from 'src/schemas/product.schema';

export class UpdateProductDto {
  @IsOptional()
  @IsArray()
  image?: string[];

  @IsOptional()
  @IsArray()
  video?: string[];

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  weight?: number;

  @IsOptional()
  @IsString()
  status?: ProductStatus;

  @IsOptional()
  @IsString()
  warranty_period?: number;

  @IsOptional()
  @IsString()
  business_phone?: string;

  @IsOptional()
  @IsString()
  voltage?: string;

  @IsOptional()
  @IsString()
  features?: OtherFeatures[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;
}
