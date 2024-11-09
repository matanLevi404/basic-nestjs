import { Module } from '@nestjs/common';
import { StudentController } from 'src/controllers/student.controller';
import { StudentService } from 'src/services/student.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from '../entities/student.entity';
import { JwtService } from '@nestjs/jwt/dist';
import { UserService } from 'src/services/user.service';
import { User } from 'src/typeorm';
import { TwilioModule } from 'nestjs-twilio';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, User]),
    TwilioModule.forRoot({
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
    }),
  ],
  controllers: [StudentController],
  providers: [StudentService, JwtService, UserService],
})
export class StudentModule {}
