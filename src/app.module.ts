import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm/dist';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StudentModule } from './modules/student.module';
import { UserModule } from './modules/user.module';
import { HealthModule } from './modules/health.module';
import { GradeModule } from './modules/grade.module';
import entities from './typeorm';
import { AuthGuard } from './guards/auth.guard';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'postgres',
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_NAME'),
          synchronize: true,
          entities: entities,
        };
      },
    }),
    UserModule,
    StudentModule,
    GradeModule,
    HealthModule,
  ],
  controllers: [],
  providers: [JwtService, AuthGuard],
})
export class AppModule {}
