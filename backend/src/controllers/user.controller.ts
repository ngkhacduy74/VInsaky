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
    return await this.userService.getAllUser(data);
  }
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async getUserById(@Param('id') id: string) {
    return await this.userService.getUserById(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.USER)
  async updateUser(@Param('id') id: string, @Body() data: UpdateUserDto) {
    return await this.userService.updateUser(id, data);
  }
  @Get('email/:email')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.USER)
  async getUserByEmail(@Param('email') email: string) {
    return await this.userService.getUserByEmail(email);
  }

  @Post('upgrade/init')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.USER)
  async upgradeInit(@Req() req: any) {
    return await this.userService.upgradeInit(req.user.id);
  }
}
