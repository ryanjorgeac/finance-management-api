import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../../src/users/users.service';
import { PrismaService } from '../../src/database/prisma.service';
import { CreateUserDto } from '../../src/users/dto/create-user.dto';
import { UpdateUserDto } from '../../src/users/dto/update-user.dto';
import { User } from '../../src/users/entities/user.entity';
import { UserRole } from '@prisma/client';
import * as argon from 'argon2';

// Mock argon2
jest.mock('argon2');

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    password: '$2b$10$hashedpassword',
    role: UserRole.USER,
    balance: 1000.0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      password: 'password123',
    };

    it('should create a new user successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      (argon.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const result = await service.create(createUserDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(argon.hash).toHaveBeenCalledWith(createUserDto.password);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          ...createUserDto,
          password: 'hashedPassword',
        },
      });
      expect(result).toBeInstanceOf(User);
    });

    it('should throw ConflictException if user already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const mockUsers = [mockUser];
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(mockPrismaService.user.findMany).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(User);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne('1');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toBeInstanceOf(User);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toBeInstanceOf(User);
    });

    it('should return null if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail('notfound@example.com');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    const updateUserDto: UpdateUserDto = {
      firstName: 'Updated',
    };

    it('should update a user successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        firstName: 'Updated',
      });

      const result = await service.update('1', updateUserDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateUserDto,
      });
      expect(result).toBeInstanceOf(User);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.update('999', updateUserDto)).rejects.toThrow(NotFoundException);
    });

    it('should hash password if provided in update', async () => {
      const updateWithPassword: UpdateUserDto = {
        password: 'newPassword',
      };
      
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);
      (argon.hash as jest.Mock).mockResolvedValue('hashedNewPassword');

      await service.update('1', updateWithPassword);

      expect(argon.hash).toHaveBeenCalledWith('newPassword');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { password: 'hashedNewPassword' },
      });
    });

    it('should throw UnauthorizedException if email is already taken', async () => {
      const updateWithEmail: UpdateUserDto = {
        email: 'taken@example.com',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.findFirst.mockResolvedValue(null); // Email not available

      await expect(service.update('1', updateWithEmail)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('remove', () => {
    it('should remove a user successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      const result = await service.remove('1');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toBeInstanceOf(User);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('comparePassword', () => {
    it('should return true for valid password', async () => {
      const user = new User(mockUser);
      (argon.verify as jest.Mock).mockResolvedValue(true);

      const result = await service.comparePassword(user, 'correctPassword');

      expect(argon.verify).toHaveBeenCalledWith(mockUser.password, 'correctPassword');
      expect(result).toBe(true);
    });

    it('should return false for invalid password', async () => {
      const user = new User(mockUser);
      (argon.verify as jest.Mock).mockResolvedValue(false);

      const result = await service.comparePassword(user, 'wrongPassword');

      expect(argon.verify).toHaveBeenCalledWith(mockUser.password, 'wrongPassword');
      expect(result).toBe(false);
    });
  });
});
