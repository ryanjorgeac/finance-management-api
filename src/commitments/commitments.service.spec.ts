import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CommitmentsService } from './commitments.service';
import { PrismaService } from '../database/prisma.service';
import { Commitment } from './entities/commitment.entity';
import { CreateCommitmentDto } from './dto/create-commitment.dto';
import { UpdateCommitmentDto } from './dto/update-commitment.dto';
import { CommitmentFrequency, TransactionType } from '@prisma/client';

describe('CommitmentsService', () => {
  let service: CommitmentsService;

  const mockPrismaService = {
    category: {
      findUnique: jest.fn(),
    },
    commitment: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockUserId = 'user-123';
  const mockCommitmentId = 'commitment-123';
  const mockCategoryId = 'category-123';
  const mockDate = new Date('2025-10-15T00:00:00.000Z');

  const mockPrismaCommitment = {
    id: mockCommitmentId,
    amount: 150000n,
    type: TransactionType.EXPENSE,
    description: 'Monthly rent',
    date: mockDate,
    frequency: CommitmentFrequency.MONTHLY,
    userId: mockUserId,
    categoryId: mockCategoryId,
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  const mockCategory = {
    id: mockCategoryId,
    userId: mockUserId,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommitmentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CommitmentsService>(CommitmentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreateCommitmentDto = {
      amountCents: 150000,
      type: TransactionType.EXPENSE,
      description: 'Monthly rent',
      date: mockDate,
      frequency: CommitmentFrequency.MONTHLY,
      categoryId: mockCategoryId,
    };

    it('should create a new commitment', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.commitment.create.mockResolvedValue(
        mockPrismaCommitment,
      );

      const result = await service.create(mockUserId, createDto);

      expect(mockPrismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: mockCategoryId },
      });
      expect(mockPrismaService.commitment.create).toHaveBeenCalledWith({
        data: {
          type: createDto.type,
          description: createDto.description,
          date: createDto.date,
          frequency: createDto.frequency,
          categoryId: mockCategoryId,
          amount: 150000n,
          userId: mockUserId,
        },
      });
      expect(result).toBeInstanceOf(Commitment);
      expect(result.description).toBe('Monthly rent');
    });

    it('should throw NotFoundException when category does not exist', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.create(mockUserId, createDto)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockPrismaService.commitment.create).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when category belongs to another user', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue({
        id: mockCategoryId,
        userId: 'other-user',
      });

      await expect(service.create(mockUserId, createDto)).rejects.toThrow(
        ForbiddenException,
      );

      expect(mockPrismaService.commitment.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all commitments for the user', async () => {
      mockPrismaService.commitment.findMany.mockResolvedValue([
        mockPrismaCommitment,
        { ...mockPrismaCommitment, id: 'commitment-456' },
      ]);

      const result = await service.findAll(mockUserId);

      expect(mockPrismaService.commitment.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Commitment);
    });

    it('should return empty array when user has no commitments', async () => {
      mockPrismaService.commitment.findMany.mockResolvedValue([]);

      const result = await service.findAll(mockUserId);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a commitment when found and user has permission', async () => {
      mockPrismaService.commitment.findUnique.mockResolvedValue(
        mockPrismaCommitment,
      );

      const result = await service.findOne(mockCommitmentId, mockUserId);

      expect(mockPrismaService.commitment.findUnique).toHaveBeenCalledWith({
        where: { id: mockCommitmentId },
      });
      expect(result).toBeInstanceOf(Commitment);
      expect(result.id).toBe(mockCommitmentId);
    });

    it('should throw NotFoundException when commitment is not found', async () => {
      mockPrismaService.commitment.findUnique.mockResolvedValue(null);

      await expect(
        service.findOne(mockCommitmentId, mockUserId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user does not own the commitment', async () => {
      mockPrismaService.commitment.findUnique.mockResolvedValue({
        ...mockPrismaCommitment,
        userId: 'other-user',
      });

      await expect(
        service.findOne(mockCommitmentId, mockUserId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateCommitmentDto = {
      description: 'Updated rent description',
      amountCents: 200000,
    };

    it('should update a commitment', async () => {
      const mockUpdatedCommitment = {
        ...mockPrismaCommitment,
        description: updateDto.description,
        amount: 200000n,
      };

      mockPrismaService.commitment.findUnique.mockResolvedValue(
        mockPrismaCommitment,
      );
      mockPrismaService.commitment.update.mockResolvedValue(
        mockUpdatedCommitment,
      );

      const result = await service.update(
        mockCommitmentId,
        mockUserId,
        updateDto,
      );

      expect(mockPrismaService.commitment.update).toHaveBeenCalledWith({
        where: { id: mockCommitmentId },
        data: {
          description: updateDto.description,
          amount: 200000n,
        },
      });
      expect(result).toBeInstanceOf(Commitment);
      expect(result.description).toBe('Updated rent description');
    });

    it('should throw NotFoundException when commitment is not found', async () => {
      mockPrismaService.commitment.findUnique.mockResolvedValue(null);

      await expect(
        service.update(mockCommitmentId, mockUserId, updateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user does not own the commitment', async () => {
      mockPrismaService.commitment.findUnique.mockResolvedValue({
        ...mockPrismaCommitment,
        userId: 'other-user',
      });

      await expect(
        service.update(mockCommitmentId, mockUserId, updateDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should validate category ownership when categoryId changes', async () => {
      const newCategoryId = 'new-category-id';
      const updateWithCategoryDto: UpdateCommitmentDto = {
        categoryId: newCategoryId,
      };

      mockPrismaService.commitment.findUnique.mockResolvedValue(
        mockPrismaCommitment,
      );
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(
        service.update(mockCommitmentId, mockUserId, updateWithCategoryDto),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrismaService.commitment.update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when new category belongs to another user', async () => {
      const newCategoryId = 'new-category-id';
      const updateWithCategoryDto: UpdateCommitmentDto = {
        categoryId: newCategoryId,
      };

      mockPrismaService.commitment.findUnique.mockResolvedValue(
        mockPrismaCommitment,
      );
      mockPrismaService.category.findUnique.mockResolvedValue({
        id: newCategoryId,
        userId: 'other-user',
      });

      await expect(
        service.update(mockCommitmentId, mockUserId, updateWithCategoryDto),
      ).rejects.toThrow(ForbiddenException);

      expect(mockPrismaService.commitment.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a commitment', async () => {
      mockPrismaService.commitment.findUnique.mockResolvedValue(
        mockPrismaCommitment,
      );
      mockPrismaService.commitment.delete.mockResolvedValue(
        mockPrismaCommitment,
      );

      await service.remove(mockCommitmentId, mockUserId);

      expect(mockPrismaService.commitment.delete).toHaveBeenCalledWith({
        where: { id: mockCommitmentId },
      });
    });

    it('should throw NotFoundException when commitment is not found', async () => {
      mockPrismaService.commitment.findUnique.mockResolvedValue(null);

      await expect(
        service.remove(mockCommitmentId, mockUserId),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrismaService.commitment.delete).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user does not own the commitment', async () => {
      mockPrismaService.commitment.findUnique.mockResolvedValue({
        ...mockPrismaCommitment,
        userId: 'other-user',
      });

      await expect(
        service.remove(mockCommitmentId, mockUserId),
      ).rejects.toThrow(ForbiddenException);

      expect(mockPrismaService.commitment.delete).not.toHaveBeenCalled();
    });
  });
});
