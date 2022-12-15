import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { MulterModule } from '@nestjs/platform-express/multer';

@Module({
  controllers: [EventsController],
  providers: [EventsService],
  imports: [
    MulterModule.register({
      dest: './upload',
      preservePath: true,
    }),
  ],
})
export class EventsModule {}
