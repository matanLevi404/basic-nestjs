import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Grade } from './grade.entity';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'student_id' })
  id: number;

  @Column({ name: 'fullname', nullable: false, default: '' })
  fullname: string;

  @Column({ name: 'created_at', nullable: false, default: new Date() })
  createdAt: Date;

  @Column({ name: 'birth_date', nullable: false })
  birthDate: Date;

  @Column({ name: 'sat_score' })
  satScore: number;

  @Column({ name: 'graduation_score' })
  graduationScore: number;

  @Column({ name: 'phone' })
  phone: string;

  @Column({ name: 'profile_picture' })
  profilePicture: string;

  @OneToMany(() => Grade, (grade) => grade.student)
  grades: Grade[];
}
