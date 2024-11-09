import { Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserDto } from 'src/dtos/user.dto';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt/dist';
import { TokenDto } from 'src/dtos/token.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userReposetory: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async insertUser(user: UserDto): Promise<UserDto> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    return await this.userReposetory.save({
      ...user,
      password: hashedPassword,
    });
  }

  async login(userDetails: UserDto): Promise<TokenDto> {
    const { username, password } = userDetails;
    const user = await this.userReposetory.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException('No such user was found ! Please register.');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new NotAcceptableException('Password Or Username Are Incorrect !');
    }
    return {
      accessToken: this.jwtService.sign(
        { id: user.id, username: user.username },
        { secret: process.env.ACCESS_TOKEN_SECRET, expiresIn: '50m' },
      ),
    };
  }
}
