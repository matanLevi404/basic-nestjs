import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TwilioService } from 'nestjs-twilio/dist/module/twilio.service';
import { NotFoundException } from '@nestjs/common';
import { Student } from '../../src/entities/student.entity';
import { StudentService } from '../../src/services/student.service';

describe('StudentService', () => {
  let service: StudentService;
  let repository: Repository<Student>;
  let twilioService: TwilioService;

  const mockQueryBuilder = {
    leftJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    having: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
    query: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };

  const mockTwilioService = {
    client: {
      messages: {
        create: jest.fn(),
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentService,
        {
          provide: getRepositoryToken(Student),
          useValue: mockRepository,
        },
        {
          provide: TwilioService,
          useValue: mockTwilioService,
        },
      ],
    }).compile();

    service = module.get<StudentService>(StudentService);
    repository = module.get<Repository<Student>>(getRepositoryToken(Student));
    twilioService = module.get<TwilioService>(TwilioService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllStudents', () => {
    const mockQueries = {
      fullname: 'John',
      fromSatScore: 500,
      toSatScore: 700,
      sort: ['fullname'],
      sortDirection: ['ASC'],
      fromAvgScore: 70,
      page: 1,
      count: 10,
    };

    const mockStudents = [
      { id: 1, fullname: 'John Doe', satScore: 600 },
      { id: 2, fullname: 'Jane Smith', satScore: 650 },
    ];

    it('should return students with pagination', async () => {
      mockQueryBuilder.getMany.mockResolvedValue(mockStudents);

      const result = await service.getAllStudents(mockQueries);

      expect(result).toEqual({
        data: mockStudents,
        pagination: { count: 2, ofPage: 1, page: 1 },
      });
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('student');
    });
  });

  describe('insertStudent', () => {
    const mockStudentDto = {
      fullname: 'John Doe',
      satScore: 600,
      phone: '1234567890',
      birthDate: new Date(),
      graduationScore: 0,
      profilePicture: '',
    };

    const mockCreatedStudent = {
      id: 1,
      ...mockStudentDto,
    };

    it('should create and return a new student', async () => {
      mockRepository.create.mockReturnValue(mockCreatedStudent);
      mockRepository.save.mockResolvedValue(mockCreatedStudent);

      const result = await service.insertStudent(mockStudentDto);

      expect(result).toEqual(mockCreatedStudent);
      expect(mockRepository.create).toHaveBeenCalledWith(mockStudentDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockCreatedStudent);
    });
  });

  describe('findStudentById', () => {
    const mockStudent = {
      id: 1,
      fullname: 'John Doe',
      grades: [],
    };

    it('should find and return a student by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockStudent);

      const result = await service.findStudentById(1);

      expect(result).toEqual(mockStudent);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['grades'],
      });
    });

    it('should throw NotFoundException when student is not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findStudentById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStudent', () => {
    const mockStudentDto = {
      fullname: 'John Doe',
      satScore: 650,
      phone: '1234567890',
      birthDate: new Date(),
      graduationScore: 0,
      profilePicture: '',
    };

    const mockExistingStudent = {
      id: 1,
      fullname: 'John Doe',
      satScore: 600,
      phone: '1234567890',
      birthDate: new Date(),
      graduationScore: 0,
      profilePicture: '',
    };

    it('should update and return the student', async () => {
      mockRepository.findOne.mockResolvedValue(mockExistingStudent);
      mockRepository.save.mockResolvedValue({ ...mockExistingStudent, ...mockStudentDto });

      const result = await service.updateStudent(1, mockStudentDto);

      expect(result).toEqual({ ...mockExistingStudent, ...mockStudentDto });
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when student is not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.updateStudent(999, mockStudentDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeStudent', () => {
    const mockStudent = {
      id: 1,
      fullname: 'John Doe',
    };

    it('should remove and return the deleted student', async () => {
      mockRepository.findOne.mockResolvedValue(mockStudent);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.removeStudent(1);

      expect(result).toEqual(mockStudent);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when student is not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.removeStudent(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStudentWithSatHigherThan', () => {
    const mockStudents = [
      { id: 1, fullname: 'John Doe', satScore: 700 },
      { id: 2, fullname: 'Jane Smith', satScore: 750 },
    ];

    it('should return students with SAT scores higher than specified value', async () => {
      mockRepository.query.mockResolvedValue(mockStudents);

      const result = await service.getStudentWithSatHigherThan(650);

      expect(result).toEqual(mockStudents);
      expect(mockRepository.query).toHaveBeenCalledWith('SELECT * FROM students WHERE sat_score > 650;');
    });
  });

  describe('sendSmsToStudents', () => {
    const mockStudents = [
      { fullname: 'John Doe', phone: '1234567890' },
      { fullname: 'Jane Smith', phone: '0987654321' },
    ];

    const mockMessage = 'Test message';

    it('should send SMS to all students', async () => {
      mockRepository.find.mockResolvedValue(mockStudents);
      mockTwilioService.client.messages.create.mockResolvedValue({});

      const result = await service.sendSmsToStudents(mockMessage);

      expect(result).toBe('Sending Message To All Students. It May Take Some Time :)');
      expect(mockRepository.find).toHaveBeenCalledWith({ select: { fullname: true, phone: true } });
      expect(mockTwilioService.client.messages.create).toHaveBeenCalledTimes(2);
      mockStudents.forEach((student) => {
        expect(mockTwilioService.client.messages.create).toHaveBeenCalledWith({
          body: mockMessage,
          from: process.env.TWILIO_NUMBER,
          to: student.phone,
        });
      });
    });
  });
});
