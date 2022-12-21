import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { MulterModule } from '@nestjs/platform-express/multer';
import { NestjsFormDataModule } from 'nestjs-form-data';

@Module({
  controllers: [EventsController],
  providers: [EventsService],
  imports: [
    NestjsFormDataModule,
    MulterModule.register({
      dest: './upload',
      preservePath: true,
    }),
  ],
})
export class EventsModule {}
