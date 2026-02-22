import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinary } from 'src/configs/cloudinary.config';

export const UploadImageInterceptor = FileFieldsInterceptor(
  [{ name: 'img', maxCount: 10 }],
  {
    storage: new CloudinaryStorage({
      cloudinary,
      params: {
        folder: 'image_gymshop',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }],
      } as any,
    }),
  },
);
