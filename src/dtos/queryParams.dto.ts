import { ApiProperty } from '@nestjs/swagger';
import { Sort, SortDirection } from 'src/enums/student.enum';

export class QueryParamsDto {
  @ApiProperty({ required: false })
  fullname: string;

  @ApiProperty({ required: false })
  fromSatScore: number;

  @ApiProperty({ required: false })
  toSatScore: number;

  @ApiProperty({ required: false })
  fromAvgScore: number;

  @ApiProperty({ default: 1 })
  page: number;

  @ApiProperty({ default: 50 })
  count: number;

  @ApiProperty({ enum: Sort, default: Sort.id })
  sort: string[];

  @ApiProperty({ enum: SortDirection, default: SortDirection.asc })
  sortDirection: string[];
}
