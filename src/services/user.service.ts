import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { BaseResponseDto } from 'src/common/dto/base-response.dto';
import { UserRepository } from 'src/repositories/user.repositories';

import { User } from 'src/schemas/user.schema';
import { UserAbstract } from 'src/abstracts/user.abstract';
import { GetAllUserQueryDto } from 'src/dtos/request/user/get-all-user-query.dto';
import { PaginationResponse } from 'src/dtos/response/paging.dto';
import { DeleteUserDto, PublicUserDto } from 'src/dtos/response/user.dto';
import { UpdateUserDto } from 'src/dtos/request/user/update-user.dto';

@Injectable()
export class UserService implements UserAbstract {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}
  async getAllUser(
    query: GetAllUserQueryDto,
  ): Promise<BaseResponseDto<PaginationResponse<PublicUserDto>>> {
    const {
      skip = 0,
      limit = 10,
      searchTerm,
      statusFilter,
      roleFilter,
    } = query;
    const match: any = {};

    if (searchTerm) {
      match.fullname = { $regex: searchTerm, $options: 'i' };
    }
    if (statusFilter && statusFilter !== 'All') {
      match.is_active = statusFilter === 'Active';
    }

    if (roleFilter && roleFilter !== 'All') {
      match.role = roleFilter;
    }

    const [total, users] = await Promise.all([
      this.userRepository.count(match),
      this.userRepository.findWithPagination(match, skip, limit),
    ]);

    const mappedUsers: PublicUserDto[] = users.map((u) => ({
      id: u.id,
      fullname: u.fullname,
      email: u.email,
      role: u.role,
      ava_img_url: u.ava_img_url,
    }));

    return {
      success: true,
      data: {
        items: mappedUsers,
        total,
        skip,
        limit,
      },
    };
  }
  catch(err: any) {
    throw new InternalServerErrorException({
      message: 'Không lấy được danh sách user',
      errors: err?.message,
    });
  }
  async deleteUser(id: string): Promise<BaseResponseDto<DeleteUserDto>> {
    try {
      const deleted = await this.userRepository.softDeleteByUserId(id);

      if (!deleted) {
        throw new NotFoundException({
          message: 'User not found or already deleted',
          errors: { id: 'NOT_FOUND' },
        });
      }

      const publicUser: PublicUserDto = {
        id: deleted.id,
        fullname: deleted.fullname,
        email: deleted.email,
        role: deleted.role,
        ava_img_url: deleted.ava_img_url,
        phone: deleted.phone,
      };

      return {
        success: true,
        data: {
          deleted: true,
          user: publicUser,
        },
      };
    } catch (err: any) {
      if (err?.status) throw err;

      throw new InternalServerErrorException({
        message: 'Xảy ra lỗi khi xóa tài khoản',
        errors: err?.message,
      });
    }
  }
  async getUserById(id: string): Promise<BaseResponseDto<PublicUserDto>> {
    try {
      const user = await this.userRepository.findByUserId(id);

      if (!user) {
        throw new NotFoundException({
          message: 'Không tìm thấy người dùng',
          errors: { id: 'NOT_FOUND' },
        });
      }

      const publicUser: PublicUserDto = {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        ava_img_url: user.ava_img_url,
        phone: user.phone,
      };

      return {
        success: true,
        data: publicUser,
      };
    } catch (err: any) {
      if (err?.status) throw err;

      throw new InternalServerErrorException({
        message: 'Lỗi khi lấy người dùng theo id',
        errors: err?.message,
      });
    }
  }
  async updateUser(
    id: string,
    dto: UpdateUserDto,
  ): Promise<BaseResponseDto<PublicUserDto>> {
    try {
      const updated = await this.userRepository.updateByUserId(id, {
        ...(dto.fullname !== undefined ? { fullname: dto.fullname } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
        ...(dto.address !== undefined ? { address: dto.address } : {}),
        ...(dto.gender !== undefined ? { gender: dto.gender } : {}),
        ...(dto.ava_img_url !== undefined
          ? { ava_img_url: dto.ava_img_url }
          : {}),
      });

      if (!updated) {
        throw new NotFoundException({
          message: 'Không tìm thấy người dùng',
          errors: { id: 'NOT_FOUND' },
        });
      }
      const publicUser: PublicUserDto = {
        id: updated.id,
        fullname: updated.fullname,
        email: updated.email,
        role: updated.role,
        ava_img_url: updated.ava_img_url,
        phone: updated.phone,
      };

      return { success: true, data: publicUser };
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new ConflictException({
          message: 'Email đã được sử dụng',
          errors: { email: 'EMAIL_EXISTS' },
        });
      }
      if (err?.status) throw err;

      throw new InternalServerErrorException({
        message: 'Xảy ra lỗi khi cập nhập người dùng',
        errors: err?.message,
      });
    }
  }
}
