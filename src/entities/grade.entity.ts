import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Student } from './student.entity';

@Entity('grades')
export class Grade {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'gradeId' })
  id: number;

  @Column({ name: 'createdAt', default: new Date() })
  createdAt: Date;

  @Column({ name: 'courseName' })
  courseName: string;

  @Column({ name: 'courseScore' })
  courseScore: number;

  @ManyToOne(() => Student, (student) => student.grades)
  student: Student;
}
