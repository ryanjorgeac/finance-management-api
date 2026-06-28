import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../database/prisma.service';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoriesSummaryDto } from './dto/categories-summary.dto';
import { DEFAULT_CATEGORY_NAME } from '../common/constants';

describe('CategoriesService', () => {
  let service: CategoriesService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let prismaService: PrismaService;

  const mockPrismaService = {
    category: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createMany: jest.fn(),
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
        isDefault: false,
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
          id: 'default-cat',
          name: 'Sem categoria',
          description: 'Categoria padrão para transações sem categorias',
          color: null,
          icon: null,
          budgetAmount: BigInt(0),
          isActive: true,
          isDefault: true,
          createdAt: mockDate,
          updatedAt: mockDate,
          spentAmount: BigInt(0),
          incomeAmount: BigInt(0),
          transactionCount: 0,
        },
        {
          id: 'category-1',
          name: 'Category 1',
          description: 'Description 1',
          color: '#FF5733',
          icon: 'icon-1',
          budgetAmount: BigInt(50000),
          isActive: true,
          isDefault: false,
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
          isDefault: false,
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
      expect(result).toHaveLength(3);
      expect(result[0]).toBeInstanceOf(Category);
      expect(result[0].name).toBe('Sem categoria');
      expect(result[1].name).toBe('Category 1');
      expect(result[1].spentAmount).toBe(25000n);
      expect(result[2].name).toBe('Category 2');
    });

    it('should parse categories when color and icon are null', async () => {
      const mockCategoriesWithNullableVisuals = [
        {
          id: 'default-cat',
          name: 'Sem categoria',
          description: 'Categoria padrão para transações sem categorias',
          color: null,
          icon: null,
          budgetAmount: BigInt(0),
          isActive: true,
          isDefault: true,
          createdAt: mockDate,
          updatedAt: mockDate,
          spentAmount: BigInt(0),
          incomeAmount: BigInt(0),
          transactionCount: 0,
        },
        {
          id: 'category-null-visuals',
          name: 'No Visuals Category',
          description: 'nullable visuals',
          color: null,
          icon: null,
          budgetAmount: BigInt(10000),
          isActive: true,
          isDefault: false,
          createdAt: mockDate,
          updatedAt: mockDate,
          spentAmount: BigInt(0),
          incomeAmount: BigInt(0),
          transactionCount: 0,
        },
      ];

      mockPrismaService.$queryRaw.mockResolvedValue(
        mockCategoriesWithNullableVisuals,
      );

      const result = await service.findAll(mockUserId);

      expect(result).toHaveLength(2);
      expect(result[1].color).toBeNull();
      expect(result[1].icon).toBeNull();
    });

    it('should create default category when user has no categories', async () => {
      const mockDefaultCategory = {
        id: 'new-default-cat',
        name: 'Sem categoria',
        description: 'Categoria padrão para transações sem categorias',
        color: null,
        icon: null,
        budgetAmount: 0n,
        userId: mockUserId,
        isActive: true,
        isDefault: true,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      mockPrismaService.$queryRaw.mockResolvedValue([]);
      mockPrismaService.category.findFirst.mockResolvedValue(null);
      mockPrismaService.category.create.mockResolvedValue(mockDefaultCategory);

      const result = await service.findAll(mockUserId);

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Category);
      expect(result[0].name).toBe('Sem categoria');
      expect(mockPrismaService.$queryRaw).toHaveBeenCalledTimes(1);
    });

    it('should calculate remaining amount correctly for each category', async () => {
      const mockCategories = [
        {
          id: 'default-cat',
          name: 'Sem categoria',
          description: 'Categoria padrão para transações sem categorias',
          color: null,
          icon: null,
          budgetAmount: 0n,
          isActive: true,
          isDefault: false,
          createdAt: mockDate,
          updatedAt: mockDate,
          spentAmount: 0n,
          incomeAmount: 0n,
          transactionCount: 0,
        },
        {
          id: 'category-1',
          name: 'Test Category',
          description: 'Test',
          color: '#FF5733',
          icon: 'test',
          budgetAmount: 50000n,
          isActive: true,
          isDefault: false,
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
      expect(result[1].remainingAmount).toBe(expectedRemaining);
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
        isDefault: false,
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
        isDefault: false,
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
        isDefault: false,
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

    it('should throw ForbiddenException when trying to update the default category', async () => {
      const updateCategoryDto: UpdateCategoryDto = {
        name: 'Trying to change default',
        budgetAmount: 1000,
      };

      const mockDefaultCategory = {
        id: mockCategoryId,
        name: DEFAULT_CATEGORY_NAME,
        userId: mockUserId,
        budgetAmount: 0n,
        isActive: true,
        isDefault: true,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      mockPrismaService.category.findUnique.mockResolvedValue(
        mockDefaultCategory,
      );

      await expect(
        service.update(mockCategoryId, mockUserId, updateCategoryDto),
      ).rejects.toThrow(ForbiddenException);

      expect(mockPrismaService.category.update).not.toHaveBeenCalled();
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
        isDefault: false,
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
        isDefault: false,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      const mockDefaultCategory = {
        id: 'default-category-id',
        name: 'Sem categoria',
        userId: mockUserId,
        budgetAmount: 0,
        isActive: true,
        isDefault: true,
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
          name: 'Sem categoria',
          description: 'Categoria padrão para transações sem categorias',
          color: null,
          icon: null,
          userId: mockUserId,
          budgetAmount: 0,
          isActive: true,
          isDefault: true,
        },
      });
      expect(mockPrismaService.transaction.updateMany).toHaveBeenCalledWith({
        where: { categoryId: mockCategoryId },
        data: {
          categoryId: mockDefaultCategory.id,
          updatedAt: expect.any(Date),
        },
      });
    });

    it('should throw ForbiddenException when trying to delete the default category', async () => {
      const mockDefaultCategory = {
        id: mockCategoryId,
        name: DEFAULT_CATEGORY_NAME,
        userId: mockUserId,
        budgetAmount: 0,
        isActive: true,
        isDefault: true,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      mockPrismaService.category.findUnique.mockResolvedValue(
        mockDefaultCategory,
      );

      await expect(service.remove(mockCategoryId, mockUserId)).rejects.toThrow(
        ForbiddenException,
      );

      expect(mockPrismaService.category.delete).not.toHaveBeenCalled();
    });
  });

  describe('bulkCreate', () => {
    const validDtos = [
      { name: 'Groceries', budgetAmount: 50000, isActive: true },
      { name: 'Transport', budgetAmount: 20000, isActive: true },
    ] as CreateCategoryDto[];

    it('should bulk create categories and return count', async () => {
      mockPrismaService.category.createMany.mockResolvedValue({ count: 2 });

      const result = await service.bulkCreate(mockUserId, validDtos);

      expect(mockPrismaService.category.createMany).toHaveBeenCalledWith({
        data: [
          {
            name: 'Groceries',
            budgetAmount: 50000n,
            isActive: true,
            userId: mockUserId,
          },
          {
            name: 'Transport',
            budgetAmount: 20000n,
            isActive: true,
            userId: mockUserId,
          },
        ],
      });
      expect(result).toEqual({ count: 2 });
    });

    it('should throw ForbiddenException when any category uses the reserved default name', async () => {
      const dtosWithReserved = [
        ...validDtos,
        {
          name: DEFAULT_CATEGORY_NAME,
          budgetAmount: 0,
          isActive: true,
        } as CreateCategoryDto,
      ];

      await expect(
        service.bulkCreate(mockUserId, dtosWithReserved),
      ).rejects.toThrow(ForbiddenException);

      expect(mockPrismaService.category.createMany).not.toHaveBeenCalled();
    });

    it('should convert each budgetAmount to bigint via centsToBigInt', async () => {
      const dtos = [
        { name: 'Bills', budgetAmount: 150000, isActive: true },
      ] as CreateCategoryDto[];
      mockPrismaService.category.createMany.mockResolvedValue({ count: 1 });

      await service.bulkCreate(mockUserId, dtos);

      expect(mockPrismaService.category.createMany).toHaveBeenCalledWith({
        data: [
          {
            name: 'Bills',
            budgetAmount: 150000n,
            isActive: true,
            userId: mockUserId,
          },
        ],
      });
    });
  });

  describe('ensureDefaultCategory', () => {
    it('should return existing default category if it exists', async () => {
      const mockDefaultCategory = {
        id: 'default-cat-id',
        name: DEFAULT_CATEGORY_NAME,
        description: 'Categoria padrão para transações sem categorias',
        color: null,
        icon: null,
        budgetAmount: 0n,
        userId: mockUserId,
        isActive: true,
        isDefault: true,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      mockPrismaService.category.findFirst.mockResolvedValue(
        mockDefaultCategory,
      );

      const result = await service.ensureDefaultCategory(mockUserId);

      expect(result).toBeInstanceOf(Category);
      expect(result.name).toBe(DEFAULT_CATEGORY_NAME);
      expect(mockPrismaService.category.create).not.toHaveBeenCalled();
    });

    it('should create default category if it does not exist', async () => {
      const mockCreatedCategory = {
        id: 'new-default-cat-id',
        name: DEFAULT_CATEGORY_NAME,
        description: 'Categoria padrão para transações sem categorias',
        color: null,
        icon: null,
        budgetAmount: 0n,
        userId: mockUserId,
        isActive: true,
        isDefault: true,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      mockPrismaService.category.findFirst.mockResolvedValue(null);
      mockPrismaService.category.create.mockResolvedValue(mockCreatedCategory);

      const result = await service.ensureDefaultCategory(mockUserId);

      expect(result).toBeInstanceOf(Category);
      expect(result.name).toBe(DEFAULT_CATEGORY_NAME);
      expect(mockPrismaService.category.create).toHaveBeenCalled();
    });
  });
});
