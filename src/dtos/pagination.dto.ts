import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
  @ApiProperty()
  count: number;

  @ApiProperty()
  ofPage: number;

  @ApiProperty()
  page: number;
}
