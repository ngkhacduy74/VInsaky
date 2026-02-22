import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { BaseResponseDto } from 'src/common/dto/base-response.dto';
import { UserRepository } from 'src/repositories/user.repositories';
import { PostRepository } from 'src/repositories/post.repositories';

import { CreatePostDto } from 'src/dtos/request/post/create-post.dto';
import { GetAllPostQueryDto } from 'src/dtos/request/post/get-all-post.dto';
import { PostResponseDto } from 'src/dtos/response/post.dto';
import { PaginationResponse } from 'src/dtos/response/paging.dto';
import { PostAbstract } from 'src/abstracts/post.abstract';
import { UpdatePostDto } from 'src/dtos/request/post/update-post.dto';
import { ChangePostConditionDto } from 'src/dtos/request/post/change-post-condition.dto';
import { CreateCommentDto } from 'src/dtos/request/post/create-comment.dto';

@Injectable()
export class PostService implements PostAbstract {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async createPost(
    data: CreatePostDto,
    user_id: string,
  ): Promise<BaseResponseDto<PostResponseDto>> {
    if (!user_id) throw new UnauthorizedException('Bạn chưa đăng nhập');

    const user = await this.userRepository.findByUserId(user_id);
    if (!user) throw new NotFoundException('User không tồn tại');

    try {
      const created = await this.postRepository.create({
        ...data,
        seller: user,
        status: (data as any).status,
      });

      const dto = plainToInstance(PostResponseDto, created.toObject(), {
        excludeExtraneousValues: true,
      });

      return { success: true, message: 'Tạo bài đăng thành công', data: dto };
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new ConflictException('Dữ liệu bị trùng (duplicate key)');
      }
      throw new InternalServerErrorException(
        err?.message || 'Tạo bài đăng thất bại',
      );
    }
  }

  async loadMyPost(
    user_id: string,
    data: GetAllPostQueryDto,
  ): Promise<BaseResponseDto<PaginationResponse<PostResponseDto>>> {
    if (!user_id) throw new UnauthorizedException('Bạn chưa đăng nhập');

    const limit = Math.min(Math.max(Number((data as any)?.limit ?? 10), 1), 50);
    const skip = Math.max(Number((data as any)?.skip ?? 0), 0);

    const filter: Record<string, any> = {
      'seller.id': user_id,
    };

    if ((data as any)?.status) filter.status = (data as any).status;
    if ((data as any)?.category) filter.category = (data as any).category;
    if ((data as any)?.condition) filter.condition = (data as any).condition;

    const keyword = (data as any)?.keyword?.trim();
    if (keyword) {
      filter.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
      ];
    }

    try {
      const [total, posts] = await Promise.all([
        this.postRepository.count(filter),
        this.postRepository.findMany(filter, {
          skip,
          limit,
          sort: { createdAt: -1 },
        }),
      ]);

      const items = plainToInstance(
        PostResponseDto,
        posts.map((p) => p.toObject()),
        { excludeExtraneousValues: true },
      );

      return {
        success: true,
        message: 'Lấy bài đăng của bạn thành công',
        data: { items, total, skip, limit },
      };
    } catch (err: any) {
      throw new InternalServerErrorException(
        err?.message || 'Lấy bài đăng thất bại',
      );
    }
  }

  async loadAllPost(
    data: GetAllPostQueryDto,
  ): Promise<BaseResponseDto<PaginationResponse<PostResponseDto>>> {
    const limit = Math.min(Math.max(Number((data as any)?.limit ?? 10), 1), 50);
    const skip = Math.max(Number((data as any)?.skip ?? 0), 0);

    const filter: Record<string, any> = {};

    if ((data as any)?.status) filter.status = (data as any).status;
    if ((data as any)?.category) filter.category = (data as any).category;
    if ((data as any)?.condition) filter.condition = (data as any).condition;

    const keyword = (data as any)?.keyword?.trim();
    if (keyword) {
      filter.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
      ];
    }

    try {
      const [total, posts] = await Promise.all([
        this.postRepository.count(filter),
        this.postRepository.findMany(filter, {
          skip,
          limit,
          sort: { createdAt: -1 },
        }),
      ]);

      const items = plainToInstance(
        PostResponseDto,
        posts.map((p) => p.toObject()),
        { excludeExtraneousValues: true },
      );

      return {
        success: true,
        message: 'Lấy danh sách bài đăng thành công',
        data: { items, total, skip, limit },
      };
    } catch (err: any) {
      throw new InternalServerErrorException(
        err?.message || 'Lấy danh sách bài đăng thất bại',
      );
    }
  }
  async getPostById(
    id: string,
    user_id?: string,
  ): Promise<BaseResponseDto<PostResponseDto>> {
    try {
      const post = await this.postRepository.findById(id);

      if (!post) {
        throw new NotFoundException('Bài đăng không tồn tại');
      }

      const dto = plainToInstance(PostResponseDto, post.toObject(), {
        excludeExtraneousValues: true,
      });

      return {
        success: true,
        message: 'Lấy bài đăng thành công',
        data: dto,
      };
    } catch (err: any) {
      if (err?.name === 'CastError') {
        throw new NotFoundException('ID bài đăng không hợp lệ');
      }
      throw new InternalServerErrorException(
        err?.message || 'Lấy bài đăng thất bại',
      );
    }
  }
  async updatePost(
    id: string,
    data: UpdatePostDto,
    user_id: string,
  ): Promise<BaseResponseDto<PostResponseDto>> {
    if (!user_id) throw new UnauthorizedException('Bạn chưa đăng nhập');

    try {
      const post = await this.postRepository.findById(id);
      if (!post) throw new NotFoundException('Bài đăng không tồn tại');

      const ownerId = (post as any)?.seller?.id;
      if (!ownerId || ownerId !== user_id) {
        throw new UnauthorizedException(
          'Bạn không có quyền cập nhật bài đăng này',
        );
      }

      const updatePayload: Record<string, any> = { ...data };
      delete updatePayload.seller;
      delete updatePayload.likes;
      delete updatePayload.favorites;
      delete updatePayload.comments;
      delete updatePayload.createdAt;
      delete updatePayload.updatedAt;
      delete updatePayload.id;

      const updated = await this.postRepository.updateById(id, updatePayload);
      if (!updated) throw new NotFoundException('Cập nhật thất bại');

      const dto = plainToInstance(PostResponseDto, updated.toObject(), {
        excludeExtraneousValues: true,
      });

      return {
        success: true,
        message: 'Cập nhật bài đăng thành công',
        data: dto,
      };
    } catch (err: any) {
      if (err?.name === 'CastError') {
        throw new NotFoundException('ID bài đăng không hợp lệ');
      }
      if (err?.status) throw err;

      throw new InternalServerErrorException(
        err?.message || 'Cập nhật bài đăng thất bại',
      );
    }
  }
  async deletePost(
    id: string,
    user_id: string,
  ): Promise<BaseResponseDto<PostResponseDto>> {
    if (!user_id) throw new UnauthorizedException('Bạn chưa đăng nhập');

    try {
      const post = await this.postRepository.findById(id);
      if (!post) throw new NotFoundException('Bài đăng không tồn tại');

      const ownerId = (post as any)?.seller?.id;
      if (!ownerId || ownerId !== user_id) {
        throw new UnauthorizedException('Bạn không có quyền xóa bài đăng này');
      }

      const deleted = await this.postRepository.deleteById(id);
      if (!deleted)
        throw new InternalServerErrorException('Xóa bài đăng thất bại');

      const dto = plainToInstance(PostResponseDto, deleted.toObject(), {
        excludeExtraneousValues: true,
      });

      return {
        success: true,
        message: 'Xóa bài đăng thành công',
        data: dto,
      };
    } catch (err: any) {
      if (err?.name === 'CastError') {
        throw new NotFoundException('ID bài đăng không hợp lệ');
      }

      if (err?.status) throw err;

      throw new InternalServerErrorException(
        err?.message || 'Xóa bài đăng thất bại',
      );
    }
  }
  async changePostCondition(
    id: string,
    data: ChangePostConditionDto,
    user_id: string,
  ): Promise<BaseResponseDto<PostResponseDto>> {
    if (!user_id) throw new UnauthorizedException('Bạn chưa đăng nhập');

    try {
      const post = await this.postRepository.findById(id);
      if (!post) throw new NotFoundException('Bài đăng không tồn tại');

      const ownerId = (post as any)?.seller?.id;
      if (!ownerId || ownerId !== user_id) {
        throw new UnauthorizedException(
          'Bạn không có quyền thay đổi trạng thái bài đăng này',
        );
      }

      const updatePayload = { condition: data.condition };

      const updated = await this.postRepository.updateById(id, updatePayload);
      if (!updated)
        throw new InternalServerErrorException('Cập nhật trạng thái thất bại');

      const dto = plainToInstance(PostResponseDto, updated.toObject(), {
        excludeExtraneousValues: true,
      });

      return {
        success: true,
        message: 'Thay đổi trạng thái bài đăng thành công',
        data: dto,
      };
    } catch (err: any) {
      if (err?.name === 'CastError') {
        throw new NotFoundException('ID bài đăng không hợp lệ');
      }

      if (err?.status) throw err;

      throw new InternalServerErrorException(
        err?.message || 'Thay đổi trạng thái bài đăng thất bại',
      );
    }
  }
  async addComment(
    id: string,
    user_id: string,
    data: CreateCommentDto,
  ): Promise<BaseResponseDto<PostResponseDto>> {
    if (!user_id) throw new UnauthorizedException('Bạn chưa đăng nhập');

    try {
      const post = await this.postRepository.findById(id);
      if (!post) throw new NotFoundException('Bài đăng không tồn tại');

      const newComment = {
        user_id: user_id,
        content: data.content,
        createdAt: new Date(),
      };

      const updated = await this.postRepository.updateById(id, {
        $push: { comments: newComment },
      });

      if (!updated)
        throw new InternalServerErrorException('Thêm bình luận thất bại');

      const dto = plainToInstance(PostResponseDto, updated.toObject(), {
        excludeExtraneousValues: true,
      });

      return {
        success: true,
        message: 'Thêm bình luận thành công',
        data: dto,
      };
    } catch (err: any) {
      if (err?.name === 'CastError') {
        throw new NotFoundException('ID bài đăng không hợp lệ');
      }

      if (err?.status) throw err;

      throw new InternalServerErrorException(
        err?.message || 'Thêm bình luận thất bại',
      );
    }
  }
  async toggleLike(
    id: string,
    user_id: string,
  ): Promise<BaseResponseDto<PostResponseDto>> {
    if (!user_id) throw new UnauthorizedException('Bạn chưa đăng nhập');

    try {
      const post = await this.postRepository.findById(id);
      if (!post) throw new NotFoundException('Bài đăng không tồn tại');

      const isLiked = post.likes.includes(user_id);

      const updateQuery = isLiked
        ? { $pull: { likes: user_id } }
        : { $addToSet: { likes: user_id } };

      const updated = await this.postRepository.updateById(id, updateQuery);
      if (!updated) throw new InternalServerErrorException('Thao tác thất bại');

      const dto = plainToInstance(PostResponseDto, updated.toObject(), {
        excludeExtraneousValues: true,
      });

      return {
        success: true,
        message: isLiked
          ? 'Bỏ thích bài đăng thành công'
          : 'Thích bài đăng thành công',
        data: dto,
      };
    } catch (err: any) {
      if (err?.name === 'CastError') {
        throw new NotFoundException('ID bài đăng không hợp lệ');
      }

      if (err?.status) throw err;

      throw new InternalServerErrorException(
        err?.message || 'Thao tác thất bại',
      );
    }
  }
  async toggleFavorite(
    id: string,
    user_id: string,
  ): Promise<BaseResponseDto<PostResponseDto>> {
    if (!user_id) throw new UnauthorizedException('Bạn chưa đăng nhập');

    try {
      const post = await this.postRepository.findById(id);
      if (!post) throw new NotFoundException('Bài đăng không tồn tại');

      const isFavorited = (post.favorites || []).includes(user_id);

      const updateQuery = isFavorited
        ? { $pull: { favorites: user_id } }
        : { $addToSet: { favorites: user_id } };

      const updated = await this.postRepository.updateById(id, updateQuery);
      if (!updated)
        throw new InternalServerErrorException('Thao tác lưu bài thất bại');

      const dto = plainToInstance(PostResponseDto, updated.toObject(), {
        excludeExtraneousValues: true,
      });

      return {
        success: true,
        message: isFavorited ? 'Đã bỏ lưu bài đăng' : 'Lưu bài đăng thành công',
        data: dto,
      };
    } catch (err: any) {
      if (err?.name === 'CastError') {
        throw new NotFoundException('ID bài đăng không hợp lệ');
      }

      if (err?.status) throw err;

      throw new InternalServerErrorException(
        err?.message || 'Thao tác lưu bài thất bại',
      );
    }
  }
}
