import { Body, Controller, Delete, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common/pipes';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GradeDto } from 'src/dtos/grade.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { GradeService } from 'src/services/grade.service';

@Controller('grades')
@ApiTags('grades')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
export class GradeController {
  constructor(private readonly gradeService: GradeService) {}

  @Post(':studentId/grades')
  @ApiOkResponse({ type: GradeDto })
  insertGrade(@Param('studentId', ParseIntPipe) studentId: number, @Body() grade: GradeDto): Promise<GradeDto> {
    return this.gradeService.insertGrade(studentId, grade);
  }

  @Delete('grades/:gradeId')
  @ApiOkResponse({ type: GradeDto })
  deleteGrade(@Param('gradeId', ParseIntPipe) gradeId: number): Promise<GradeDto> {
    return this.gradeService.deleteGrade(gradeId);
  }

  @Put('grades/:gradeId')
  @ApiOkResponse({ type: GradeDto })
  updateGrade(@Param('gradeId', ParseIntPipe) gradeId: number, @Body() newGrade: GradeDto): Promise<GradeDto> {
    return this.gradeService.updateGrade(gradeId, newGrade);
  }
}
