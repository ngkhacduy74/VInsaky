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
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserAbstract } from 'src/abstracts/services/user.abstract';
import { ApiDescription } from 'src/decorators/http.decorators';
import { Role, Roles } from 'src/decorators/role.decorator';
import { GetAllUserQueryDto } from 'src/dtos/request/user/get-all-user-query.dto';
import { UpdateUserDto } from 'src/dtos/request/user/update-user.dto';
import { PublicUserDto, UpdateUserResponseDto } from 'src/dtos/response/user.dto';

import { JwtAuthGuard } from 'src/guard/permission.guard';
import { RoleGuard } from 'src/guard/role.guard';
@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserAbstract) {}

  @Get('all')
  @ApiDescription({ summary: 'Lấy danh sách tất cả người dùng' ,type: PublicUserDto})
  @HttpCode(HttpStatus.OK)
  async getAllUser(@Query() data: GetAllUserQueryDto) {
    return await this.userService.getAllUser(data);
  }

  @Get('me')
  @ApiDescription({ summary: 'Lấy thông tin người dùng hiện tại' ,type: PublicUserDto})
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: any) {
    return await this.userService.getUserById(req.user.id);
  }

  @Get(':id')
  @ApiDescription({ summary: 'Lấy thông tin người dùng theo ID' ,type: PublicUserDto})
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async getUserById(@Param('id') id: string) {
    return await this.userService.getUserById(id);
  }

  @Patch(':id')
  @ApiDescription({ summary: 'Cập nhật thông tin người dùng' ,type: PublicUserDto})
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.USER)
  async updateUser(@Param('id') id: string, @Body() data: UpdateUserResponseDto) {
    return await this.userService.updateUser(id, data);
  }
  @Get('email/:email')
  @ApiDescription({ summary: 'Lấy thông tin người dùng theo email' ,type: PublicUserDto})
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.USER)
  async getUserByEmail(@Param('email') email: string) {
    return await this.userService.getUserByEmail(email);
  }

  @Post('upgrade/init')
  @ApiDescription({ summary: 'Khởi tạo nâng cấp tài khoản' ,type: UpdateUserResponseDto})
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.USER)
  async upgradeInit(@Req() req: any) {
    return await this.userService.upgradeInit(req.user.id);
  }
}
