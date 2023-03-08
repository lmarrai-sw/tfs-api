import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length } from 'class-validator';

export class PartyQueryDto {
  @IsNotEmpty()
  @Length(3)
  @ApiProperty()
  searchText: string;
}
