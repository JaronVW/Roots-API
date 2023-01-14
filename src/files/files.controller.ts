import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { join } from 'path';
import { readFileSync } from 'fs';
import { FileNameDto } from '../FileNameDto';
import { Response } from 'express';
import { Public } from '..//decorators/Public';

@Controller('file')
export class FilesController {
  @Get(':encryptedFileName')
  @Public()
  getFile(
    @Param('encryptedFileName') encryptedFileName: string,
    @Res() response: Response,

    @Query()
    ofn: FileNameDto,
  ) {
    const file = readFileSync(join(process.cwd(), `upload/${encryptedFileName}`));
    if (
      ofn.originalFilename.includes('.jpg') ||
      ofn.originalFilename.includes('.jpeg') ||
      ofn.originalFilename.includes('.png') ||
      ofn.originalFilename.includes('.gif') ||
      ofn.originalFilename.includes('.svg') ||
      ofn.originalFilename.includes('.webp')
    ) {
      response.contentType(`image/${ofn.originalFilename.split('.').pop()}`);
      response.set('Content-Disposition', `inline; filename=\"${ofn.originalFilename}\""`);
      response.send(file);
    } else {
      if (ofn.originalFilename.includes('.mp4')) response.contentType('video/mp4');
      else if (ofn.originalFilename.includes('.mp3')) response.contentType('audio/mp3');
      else if (ofn.originalFilename.includes('.pdf')) response.contentType('application/pdf');
      else if (ofn.originalFilename.includes('.docx'))
        response.contentType('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      else if (ofn.originalFilename.includes('.xlsx')) response.contentType('application/vnd.ms-excel');
      response.attachment(ofn.originalFilename);
      response.send(file);
    }
  }
}
