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
    return await this.postService.loadMyPost(req.user.user.id, query);
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
    return await this.postService.changePostCondition(
      id,
      body,
      req.user.user.id,
    );
  }
  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.USER, Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async createPost(@Body() body: CreatePostDto, @Req() req: any) {
    return await this.postService.createPost(body, req.user.user.id);
  }
  @Get()
  @HttpCode(HttpStatus.OK)
  async loadAllPost(@Query() query: GetAllPostQueryDto) {
    return await this.postService.loadAllPost(query);
  }
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getPostById(@Param('id') id: string, @Req() req: any) {
    return await this.postService.getPostById(id, req?.user?.user?.id);
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
    return await this.postService.updatePost(id, body, req.user.user.id);
  }
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.USER, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async deletePost(@Param('id') id: string, @Req() req: any) {
    return await this.postService.deletePost(id, req.user.user.id);
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
    return await this.postService.addComment(id, req.user.user.id, body);
  }
  @Post(':id/like')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.USER, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async toggleLike(@Param('id') id: string, @Req() req: any) {
    return await this.postService.toggleLike(id, req.user.user.id);
  }
  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.USER, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async toggleFavorite(@Param('id') id: string, @Req() req: any) {
    return await this.postService.toggleFavorite(id, req.user.user.id);
  }
}
