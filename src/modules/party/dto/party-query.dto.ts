import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length } from 'class-validator';

export class PartyQueryDto {
  @ApiProperty()
  @Length(3)
  searchText: string;
}
