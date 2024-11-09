import { Injectable, NotFoundException } from '@nestjs/common';
import { StudentDto } from '../dtos/student.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from '../entities/student.entity';
import { Repository } from 'typeorm';
import { TwilioService } from 'nestjs-twilio/dist/module/twilio.service';
import { PaginationDto } from 'src/dtos/pagination.dto';
import { QueryParamsDto } from 'src/dtos/queryParams.dto';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    private readonly twilioService: TwilioService,
  ) {}

  async getAllStudents(queries: QueryParamsDto): Promise<{ data: StudentDto[]; pagination: PaginationDto }> {
    const { fullname, fromSatScore, toSatScore, sort, sortDirection, fromAvgScore, page, count } = queries;
    const sortDirectionStr: string = `${sortDirection}`;
    const students = await this.studentRepository
      .createQueryBuilder('student')
      .leftJoin('student.grades', 'grade')
      .select('student')
      .groupBy('student.student_id')
      .having('COALESCE(AVG("grade"."courseScore"), 0) >= :fromAvgScore', { fromAvgScore: fromAvgScore ?? 0 })
      .andWhere('student.fullname LIKE :fullname', {
        fullname: `%${fullname || ''}%`,
      })
      .andWhere('student.satScore BETWEEN :fromSatScore AND :toSatScore', {
        fromSatScore: fromSatScore || 0,
        toSatScore: toSatScore || 801,
      })
      .orderBy(`student.${sort}`, sortDirectionStr === 'ASC' ? 'ASC' : 'DESC')
      .skip(count * (page - 1))
      .take(count < 50 ? count : 50)
      .getMany();
    const response = { data: students, pagination: { count: students.length, ofPage: page ? page : 1, page: page ? page : 1 } };
    return response;
  }

  insertStudent(student: StudentDto): Promise<Student> {
    const newStudent = this.studentRepository.create(student);
    return this.studentRepository.save(newStudent);
  }

  async findStudentById(id: number): Promise<Student> {
    const student = await this.studentRepository.findOne({ where: { id }, relations: ['grades'] });
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return student;
  }

  async updateStudent(id: number, studentDto: StudentDto): Promise<Student> {
    const student = await this.studentRepository.findOne({ where: { id } });
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    Object.assign(student, studentDto);
    return this.studentRepository.save(student);
  }

  async removeStudent(id: number): Promise<Student> {
    const student = await this.studentRepository.findOne({ where: { id } });
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    this.studentRepository.delete(id);
    return student;
  }

  getStudentWithSatHigherThan(sat: number): Promise<Student[]> {
    return this.studentRepository.query(`SELECT * FROM students WHERE sat_score > ${sat};`);
  }

  async sendSmsToStudents(text: string): Promise<string> {
    const students = await this.studentRepository.find({ select: { fullname: true, phone: true } });
    const phones = students.map((student) => student.phone);
    phones.map((phone) => this.twilioService.client.messages.create({ body: text, from: process.env.TWILIO_NUMBER, to: phone }));
    return 'Sending Message To All Students. It May Take Some Time :)';
  }
}
