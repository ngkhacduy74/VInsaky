import { Module } from '@nestjs/common';
import { UploadsController } from 'src/controllers/upload.controller';
import { UploadsService } from 'src/services/upload.service';

@Module({
  controllers: [UploadsController],
  providers: [UploadsService],
})
export class UploadsModule {}
