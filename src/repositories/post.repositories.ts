// src/repositories/post.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from 'src/schemas/post.schema';

@Injectable()
export class PostRepository {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
  ) {}

  create(doc: Partial<Post>): Promise<PostDocument> {
    return this.postModel.create(doc);
  }

  findOne(filter: Partial<Post>) {
    return this.postModel.findOne(filter);
  }

  findById(id: string) {
    return this.postModel.findById(id);
  }

  findByIdWithSeller(id: string) {
    return this.postModel.findById(id).populate('seller');
  }
  count(filter: Record<string, any>) {
    return this.postModel.countDocuments(filter);
  }

  findMany(
    filter: Record<string, any>,
    options: { skip: number; limit: number; sort?: Record<string, 1 | -1> },
  ) {
    const { skip, limit, sort = { createdAt: -1 } } = options;
    return this.postModel.find(filter).sort(sort).skip(skip).limit(limit);
  }
  updateById(id: string, update: Record<string, any>) {
    return this.postModel.findByIdAndUpdate(id, update, { new: true });
  }
}
