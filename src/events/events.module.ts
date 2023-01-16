import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { MulterModule } from '@nestjs/platform-express/multer';
import { JwtService } from '@nestjs/jwt';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  controllers: [EventsController],
  providers: [EventsService, JwtService],
  imports: [MulterModule, CloudinaryModule],
})
export class EventsModule {}
