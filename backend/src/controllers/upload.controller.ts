import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UploadImageInterceptor } from 'src/interceptors/upload-image.interceptor';
import { UploadVideoInterceptor } from 'src/interceptors/upload-video.interceptor';
@ApiTags('file')
@Controller('file')
export class UploadsController {
  @Post('upload-image')
  @UseInterceptors(UploadImageInterceptor)
  uploadImage(@UploadedFiles() files: { img?: Express.Multer.File[] }) {
    const urls = (files?.img || []).map((f: any) => f.path);
    return {
      message: 'Upload ảnh thành công',
      data: { urls },
    };
  }

  @Post('upload-video')
  @UseInterceptors(UploadVideoInterceptor)
  uploadVideo(@UploadedFiles() files: { video?: Express.Multer.File[] }) {
    const urls = (files?.video || []).map((f: any) => f.path);
    return { message: 'Upload video thành công', data: { urls } };
  }
}
