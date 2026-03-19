import { applyDecorators, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse, ApiCreatedResponse, ApiResponse } from '@nestjs/swagger';
import { STATUS_CODES } from 'http';
import { ErrorDto } from 'src/common/dto/error.dto';
import { Serialize } from 'src/interceptors/serialize.interceptor';

interface IApiUserAuthOptions {
  summary?: string;
  type?: any; // DTO trả về
  statusCode?: number;
  errorResponses?: number[];
}

export const ApiDescription = (options: IApiUserAuthOptions = {}): MethodDecorator => {
  const defaultStatusCode = HttpStatus.OK;
  const defaultErrorResponses = [
    HttpStatus.BAD_REQUEST,
    HttpStatus.UNAUTHORIZED,
    HttpStatus.FORBIDDEN,
    HttpStatus.NOT_FOUND,
    HttpStatus.UNPROCESSABLE_ENTITY,
    HttpStatus.INTERNAL_SERVER_ERROR,
  ];

  const okResponse = {
    type: options.type,
    description: 'OK',
  };

  const errorResponses = (options.errorResponses || defaultErrorResponses)?.map(
    (statusCode) =>
      ApiResponse({
        status: statusCode,
        type: ErrorDto,
        description: STATUS_CODES[statusCode],
      }),
  );

  const serializers: Array<ClassDecorator | MethodDecorator | PropertyDecorator> = [];
  
  if (typeof options.type === 'function') {
    serializers.push(Serialize(options.type));
  }

  return applyDecorators(
    ApiOperation({ summary: options.summary }),
    HttpCode(options.statusCode || defaultStatusCode),
    options.statusCode === 201 ? ApiCreatedResponse(okResponse) : ApiOkResponse(okResponse),
    ApiBearerAuth(),
    ...serializers,
    ...(errorResponses || []),
  );
};