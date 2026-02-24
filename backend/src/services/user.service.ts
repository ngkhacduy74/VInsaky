import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { sepaySignature } from 'src/common/shared/function/sepay-sign';

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
    private readonly config: ConfigService,
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
      const createAsciiRegex = (str: string) => {
        return str
          .replace(/[aAàÀảẢãÃáÁạẠăĂằẰẳẲẵẴắẮặẶâÂầẦẩẨẫẪấẤậẬ]/g, '[aAàÀảẢãÃáÁạẠăĂằẰẳẲẵẴắẮặẶâÂầẦẩẨẫẪấẤậẬ]')
          .replace(/[eEèÈẻẺẽẼéÉẹẸêÊềỀểỂễỄếẾệỆ]/g, '[eEèÈẻẺẽẼéÉẹẸêÊềỀểỂễỄếẾệỆ]')
          .replace(/[iIìÌỉỈĩĨíÍịỊ]/g, '[iIìÌỉỈĩĨíÍịỊ]')
          .replace(/[oOòÒỏỎõÕóÓọỌôÔồỒổỔỗỖốỐộỘơƠờỜởỞỡỠớỚợỢ]/g, '[oOòÒỏỎõÕóÓọỌôÔồỒổỔỗỖốỐộỘơƠờỜởỞỡỠớỚợỢ]')
          .replace(/[uUùÙủỦũŨúÚụỤưƯừỪửỬữỮứỨựỰ]/g, '[uUùÙủỦũŨúÚụỤưƯừỪửỬữỮứỨựỰ]')
          .replace(/[yYỳỲỷỶỹỸýÝỵỴ]/g, '[yYỳỲỷỶỹỸýÝỵỴ]')
          .replace(/[dDđĐ]/g, '[dDđĐ]');
      };
      
      const normalizedSearchTerm = createAsciiRegex(searchTerm.toLowerCase());
      match.fullname = { $regex: normalizedSearchTerm, $options: 'i' };
    }
    if (statusFilter && statusFilter !== 'All') {
      const isActive = statusFilter === 'Active';
      match.$or = [
        { is_active: isActive },
        { is_active: isActive ? 'true' : 'false' }
      ];
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
      phone: u.phone,
      is_active: u.is_active,
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
        ...(dto.is_active !== undefined ? { is_active: dto.is_active === true || dto.is_active === 'true' } : {}),
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
  async getUserByEmail(email: string): Promise<BaseResponseDto<PublicUserDto>> {
    try {
      const user = await this.userRepository.findUserByEmail(email);

      if (!user) {
        throw new NotFoundException({
          message: 'Không tìm thấy người dùng với email này',
          errors: { email: 'NOT_FOUND' },
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
        message: 'Lỗi khi lấy người dùng theo email',
        errors: err?.message,
      });
    }
  }

  async upgradeInit(userId: string): Promise<BaseResponseDto<any>> {
    try {
      const user = await this.userRepository.findByUserId(userId);

      if (!user) {
        throw new NotFoundException({
          message: 'Không tìm thấy người dùng',
          errors: { id: 'NOT_FOUND' },
        });
      }

      if (user.isPremium) {
        throw new ConflictException({
          message: 'Tài khoản của bạn đã là VIP',
          errors: { user: 'ALREADY_PREMIUM' },
        });
      }

      const invoice = `INV-VIP-${userId.substring(0, 8)}-${Date.now()}`;
      const upgradePrice = 25000;

      const merchant = this.config.get<string>('SEPAY_MERCHANT');
      const secretKey = this.config.get<string>('SEPAY_SECRET_KEY');
      const baseUrl = this.config.get<string>('SEPAY_BASE_URL');
      const successUrl = this.config.get<string>('SEPAY_SUCCESS_URL');
      const errorUrl = this.config.get<string>('SEPAY_ERROR_URL');
      const cancelUrl = this.config.get<string>('SEPAY_CANCEL_URL');

      if (!merchant || !secretKey || !baseUrl) {
        throw new InternalServerErrorException('Cấu hình thanh toán bị lỗi');
      }

      const fields: Record<string, any> = {
        merchant,
        operation: 'PURCHASE',
        payment_method: 'BANK_TRANSFER',          
        order_amount: String(upgradePrice), 
        currency: 'VND',
        order_invoice_number: invoice,
        order_description: `Nang cap VIP ${user.fullname}`,
        customer_id: userId,
        success_url: successUrl,
        error_url: errorUrl,
        cancel_url: cancelUrl,
      };

      const signature = sepaySignature(secretKey, fields);
      const checkoutUrl = `${baseUrl}/v1/checkout/init`;

      const html = `
<form id="sepay" action="${checkoutUrl}" method="POST">
  ${Object.entries({ ...fields, signature })
    .map(([k, v]) => {
      const safeValue = String(v ?? '').replace(/"/g, '&quot;');
      return '<input type="hidden" name="' + k + '" value="' + safeValue + '" />';
    })
    .join('\n')}
</form>
`;

      return {
        success: true,
        data: { html },
      };
    } catch (err: any) {
      if (err?.status) throw err;
      throw new InternalServerErrorException({
        message: 'Khởi tạo thanh toán lỗi',
        errors: err?.message,
      });
    }
  }
}
