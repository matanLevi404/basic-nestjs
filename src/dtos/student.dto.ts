import { ApiProperty } from '@nestjs/swagger';
import { Sort, SortDirection } from '../enums/student.enum';
import { IsDate, IsNotEmpty, IsNumber, IsPhoneNumber, IsString, IsUrl } from 'class-validator';
import { Transform } from 'class-transformer';

export class StudentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  fullname: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  birthDate: Date;

  @ApiProperty()
  @IsNumber()
  @Transform(({ value }) => value ?? 0)
  satScore: number;

  @ApiProperty()
  @IsNumber()
  @Transform(({ value }) => value ?? 0)
  graduationScore: number;

  @ApiProperty()
  @IsPhoneNumber()
  phone: string;

  @ApiProperty()
  @IsUrl()
  profilePicture: string;
}
