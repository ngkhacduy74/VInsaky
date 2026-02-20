import { PublicUserDto } from "./user.dto";

export type GetAllUserResponse = {
  users: PublicUserDto[];
  total: number;
  skip: number;
  limit: number;
};
