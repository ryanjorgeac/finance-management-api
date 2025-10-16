import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../database/prisma.service';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoriesSummaryDto } from './dto/categories-summary.dto';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    category: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    transaction: {
      count: jest.fn(),
      updateMany: jest.fn(),
    },
    $queryRaw: jest.fn(),
  };

  const mockUserId = 'user-123';
  const mockCategoryId = 'category-123';
  const mockDate = new Date('2025-10-15T00:00:00.000Z');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new category', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'Test Category',
        description: 'Test Description',
        color: '#FF5733',
        icon: 'test-icon',
        budgetAmount: 500,
        isActive: true,
      };

      const mockCreatedCategory = {
        id: mockCategoryId,
        ...createCategoryDto,
        budgetAmount: 500n,
        userId: mockUserId,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      mockPrismaService.category.create.mockResolvedValue(mockCreatedCategory);

      const result = await service.create(mockUserId, createCategoryDto);

      expect(mockPrismaService.category.create).toHaveBeenCalledWith({
        data: {
          ...createCategoryDto,
          budgetAmount: 500n,
          userId: mockUserId,
        },
      });
      expect(result).toBeInstanceOf(Category);
      expect(result.name).toBe(createCategoryDto.name);
    });
  });

  describe('findAll', () => {
    it('should return all categories with summary data', async () => {
      const mockCategoriesWithSummary = [
        {
          id: 'category-1',
          name: 'Category 1',
          description: 'Description 1',
          color: '#FF5733',
          icon: 'icon-1',
          budgetAmount: BigInt(50000),
          isActive: true,
          createdAt: mockDate,
          updatedAt: mockDate,
          spentAmount: BigInt(25000),
          incomeAmount: BigInt(5000),
          transactionCount: 10,
        },
        {
          id: 'category-2',
          name: 'Category 2',
          description: 'Description 2',
          color: '#33FF57',
          icon: 'icon-2',
          budgetAmount: BigInt(30000),
          isActive: true,
          createdAt: mockDate,
          updatedAt: mockDate,
          spentAmount: BigInt(15000),
          incomeAmount: BigInt(0),
          transactionCount: 5,
        },
      ];

      mockPrismaService.$queryRaw.mockResolvedValue(mockCategoriesWithSummary);

      const result = await service.findAll(mockUserId);

      expect(mockPrismaService.$queryRaw).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Category);
      expect(result[0].name).toBe('Category 1');
      expect(result[0].spentAmount).toBe(25000n);
      expect(result[1].name).toBe('Category 2');
    });

    it('should return empty array when user has no categories', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([]);

      const result = await service.findAll(mockUserId);

      expect(result).toEqual([]);
      expect(mockPrismaService.$queryRaw).toHaveBeenCalledTimes(1);
    });

    it('should calculate remaining amount correctly for each category', async () => {
      const mockCategories = [
        {
          id: 'category-1',
          name: 'Test Category',
          description: 'Test',
          color: '#FF5733',
          icon: 'test',
          budgetAmount: 50000n,
          isActive: true,
          createdAt: mockDate,
          updatedAt: mockDate,
          spentAmount: 35000n,
          incomeAmount: 5000n,
          transactionCount: 5,
        },
      ];

      mockPrismaService.$queryRaw.mockResolvedValue(mockCategories);
      const result = await service.findAll(mockUserId);
      const expectedRemaining = 50000n - 35000n + 5000n;
      expect(result[0].remainingAmount).toBe(expectedRemaining);
    });
  });

  describe('findOne', () => {
    it('should return a category when found and user has permission', async () => {
      const mockCategory = {
        id: mockCategoryId,
        name: 'Test Category',
        description: 'Test Description',
        userId: mockUserId,
        budgetAmount: 50000,
        isActive: true,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);

      const result = await service.findOne(mockCategoryId, mockUserId);

      expect(mockPrismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: mockCategoryId },
      });
      expect(result).toBeInstanceOf(Category);
      expect(result.id).toBe(mockCategoryId);
    });

    it('should throw NotFoundException when category is not found', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.findOne(mockCategoryId, mockUserId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user does not own the category', async () => {
      const mockCategory = {
        id: mockCategoryId,
        name: 'Test Category',
        userId: 'other-user',
        budgetAmount: 50000,
        isActive: true,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);

      await expect(service.findOne(mockCategoryId, mockUserId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getUserSummary', () => {
    it('should return financial summary for user categories', async () => {
      const mockSummaryResult = [
        {
          totalBudget: BigInt(100000),
          totalSpent: BigInt(45000),
          totalIncome: BigInt(15000),
          remainingBudget: BigInt(70000),
        },
      ];

      mockPrismaService.$queryRaw.mockResolvedValue(mockSummaryResult);

      const result = await service.getUserSummary(mockUserId);

      expect(mockPrismaService.$queryRaw).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(CategoriesSummaryDto);
      expect(result.totalBudget).toBe('1.000,00');
      expect(result.totalSpent).toBe('450,00');
      expect(result.remainingBudget).toBe('700,00');
    });

    it('should return zero values when no summary data exists', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue(null);

      const result = await service.getUserSummary(mockUserId);

      expect(result.totalBudget).toBe('0,00');
      expect(result.totalSpent).toBe('0,00');
      expect(result.remainingBudget).toBe('0,00');
    });

    it('should return DTO with zero values when summary array is empty', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([]);

      const dto = await service.getUserSummary(mockUserId);

      expect(dto.totalBudget).toBe('0,00');
      expect(dto.totalSpent).toBe('0,00');
      expect(dto.remainingBudget).toBe('0,00');
    });

    it('should handle zero bigint values correctly', async () => {
      const mockSummaryResult = [
        {
          totalBudget: BigInt(0),
          totalSpent: BigInt(0),
          totalIncome: BigInt(0),
          remainingBudget: BigInt(0),
        },
      ];

      mockPrismaService.$queryRaw.mockResolvedValue(mockSummaryResult);

      const result = await service.getUserSummary(mockUserId);

      expect(result.totalBudget).toBe('0,00');
      expect(result.totalSpent).toBe('0,00');
      expect(result.remainingBudget).toBe('0,00');
    });

    it('should handle negative remaining budget', async () => {
      const mockSummaryResult = [
        {
          totalBudget: BigInt(50000),
          totalSpent: BigInt(75000),
          totalIncome: BigInt(0),
          remainingBudget: BigInt(-25000),
        },
      ];

      mockPrismaService.$queryRaw.mockResolvedValue(mockSummaryResult);

      const result = await service.getUserSummary(mockUserId);

      expect(result.totalBudget).toBe('500,00');
      expect(result.totalSpent).toBe('750,00');
      expect(result.remainingBudget).toBe('-250,00');
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const updateCategoryDto: UpdateCategoryDto = {
        name: 'Updated Category',
        budgetAmount: 750,
      };

      const mockExistingCategory = {
        id: mockCategoryId,
        name: 'Original Category',
        userId: mockUserId,
        budgetAmount: 50000n,
        isActive: true,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      const mockUpdatedCategory = {
        ...mockExistingCategory,
        name: updateCategoryDto.name,
        budgetAmount: 750n,
      };

      mockPrismaService.category.findUnique.mockResolvedValue(
        mockExistingCategory,
      );
      mockPrismaService.category.update.mockResolvedValue(mockUpdatedCategory);

      const result = await service.update(
        mockCategoryId,
        mockUserId,
        updateCategoryDto,
      );

      expect(mockPrismaService.category.update).toHaveBeenCalledWith({
        where: { id: mockCategoryId },
        data: {
          name: 'Updated Category',
          budgetAmount: 750n,
        },
      });
      expect(result).toBeInstanceOf(Category);
      expect(result.name).toBe('Updated Category');
    });
  });

  describe('remove', () => {
    it('should delete category with no transactions', async () => {
      const mockCategory = {
        id: mockCategoryId,
        name: 'Test Category',
        userId: mockUserId,
        budgetAmount: 50000,
        isActive: true,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.transaction.count.mockResolvedValue(0);
      mockPrismaService.category.delete.mockResolvedValue(mockCategory);

      await service.remove(mockCategoryId, mockUserId);

      expect(mockPrismaService.transaction.count).toHaveBeenCalledWith({
        where: { categoryId: mockCategoryId },
      });
      expect(mockPrismaService.category.delete).toHaveBeenCalledWith({
        where: { id: mockCategoryId },
      });
    });

    it('should move transactions to default category before deletion', async () => {
      const mockCategory = {
        id: mockCategoryId,
        name: 'Test Category',
        userId: mockUserId,
        budgetAmount: 50000,
        isActive: true,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      const mockDefaultCategory = {
        id: 'default-category-id',
        name: 'Uncategorized',
        userId: mockUserId,
        budgetAmount: 0,
        isActive: false,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.transaction.count.mockResolvedValue(5);
      mockPrismaService.category.findFirst.mockResolvedValue(null);
      mockPrismaService.category.create.mockResolvedValue(mockDefaultCategory);
      mockPrismaService.transaction.updateMany.mockResolvedValue({ count: 5 });
      mockPrismaService.category.delete.mockResolvedValue(mockCategory);

      await service.remove(mockCategoryId, mockUserId);

      expect(mockPrismaService.category.create).toHaveBeenCalledWith({
        data: {
          name: 'Uncategorized',
          description:
            'Default category for transactions from deleted categories',
          color: '#999999',
          userId: mockUserId,
          budgetAmount: 0,
          isActive: false,
        },
      });
      expect(mockPrismaService.transaction.updateMany).toHaveBeenCalledWith({
        where: { categoryId: mockCategoryId },
        data: {
          categoryId: mockDefaultCategory.id,
          updatedAt: expect.any(Date) as Date,
        },
      });
    });
  });
});
