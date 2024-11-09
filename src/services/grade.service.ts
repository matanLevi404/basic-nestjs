import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { GradeDto } from 'src/dtos/grade.dto';
import { Repository } from 'typeorm';
import { StudentService } from './student.service';
import { Grade } from '../entities/grade.entity';

@Injectable()
export class GradeService {
  constructor(
    @InjectRepository(Grade)
    private readonly gradeRepository: Repository<Grade>,
    private readonly studentService: StudentService,
  ) {}

  async insertGrade(studentId: number, grade: GradeDto): Promise<GradeDto> {
    const student = await this.studentService.findStudentById(studentId);
    const gradeIn = this.gradeRepository.create({ ...grade, student });
    return this.gradeRepository.save(gradeIn);
  }

  async deleteGrade(gradeId: number): Promise<GradeDto> {
    const grade = await this.gradeRepository.findOne({ where: { id: gradeId } });
    if (!grade) {
      throw new NotFoundException('Grade was not found!');
    }
    await this.gradeRepository.delete(gradeId);
    return grade;
  }

  async updateGrade(gradeId: number, newGrade: GradeDto): Promise<GradeDto> {
    await this.gradeRepository.update(gradeId, newGrade);
    const grade = this.gradeRepository.findOne({ where: { id: gradeId } });
    return grade;
  }
}
