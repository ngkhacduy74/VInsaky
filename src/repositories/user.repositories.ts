import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateQuery } from 'mongoose';
import { LoginDto } from 'src/dtos/request/auth/login.dto';
import { User, UserDocument } from 'src/schemas/user.schema';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}
  async findUserByEmail(email: string): Promise<UserDocument | null> {
    return await this.userModel.findOne({ email }).exec();
  }
  async createUser(payload: Partial<User>): Promise<UserDocument> {
    const doc = new this.userModel(payload);
    return await doc.save();
  }
  async count(match: any): Promise<number> {
    return this.userModel.countDocuments(match);
  }
  async findWithPagination(
    match: any,
    skip: number,
    limit: number,
  ): Promise<UserDocument[]> {
    return this.userModel
      .find(match)
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit))
      .lean()
      .exec();
  }
  async updateByUserId(id: string, payload: Record<string, any>) {
    return this.userModel
      .findOneAndUpdate({ id }, payload, { new: true })
      .lean()
      .exec();
  }
  async findByUserId(id: string): Promise<User | null> {
    return this.userModel.findOne({ id }).lean().exec();
  }
  async softDeleteByUserId(id: string): Promise<UserDocument | null> {
    return this.userModel
      .findOneAndUpdate(
        { id, is_deleted: false },
        {
          is_deleted: true,
          deleted_at: new Date(),
        },
        { new: true },
      )
      .lean()
      .exec();
  }
}
