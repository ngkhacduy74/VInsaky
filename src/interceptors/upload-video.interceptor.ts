import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinary } from 'src/configs/cloudinary.config';

export const UploadVideoInterceptor = FileFieldsInterceptor(
  [{ name: 'video', maxCount: 5 }],
  {
    storage: new CloudinaryStorage({
      cloudinary,
      params: {
        folder: 'video',
        resource_type: 'video',
      } as any,
    }),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  },
);
