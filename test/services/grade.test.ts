import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { GradeService } from '../../src/services/grade.service';
import { Grade } from '../../src/entities/grade.entity';
import { StudentService } from '../../src/services/student.service';

describe('GradeService', () => {
  let service: GradeService;
  let repository: Repository<Grade>;
  let studentService: StudentService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockStudentService = {
    findStudentById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GradeService,
        {
          provide: getRepositoryToken(Grade),
          useValue: mockRepository,
        },
        {
          provide: StudentService,
          useValue: mockStudentService,
        },
      ],
    }).compile();

    service = module.get<GradeService>(GradeService);
    repository = module.get<Repository<Grade>>(getRepositoryToken(Grade));
    studentService = module.get<StudentService>(StudentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('insertGrade', () => {
    const mockStudent = {
      id: 1,
      fullname: 'John Doe',
      grades: [],
    };

    const mockGradeDto = {
      courseId: 'MATH101',
      courseScore: 85,
      courseName: 'Mathematics',
    };

    const mockGradeWithStudent = {
      ...mockGradeDto,
      student: mockStudent,
    };

    const mockSavedGrade = {
      id: 1,
      ...mockGradeWithStudent,
    };

    it('should successfully insert a new grade', async () => {
      mockStudentService.findStudentById.mockResolvedValue(mockStudent);
      mockRepository.create.mockReturnValue(mockGradeWithStudent);
      mockRepository.save.mockResolvedValue(mockSavedGrade);

      const result = await service.insertGrade(1, mockGradeDto);

      expect(result).toEqual(mockSavedGrade);
      expect(mockStudentService.findStudentById).toHaveBeenCalledWith(1);
      expect(mockRepository.create).toHaveBeenCalledWith(mockGradeWithStudent);
      expect(mockRepository.save).toHaveBeenCalledWith(mockGradeWithStudent);
    });

    it('should throw NotFoundException when student is not found', async () => {
      mockStudentService.findStudentById.mockRejectedValue(new NotFoundException('Student not found'));

      await expect(service.insertGrade(999, mockGradeDto)).rejects.toThrow(NotFoundException);
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('deleteGrade', () => {
    const mockGrade = {
      id: 1,
      courseId: 'MATH101',
      courseScore: 85,
      courseName: 'Mathematics',
    };

    it('should successfully delete a grade', async () => {
      mockRepository.findOne.mockResolvedValue(mockGrade);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.deleteGrade(1);

      expect(result).toEqual(mockGrade);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when grade is not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteGrade(999)).rejects.toThrow(NotFoundException);
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('updateGrade', () => {
    const mockGradeDto = {
      courseId: 'MATH101',
      courseScore: 90,
      courseName: 'Mathematics',
    };

    const mockUpdatedGrade = {
      id: 1,
      ...mockGradeDto,
    };

    it('should successfully update a grade', async () => {
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(mockUpdatedGrade);

      const result = await service.updateGrade(1, mockGradeDto);

      expect(result).toEqual(mockUpdatedGrade);
      expect(mockRepository.update).toHaveBeenCalledWith(1, mockGradeDto);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should return null when grade is not found after update', async () => {
      mockRepository.update.mockResolvedValue({ affected: 0 });
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.updateGrade(999, mockGradeDto);

      expect(result).toBeNull();
      expect(mockRepository.update).toHaveBeenCalledWith(999, mockGradeDto);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
    });
  });
});
