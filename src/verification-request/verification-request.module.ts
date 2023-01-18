import { Module } from '@nestjs/common';
import { VerificationRequestService } from './verification-request.service';

@Module({ providers: [VerificationRequestService], exports: [VerificationRequestService] })
export class VerificationRequestModule {}
