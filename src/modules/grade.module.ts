import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TwilioModule } from 'nestjs-twilio';
import { GradeController } from 'src/controllers/grade.controller';
import { GradeService } from 'src/services/grade.service';
import { StudentService } from 'src/services/student.service';
import { UserService } from 'src/services/user.service';
import { Grade, Student, User } from 'src/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([Grade, Student, User]),
    TwilioModule.forRoot({
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
    }),
  ],
  controllers: [GradeController],
  providers: [GradeService, JwtService, StudentService, UserService],
})
export class GradeModule {}
