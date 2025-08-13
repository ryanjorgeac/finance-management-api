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
} from '@/categories/dto';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  const mockCategoriesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getUserSummary: jest.fn(),
  };

  const mockUser = { sub: 'user-123' };
  const mockCategoryId = 'category-123';

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
    service = module.get<CategoriesService>(CategoriesService);
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
        budgetAmount: 500,
        isActive: true,
      };

      const mockCategory = new Category({
        id: mockCategoryId,
        ...createCategoryDto,
        budgetAmount: createCategoryDto.budgetAmount
          ? BigInt(createCategoryDto.budgetAmount * 100)
          : BigInt(0), // 500.00 in cents
        userId: mockUser.sub,
        createdAt: new Date(),
        updatedAt: new Date(),
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
          createdAt: new Date(),
          updatedAt: new Date(),
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
          createdAt: new Date(),
          updatedAt: new Date(),
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
        totalBudget: '1000',
        totalSpent: '450',
        remainingBudget: '700',
      });

      mockCategoriesService.getUserSummary.mockResolvedValue(mockSummary);

      const result = await controller.getSummary(mockUser);

      expect(mockCategoriesService.getUserSummary).toHaveBeenCalledWith(
        mockUser.sub,
      );
      expect(result).toBeInstanceOf(CategoriesSummaryDto);
      expect(result.totalBudget).toBe('1000.00');
      expect(result.totalSpent).toBe('450.00');
      expect(result.remainingBudget).toBe('700.00');
    });

    it('should handle zero values in summary', async () => {
      const mockSummary = new CategoriesSummaryDto({
        totalBudget: '0',
        totalSpent: '0',
        remainingBudget: '0',
      });

      mockCategoriesService.getUserSummary.mockResolvedValue(mockSummary);

      const result = await controller.getSummary(mockUser);

      expect(result.totalBudget).toBe('0.00');
      expect(result.totalSpent).toBe('0.00');
      expect(result.remainingBudget).toBe('0.00');
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
        createdAt: new Date(),
        updatedAt: new Date(),
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
