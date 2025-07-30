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
        userId: mockUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.category.create.mockResolvedValue(mockCreatedCategory);

      const result = await service.create(mockUserId, createCategoryDto);

      expect(mockPrismaService.category.create).toHaveBeenCalledWith({
        data: {
          ...createCategoryDto,
          budgetAmount: 50000, // Converted to cents (500 * 100)
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
          budgetAmount: BigInt(50000), // 500.00 in cents
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          spentAmount: BigInt(25000), // 250.00 in cents
          incomeAmount: BigInt(5000), // 50.00 in cents
          transactionCount: 10,
        },
        {
          id: 'category-2',
          name: 'Category 2',
          description: 'Description 2',
          color: '#33FF57',
          icon: 'icon-2',
          budgetAmount: BigInt(30000), // 300.00 in cents
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          spentAmount: BigInt(15000), // 150.00 in cents
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
      expect(result[0].spentAmount).toBe(25000);
      expect(result[1].name).toBe('Category 2');
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
        createdAt: new Date(),
        updatedAt: new Date(),
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
        createdAt: new Date(),
        updatedAt: new Date(),
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
          totalBudget: BigInt(100000), // 1000.00 in cents
          totalSpent: BigInt(45000), // 450.00 in cents
          totalIncome: BigInt(15000), // 150.00 in cents
        },
      ];

      mockPrismaService.$queryRaw.mockResolvedValue(mockSummaryResult);

      const result = await service.getUserSummary(mockUserId);

      expect(mockPrismaService.$queryRaw).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(CategoriesSummaryDto);
      expect(result.totalBudget).toBe(100000);
      expect(result.totalSpent).toBe(45000);
      expect(result.remainingBudget).toBe(70000); // 100000 - 45000 + 15000
    });

    it('should handle null totalBudget', async () => {
      const mockSummaryResult = [
        {
          totalBudget: null,
          totalSpent: BigInt(45000),
          totalIncome: BigInt(15000),
        },
      ];

      mockPrismaService.$queryRaw.mockResolvedValue(mockSummaryResult);

      const result = await service.getUserSummary(mockUserId);

      expect(result.totalBudget).toBe(0);
      expect(result.remainingBudget).toBe(-30000); // 0 - 45000 + 15000
    });

    it('should handle zero values', async () => {
      const mockSummaryResult = [
        {
          totalBudget: BigInt(0),
          totalSpent: BigInt(0),
          totalIncome: BigInt(0),
        },
      ];

      mockPrismaService.$queryRaw.mockResolvedValue(mockSummaryResult);

      const result = await service.getUserSummary(mockUserId);

      expect(result.totalBudget).toBe(0);
      expect(result.totalSpent).toBe(0);
      expect(result.remainingBudget).toBe(0);
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
        budgetAmount: 50000,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUpdatedCategory = {
        ...mockExistingCategory,
        ...updateCategoryDto,
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
          budgetAmount: 75000, // Converted to cents (750 * 100)
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
        createdAt: new Date(),
        updatedAt: new Date(),
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
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockDefaultCategory = {
        id: 'default-category-id',
        name: 'Uncategorized',
        userId: mockUserId,
        budgetAmount: 0,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
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
