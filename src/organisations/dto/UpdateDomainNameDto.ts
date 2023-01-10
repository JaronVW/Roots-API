import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class UpdateDomainNameDto {

  @IsString()
  @IsNotEmpty()
  @Matches(/@\w+([\.-]?\w+)*(\.\w{2,})+$/)
  public domainName: string;
}
