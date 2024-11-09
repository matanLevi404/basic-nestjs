import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../../src/services/user.service';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../src/entities/user.entity';
import { NotFoundException, NotAcceptableException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserDto } from '../../src/dtos/user.dto';
import { TokenDto } from '../../src/dtos/token.dto';

// Mock bcrypt functions
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  const mockUserRepository = {
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('insertUser', () => {
    it('should hash the password and save the user', async () => {
      const userDto: UserDto = {
        username: 'testuser',
        password: 'password',
      };
      const hashedPassword = 'hashedpassword';

      // Mock bcrypt.hash to return a resolved promise with hashed password
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      // Mock the user repository save method to return the user with hashed password
      mockUserRepository.save.mockResolvedValue({ ...userDto, password: hashedPassword });

      const result = await service.insertUser(userDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
      expect(mockUserRepository.save).toHaveBeenCalledWith({
        ...userDto,
        password: hashedPassword,
      });
      expect(result.password).toBe(hashedPassword); // Ensure password is hashed
    });
  });

  describe('login', () => {
    it('should throw an error if user is not found', async () => {
      const userDto: UserDto = {
        username: 'nonexistentuser',
        password: 'password',
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(userDto)).rejects.toThrowError(NotFoundException);
      await expect(service.login(userDto)).rejects.toThrow('No such user was found ! Please register.');
    });

    it('should throw an error if password is incorrect', async () => {
      const userDto: UserDto = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      const user = { id: 1, username: 'testuser', password: 'hashedpassword' };

      mockUserRepository.findOne.mockResolvedValue(user);

      // Mock bcrypt.compare to return false (password mismatch)
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(userDto)).rejects.toThrowError(NotAcceptableException);
      await expect(service.login(userDto)).rejects.toThrow('Password Or Username Are Incorrect !');
    });

    it('should return a token if login is successful', async () => {
      const userDto: UserDto = {
        username: 'testuser',
        password: 'password',
      };

      const user = { id: 1, username: 'testuser', password: 'hashedpassword' };

      mockUserRepository.findOne.mockResolvedValue(user);

      // Mock bcrypt.compare to return true (password matches)
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      mockJwtService.sign.mockReturnValue('token');

      const result: TokenDto = await service.login(userDto);

      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedpassword');
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        { id: user.id, username: user.username },
        { secret: process.env.ACCESS_TOKEN_SECRET, expiresIn: '50m' },
      );
      expect(result.accessToken).toBe('token');
    });
  });
});
