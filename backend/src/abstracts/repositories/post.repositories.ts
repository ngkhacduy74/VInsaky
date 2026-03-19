
import { Post, PostDocument } from "src/schemas/post.schema";

export abstract class PostRepoAbstract {
  abstract   create(doc: Partial<Post>): Promise<PostDocument>
    abstract   findOne(filter: Partial<Post>): Promise<PostDocument | null>;
    abstract   findById(id: string): Promise<PostDocument | null>;
    abstract   findByIdWithSeller(id: string): Promise<PostDocument | null>;
    abstract   count(filter: Record<string, any>): Promise<number>;
    abstract   findMany(filter: Record<string, any>, options?: any): Promise<PostDocument[]>;
    abstract   updateById(id: string, update: Record<string, any>): Promise<PostDocument | null>;
    abstract   deleteById(id: string): Promise<PostDocument | null>;

}
