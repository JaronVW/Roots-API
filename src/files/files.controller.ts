import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { join } from 'path';
import { readFileSync } from 'fs';
import { FileNameDto } from 'src/FileNameDto';
import { Response } from 'express';

@Controller('file')
export class FilesController {
  @Get(':encryptedFileName')
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
      ofn.originalFilename.includes('.svg')
    ) {
      response.contentType('image/*');
      response.set('Content-Disposition', 'inline;');
    }

    if (ofn.originalFilename.includes('.mp4')) response.contentType('video/mp4');
    if (ofn.originalFilename.includes('.mp3')) response.contentType('audio/mp3');
    if (ofn.originalFilename.includes('.pdf')) response.contentType('application/pdf');

    response.attachment(ofn.originalFilename);
    response.send(file);
  }
}
