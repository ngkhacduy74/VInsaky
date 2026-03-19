import { UserDocument } from "src/schemas/user.schema";

export abstract class UserRepoAbstract {
  abstract findUserByEmail(email: string):  Promise<UserDocument | null> ;
  abstract createUser(
    payload: Partial<UserDocument>
  ): Promise<UserDocument>
  abstract count(
    match: any
  ): Promise<number>;
   abstract findWithPagination(
   match: any,
    skip: number,
    limit: number,
  ):Promise<UserDocument[]>;
  abstract updateByUserId(
   id: string, payload: Record<string, any>
  ): Promise<UserDocument | null> 
  abstract findByUserId(
   id: string
  ): Promise<UserDocument | null>
  abstract softDeleteByUserId(
    id: string
  ): Promise<UserDocument | null>;

}
