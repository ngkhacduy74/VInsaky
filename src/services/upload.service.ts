import { Injectable, OnModuleInit } from '@nestjs/common';
import { configCloudinary } from 'src/configs/cloudinary.config';

@Injectable()
export class UploadsService implements OnModuleInit {
  onModuleInit() {
    configCloudinary();
  }
}
