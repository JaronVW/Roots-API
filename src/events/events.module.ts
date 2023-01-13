import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { MulterModule } from '@nestjs/platform-express/multer';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [EventsController],
  providers: [EventsService,JwtService],
  imports: [
    MulterModule.register({
      dest: './upload',
      preservePath: true,
    }),
  ],
})
export class EventsModule {}
