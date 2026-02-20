import { BaseResponseDto } from 'src/common/dto/base-response.dto';
import { GetAllUserQueryDto } from 'src/dtos/request/user/get-all-user-query.dto';
import { UpdateUserDto } from 'src/dtos/request/user/update-user.dto';
import { PaginationResponse } from 'src/dtos/response/paging.dto';
import {
  DeleteUserDto,
  PublicUserDto,
  UpdateUserResponseDto,
} from 'src/dtos/response/user.dto';

export abstract class UserAbstract {
  abstract getAllUser(
    data: GetAllUserQueryDto,
  ): Promise<BaseResponseDto<PaginationResponse<PublicUserDto>>>;
  abstract getUserById(id: string): Promise<BaseResponseDto<PublicUserDto>>;
  abstract updateUser(
    id: string,
    data: UpdateUserDto,
  ): Promise<BaseResponseDto<UpdateUserResponseDto>>;
  abstract deleteUser(id: string): Promise<BaseResponseDto<DeleteUserDto>>;
}
