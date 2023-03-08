import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length } from 'class-validator';

export class PartyQueryDto {
  @ApiProperty({ description: 'Minimum length: 3', minLength: 3 })
  @Length(3)
  searchText: string;
}
