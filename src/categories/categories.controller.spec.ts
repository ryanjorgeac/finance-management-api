import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CategoriesController } from '@/categories/categories.controller';
import { CategoriesService } from '@/categories/categories.service';
import { Category } from '@/categories/entities/category.entity';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryResponseDto,
  CategoriesSummaryDto,
  BulkCreateCategoryDto,
  BulkCreateCategoryResponseDto,
} from '@/categories/dto';

describe('CategoriesController', () => {
  let controller: CategoriesController;

  const mockCategoriesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getUserSummary: jest.fn(),
    bulkCreate: jest.fn(),
  };

  const mockUser = { sub: 'user-123' };
  const mockCategoryId = 'category-123';
  const mockDate = new Date('2025-10-15T00:00:00.000Z');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new category and return CategoryResponseDto', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'Test Category',
        description: 'Test Description',
        color: '#FF5733',
        icon: 'test-icon',
        budgetAmount: 50000,
        isActive: true,
      };

      const mockCategory = new Category({
        id: mockCategoryId,
        ...createCategoryDto,
        budgetAmount: createCategoryDto.budgetAmount
          ? BigInt(createCategoryDto.budgetAmount)
          : BigInt(0),
        userId: mockUser.sub,
        createdAt: mockDate,
        updatedAt: mockDate,
      });

      mockCategoriesService.create.mockResolvedValue(mockCategory);

      const result = await controller.create(mockUser, createCategoryDto);

      expect(mockCategoriesService.create).toHaveBeenCalledWith(
        mockUser.sub,
        createCategoryDto,
      );
      expect(result).toBeInstanceOf(CategoryResponseDto);
      expect(result.name).toBe(createCategoryDto.name);
    });
  });

  describe('findAll', () => {
    it('should return array of CategoryResponseDto', async () => {
      const mockCategories = [
        new Category({
          id: 'category-1',
          name: 'Category 1',
          description: 'Description 1',
          userId: mockUser.sub,
          budgetAmount: 50000n,
          spentAmount: 25000n,
          incomeAmount: 5000n,
          transactionCount: 10,
          isActive: true,
          createdAt: mockDate,
          updatedAt: mockDate,
        }),
        new Category({
          id: 'category-2',
          name: 'Category 2',
          description: 'Description 2',
          userId: mockUser.sub,
          budgetAmount: 30000n,
          spentAmount: 15000n,
          incomeAmount: 0n,
          transactionCount: 5,
          isActive: true,
          createdAt: mockDate,
          updatedAt: mockDate,
        }),
      ];

      mockCategoriesService.findAll.mockResolvedValue(mockCategories);

      const result = await controller.findAll(mockUser);

      expect(mockCategoriesService.findAll).toHaveBeenCalledWith(mockUser.sub);
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(CategoryResponseDto);
      expect(result[1]).toBeInstanceOf(CategoryResponseDto);
      expect(result[0].name).toBe('Category 1');
      expect(result[1].name).toBe('Category 2');
    });

    it('should return empty array when no categories found', async () => {
      mockCategoriesService.findAll.mockResolvedValue([]);

      const result = await controller.findAll(mockUser);

      expect(result).toEqual([]);
    });
  });

  describe('getSummary', () => {
    it('should return CategoriesSummaryDto', async () => {
      const mockSummary = new CategoriesSummaryDto({
        totalBudget: '1.000,00',
        totalSpent: '450,00',
        remainingBudget: '700,00',
      });

      mockCategoriesService.getUserSummary.mockResolvedValue(mockSummary);

      const result = await controller.getSummary(mockUser);

      expect(mockCategoriesService.getUserSummary).toHaveBeenCalledWith(
        mockUser.sub,
      );
      expect(result).toBeInstanceOf(CategoriesSummaryDto);
      expect(result.totalBudget).toBe('1.000,00');
      expect(result.totalSpent).toBe('450,00');
      expect(result.remainingBudget).toBe('700,00');
    });

    it('should handle zero values in summary', async () => {
      const mockSummary = new CategoriesSummaryDto({
        totalBudget: '0,00',
        totalSpent: '0,00',
        remainingBudget: '0,00',
      });

      mockCategoriesService.getUserSummary.mockResolvedValue(mockSummary);

      const result = await controller.getSummary(mockUser);

      expect(result.totalBudget).toBe('0,00');
      expect(result.totalSpent).toBe('0,00');
      expect(result.remainingBudget).toBe('0,00');
    });

    it('should handle negative remaining budget', async () => {
      const mockSummary = new CategoriesSummaryDto({
        totalBudget: '500,00',
        totalSpent: '750,00',
        remainingBudget: '-250,00',
      });

      mockCategoriesService.getUserSummary.mockResolvedValue(mockSummary);

      const result = await controller.getSummary(mockUser);

      expect(result.remainingBudget).toBe('-250,00');
    });
  });

  describe('findOne', () => {
    it('should return CategoryResponseDto when category is found', async () => {
      const mockCategory = new Category({
        id: mockCategoryId,
        name: 'Test Category',
        description: 'Test Description',
        userId: mockUser.sub,
        budgetAmount: 50000n,
        isActive: true,
        createdAt: mockDate,
        updatedAt: mockDate,
      });

      mockCategoriesService.findOne.mockResolvedValue(mockCategory);

      const result = await controller.findOne(mockUser, mockCategoryId);

      expect(mockCategoriesService.findOne).toHaveBeenCalledWith(
        mockCategoryId,
        mockUser.sub,
      );
      expect(result).toBeInstanceOf(CategoryResponseDto);
      expect(result.id).toBe(mockCategoryId);
    });

    it('should throw NotFoundException when category is not found', async () => {
      mockCategoriesService.findOne.mockResolvedValue(null);

      await expect(
        controller.findOne(mockUser, mockCategoryId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update category and return CategoryResponseDto', async () => {
      const updateCategoryDto: UpdateCategoryDto = {
        name: 'Updated Category',
        budgetAmount: 750,
      };

      const mockUpdatedCategory = new Category({
        id: mockCategoryId,
        ...updateCategoryDto,
        budgetAmount: updateCategoryDto.budgetAmount
          ? BigInt(updateCategoryDto.budgetAmount * 100)
          : 0n,
        userId: mockUser.sub,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockCategoriesService.update.mockResolvedValue(mockUpdatedCategory);

      const result = await controller.update(
        mockUser,
        mockCategoryId,
        updateCategoryDto,
      );

      expect(mockCategoriesService.update).toHaveBeenCalledWith(
        mockCategoryId,
        mockUser.sub,
        updateCategoryDto,
      );
      expect(result).toBeInstanceOf(CategoryResponseDto);
      expect(result.name).toBe('Updated Category');
    });
  });

  describe('bulkCreate', () => {
    it('should delegate to service and return BulkCreateCategoryResponseDto', async () => {
      const bulkDto: BulkCreateCategoryDto = {
        categories: [
          { name: 'Groceries', budgetAmount: 50000, isActive: true },
          { name: 'Transport', budgetAmount: 20000, isActive: true },
        ] as CreateCategoryDto[],
      };

      mockCategoriesService.bulkCreate.mockResolvedValue({ count: 2 });

      const result = await controller.bulkCreate(mockUser, bulkDto);

      expect(mockCategoriesService.bulkCreate).toHaveBeenCalledWith(
        mockUser.sub,
        bulkDto.categories,
      );
      expect(result).toBeInstanceOf(BulkCreateCategoryResponseDto);
      expect(result.count).toBe(2);
    });
  });

  describe('remove', () => {
    it('should remove category successfully', async () => {
      mockCategoriesService.remove.mockResolvedValue(undefined);

      await controller.remove(mockUser, mockCategoryId);

      expect(mockCategoriesService.remove).toHaveBeenCalledWith(
        mockCategoryId,
        mockUser.sub,
      );
    });
  });
});
