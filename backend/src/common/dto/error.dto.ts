import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ErrorDetailDto {
  @ApiPropertyOptional()
  property?: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  message: string;
}

export class ErrorDto {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  error: string;

  @ApiProperty()
  message: string;

  @ApiPropertyOptional()
  errorCode?: string;

  @ApiPropertyOptional({ type: ErrorDetailDto, isArray: true })
  details?: ErrorDetailDto[];

  @ApiPropertyOptional()
  stack?: string;

  @ApiPropertyOptional()
  trace?: any;
}