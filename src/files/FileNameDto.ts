import { IsNotEmpty, IsString } from "class-validator";

export class FileNameDto {

    @IsNotEmpty()
    @IsString()
    originalFilename: string
}