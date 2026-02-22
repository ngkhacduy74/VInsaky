import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PostAbstract } from 'src/abstracts/post.abstract';
import { Role, Roles } from 'src/decorators/role.decorator';
import { ChangePostConditionDto } from 'src/dtos/request/post/change-post-condition.dto';
import { CreateCommentDto } from 'src/dtos/request/post/create-comment.dto';
import { CreatePostDto } from 'src/dtos/request/post/create-post.dto';
import { GetAllPostQueryDto } from 'src/dtos/request/post/get-all-post.dto';
import { UpdatePostDto } from 'src/dtos/request/post/update-post.dto';
import { JwtAuthGuard } from 'src/guard/permission.guard';
import { RoleGuard } from 'src/guard/role.guard';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostAbstract) {}
  @Get('me')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.USER, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async getMyPosts(@Req() req: any, @Query() query: GetAllPostQueryDto) {
    const result = await this.postService.loadMyPost(req.user.user.id, query);
    return {
      message: 'Lấy bài đăng của tôi thành công',
      data: result,
    };
  }
  @Patch(':id/condition')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async changeCondition(
    @Param('id') id: string,
    @Body() body: ChangePostConditionDto,
    @Req() req: any,
  ) {
    const result = await this.postService.changePostCondition(
      id,
      body,
      req.user.user.id,
    );
    return {
      message: 'Đổi trạng thái bài đăng thành công',
      data: result,
    };
  }
  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.USER, Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async createPost(@Body() body: CreatePostDto, @Req() req: any) {
    const result = await this.postService.createPost(body, req.user.user.id);
    return {
      message: 'Tạo bài đăng thành công',
      data: result,
    };
  }
  @Get()
  @HttpCode(HttpStatus.OK)
  async loadAllPost(@Query() query: GetAllPostQueryDto) {
    const result = await this.postService.loadAllPost(query);
    return {
      message: 'Lấy danh sách bài đăng thành công',
      data: result,
    };
  }
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getPostById(@Param('id') id: string, @Req() req: any) {
    const result = await this.postService.getPostById(id, req.user.user.id);
    return {
      message: 'Lấy bài đăng thành công',
      data: result,
    };
  }
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.USER, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async updatePost(
    @Param('id') id: string,
    @Body() body: UpdatePostDto,
    @Req() req: any,
  ) {
    const result = await this.postService.updatePost(
      id,
      body,
      req.user.user.id,
    );
    return {
      message: 'Cập nhật bài đăng thành công',
      data: result,
    };
  }
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.USER, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async deletePost(@Param('id') id: string, @Req() req: any) {
    const result = await this.postService.deletePost(id, req.user.user.id);
    return {
      message: 'Xóa bài đăng thành công',
      data: result,
    };
  }
  @Post(':id/comment')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.USER, Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async addComment(
    @Param('id') id: string,
    @Body() body: CreateCommentDto,
    @Req() req: any,
  ) {
    const result = await this.postService.addComment(
      id,
      req.user.user.id,
      body,
    );
    return {
      message: 'Bình luận thành công',
      data: result,
    };
  }
  @Post(':id/like')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.USER, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async toggleLike(@Param('id') id: string, @Req() req: any) {
    const result = await this.postService.toggleLike(id, req.user.user.id);
    return {
      message: 'Cập nhật like thành công',
      data: result,
    };
  }
  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.USER, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async toggleFavorite(@Param('id') id: string, @Req() req: any) {
    const result = await this.postService.toggleFavorite(id, req.user.user.id);
    return {
      message: 'Cập nhật yêu thích thành công',
      data: result,
    };
  }
}
