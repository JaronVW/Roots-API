import { Module } from '@nestjs/common';
import { ResetPasswordRequestService } from './reset-password-request.service';

@Module({
  providers: [ResetPasswordRequestService],
  exports: [ResetPasswordRequestService],
})
export class ResetPasswordRequestModule {}
