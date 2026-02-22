import { Expose, Transform, Type } from 'class-transformer';
import { OtherFeatures, ProductStatus } from 'src/schemas/product.schema';

export class CreatorResponseDto {
  @Expose()
  email: string;
}

export class ProductResponseDto {
  @Expose()
  id: string;

  @Expose()
  @Transform(({ obj }) => obj._id?.toString())
  _id: string;

  @Expose()
  name: string;

  @Expose()
  brand: string;

  @Expose()
  price: number;

  @Expose()
  image: string[];

  @Expose()
  video: string[];

  @Expose()
  description: string;

  @Expose()
  size?: string;

  @Expose()
  weight?: number;

  @Expose()
  status?: ProductStatus;

  @Expose()
  warranty_period?: number;

  @Expose()
  business_phone?: string;

  @Expose()
  voltage?: string;

  @Expose()
  features?: OtherFeatures[];

  @Expose()
  quantity?: number;

  @Expose()
  @Type(() => CreatorResponseDto)
  creator: CreatorResponseDto;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
