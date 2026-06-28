import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@/database/prisma.service';
import { TransactionsService } from './transactions.service';

describe('TransactionsService', () => {
  let service: TransactionsService;

  const mockPrismaService: any = {
    category: {
      findUnique: jest.fn(),
    },
    commitment: {
      findUnique: jest.fn(),
    },
    transaction: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(async (callback: any) =>
      callback({ transaction: mockPrismaService.transaction }),
    ),
  };

  const mockDate = new Date('2026-06-17T00:00:00.000Z');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create (cents-only contract)', () => {
    it('stores incoming cents value exactly (no real-to-cents conversion)', async () => {
      const userId = 'user-1';
      const categoryId = 'category-1';
      const createTransactionDto = {
        amountCents: 45025,
        type: 'EXPENSE',
        description: 'rent',
        date: mockDate,
        categoryId,
      } as const;

      mockPrismaService.category.findUnique.mockResolvedValue({
        id: categoryId,
        userId,
      });

      mockPrismaService.transaction.create.mockResolvedValue({
        id: 'tx-1',
        amount: 45025n,
        type: 'EXPENSE',
        description: 'rent',
        date: mockDate,
        userId,
        categoryId,
        createdAt: mockDate,
        updatedAt: mockDate,
      });

      await service.create(userId, createTransactionDto as any);

      expect(mockPrismaService.transaction.create).toHaveBeenCalledWith({
        data: {
          categoryId,
          date: mockDate,
          description: 'rent',
          type: 'EXPENSE',
          amount: 45025n,
          userId,
        },
      });
    });

    it('rejects non-integer cents inputs', async () => {
      const userId = 'user-1';
      const categoryId = 'category-1';
      const createTransactionDto = {
        amountCents: 450.25,
        type: 'EXPENSE',
        description: 'rent',
        date: mockDate,
        categoryId,
      } as const;

      mockPrismaService.category.findUnique.mockResolvedValue({
        id: categoryId,
        userId,
      });

      await expect(
        service.create(userId, createTransactionDto as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException when category does not exist', async () => {
      const userId = 'user-1';
      const createTransactionDto = {
        amountCents: 100,
        type: 'EXPENSE',
        description: 'x',
        date: mockDate,
        categoryId: 'missing-category',
      } as const;

      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.create(userId, createTransactionDto as any)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ForbiddenException when category belongs to another user', async () => {
      const userId = 'user-1';
      const createTransactionDto = {
        amountCents: 100,
        type: 'EXPENSE',
        description: 'x',
        date: mockDate,
        categoryId: 'category-1',
      } as const;

      mockPrismaService.category.findUnique.mockResolvedValue({
        id: 'category-1',
        userId: 'other-user',
      });

      await expect(service.create(userId, createTransactionDto as any)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('createFromCommitment', () => {
    const userId = 'user-1';
    const commitmentId = 'commitment-1';

    const mockCommitment = {
      id: commitmentId,
      amount: 150000n,
      type: 'EXPENSE',
      description: 'Monthly rent',
      date: mockDate,
      frequency: 'MONTHLY',
      userId,
      categoryId: 'category-1',
      createdAt: mockDate,
      updatedAt: mockDate,
    };

    it('should create a transaction from commitment using current date', async () => {
      mockPrismaService.commitment.findUnique.mockResolvedValue(mockCommitment);
      mockPrismaService.transaction.create.mockResolvedValue({
        id: 'tx-from-commitment',
        amount: 150000n,
        type: 'EXPENSE',
        description: 'Monthly rent',
        date: expect.any(Date),
        userId,
        categoryId: 'category-1',
        createdAt: mockDate,
        updatedAt: mockDate,
      });

      await service.createFromCommitment(commitmentId, userId);

      expect(mockPrismaService.commitment.findUnique).toHaveBeenCalledWith({
        where: { id: commitmentId },
      });
      expect(mockPrismaService.transaction.create).toHaveBeenCalledWith({
        data: {
          amount: 150000n,
          type: 'EXPENSE',
          description: 'Monthly rent',
          date: expect.any(Date),
          userId,
          categoryId: 'category-1',
        },
      });
    });

    it('should throw NotFoundException when commitment does not exist', async () => {
      mockPrismaService.commitment.findUnique.mockResolvedValue(null);

      await expect(
        service.createFromCommitment(commitmentId, userId),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrismaService.transaction.create).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when commitment belongs to another user', async () => {
      mockPrismaService.commitment.findUnique.mockResolvedValue({
        ...mockCommitment,
        userId: 'other-user',
      });

      await expect(
        service.createFromCommitment(commitmentId, userId),
      ).rejects.toThrow(ForbiddenException);

      expect(mockPrismaService.transaction.create).not.toHaveBeenCalled();
    });
  });
});

