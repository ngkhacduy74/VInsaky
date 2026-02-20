import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthAbstract } from 'src/abstracts/auth.abstract';
import { UserAbstract } from 'src/abstracts/user.abstract';
import { Role, Roles } from 'src/decorators/role.decorator';
import { GetAllUserQueryDto } from 'src/dtos/request/user/get-all-user-query.dto';
import { UpdateUserDto } from 'src/dtos/request/user/update-user.dto';

import { JwtAuthGuard } from 'src/guard/permission.guard';
import { RoleGuard } from 'src/guard/role.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserAbstract) {}

  @Get('all')
  @HttpCode(HttpStatus.OK)
  async getAllUser(@Query() data: GetAllUserQueryDto) {
    const result = await this.userService.getAllUser(data);
    return { message: 'Lấy tất cả user thành công', data: result };
  }
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async getUserById(@Param('id') id: string) {
    const result = await this.userService.getUserById(id);
    return { message: 'Lấy thông tin người dùng thành công', data: result };
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.USER)
  async updateUser(@Param('id') id: string, @Body() data: UpdateUserDto) {
    const result = await this.userService.updateUser(id, data);
    return {
      message: 'Cập nhập thông tin người dùng thành công',
      data: result,
    };
  }
}
