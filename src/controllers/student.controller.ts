import { Delete, Param, Patch, Query } from '@nestjs/common';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common/decorators';
import { StudentService } from 'src/services/student.service';
import { StudentDto } from '../dtos/student.dto';
import { ApiTags, ApiOkResponse, ApiBearerAuth, ApiExtraModels } from '@nestjs/swagger';
import { Student } from '../entities/student.entity';
import { QueryParamsDto } from 'src/dtos/queryParams.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { ParseIntPipe } from '@nestjs/common/pipes';
import { getSchemaPath } from '@nestjs/swagger';
import { PaginationDto } from 'src/dtos/pagination.dto';

@Controller('students')
@ApiTags('students')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
@ApiExtraModels(PaginationDto)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: getSchemaPath(StudentDto) } },
        pagination: { $ref: getSchemaPath(PaginationDto) }, // Corrected reference to PaginationDto
      },
    },
  })
  @Get()
  async getAllStudents(@Query() queries: QueryParamsDto): Promise<{ data: StudentDto[]; pagination: PaginationDto }> {
    return await this.studentService.getAllStudents(queries);
  }

  @Post()
  @ApiOkResponse({ type: StudentDto })
  insertStudent(@Body() studentDto: StudentDto): Promise<Student> {
    return this.studentService.insertStudent(studentDto);
  }

  @Get(':id')
  @ApiOkResponse({ type: StudentDto })
  getStudent(@Param('id', ParseIntPipe) id: number): Promise<Student> {
    return this.studentService.findStudentById(id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: StudentDto })
  updateStudent(@Param('id', ParseIntPipe) id: number, @Body() studentDto: StudentDto): Promise<Student> {
    return this.studentService.updateStudent(id, studentDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: StudentDto })
  removeStudent(@Param('id', ParseIntPipe) id: number): Promise<Student> {
    return this.studentService.removeStudent(id);
  }

  @Get('highSat/:sat')
  getHighSatStudents(@Param('sat', ParseIntPipe) sat: number): Promise<Student[]> {
    return this.studentService.getStudentWithSatHigherThan(sat);
  }

  @Get('sms/all/:text')
  sendSmsToStudents(@Param('text') text: string): Promise<string> {
    return this.studentService.sendSmsToStudents(text);
  }
}
