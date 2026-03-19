import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRepoAbstract } from 'src/abstracts/repositories/user.repositories';
import { User, UserDocument } from 'src/schemas/user.schema';

@Injectable()
export class UserRepository  implements UserRepoAbstract {
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
  async updateByUserId(id: string, payload: Record<string, any>) : Promise<UserDocument | null> {
    return this.userModel
      .findOneAndUpdate({ id }, payload, { new: true })
      .lean()
      .exec();
  }
  async findByUserId(id: string): Promise<UserDocument | null> {
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
