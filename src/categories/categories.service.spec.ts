import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CategoriesService } from '../../src/categories/categories.service';
import { PrismaService } from '../../src/database/prisma.service';
import { CreateCategoryDto } from '../../src/categories/dto/create-category.dto';
import { UpdateCategoryDto } from '../../src/categories/dto/update-category.dto';
import { Category } from '../../src/categories/entities/category.entity';

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
  };

  const mockCategory = {
    id: '1',
    name: 'Food',
    description: 'Food expenses',
    color: '#FF5733',
    userId: 'user1',
    budgetAmount: 500.0,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const userId = 'user1';

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

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createCategoryDto: CreateCategoryDto = {
      name: 'Food',
      description: 'Food expenses',
      color: '#FF5733',
      budgetAmount: 500.0,
    };

    it('should create a new category successfully', async () => {
      mockPrismaService.category.create.mockResolvedValue(mockCategory);

      const result = await service.create(userId, createCategoryDto);

      expect(mockPrismaService.category.create).toHaveBeenCalledWith({
        data: {
          ...createCategoryDto,
          userId,
        },
      });
      expect(result).toBeInstanceOf(Category);
    });
  });

  describe('findAll', () => {
    it('should return all categories for a user', async () => {
      const mockCategories = [mockCategory];
      mockPrismaService.category.findMany.mockResolvedValue(mockCategories);

      const result = await service.findAll(userId);

      expect(mockPrismaService.category.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { name: 'asc' },
        include: {
          transactions: {
            select: {
              amount: true,
              type: true,
              date: true,
            },
            orderBy: { date: 'desc' },
          },
        },
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Category);
    });

    it('should return empty array if no categories found', async () => {
      mockPrismaService.category.findMany.mockResolvedValue([]);

      const result = await service.findAll(userId);

      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return a category by id for authorized user', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);

      const result = await service.findOne('1', userId);

      expect(mockPrismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toBeInstanceOf(Category);
    });

    it('should throw NotFoundException if category not found', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.findOne('999', userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user not authorized', async () => {
      const unauthorizedCategory = { ...mockCategory, userId: 'user2' };
      mockPrismaService.category.findUnique.mockResolvedValue(unauthorizedCategory);

      await expect(service.findOne('1', userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    const updateCategoryDto: UpdateCategoryDto = {
      name: 'Updated Food',
      budgetAmount: 600.0,
    };

    it('should update a category successfully', async () => {
      const updatedCategory = { ...mockCategory, ...updateCategoryDto };
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.category.update.mockResolvedValue(updatedCategory);

      const result = await service.update('1', userId, updateCategoryDto);

      expect(mockPrismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(mockPrismaService.category.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateCategoryDto,
      });
      expect(result).toBeInstanceOf(Category);
    });

    it('should throw NotFoundException if category not found', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(
        service.update('999', userId, updateCategoryDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user not authorized', async () => {
      const unauthorizedCategory = { ...mockCategory, userId: 'user2' };
      mockPrismaService.category.findUnique.mockResolvedValue(unauthorizedCategory);

      await expect(
        service.update('1', userId, updateCategoryDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should remove category with no transactions', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.transaction.count.mockResolvedValue(0);
      mockPrismaService.category.delete.mockResolvedValue(mockCategory);

      await service.remove('1', userId);

      expect(mockPrismaService.transaction.count).toHaveBeenCalledWith({
        where: { categoryId: '1' },
      });
      expect(mockPrismaService.category.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should move transactions to default category before removing category', async () => {
      const defaultCategory = {
        id: 'default',
        name: 'Uncategorized',
        userId,
      };

      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.transaction.count.mockResolvedValue(5);
      mockPrismaService.category.findFirst.mockResolvedValue(null);
      mockPrismaService.category.create.mockResolvedValue(defaultCategory);
      mockPrismaService.transaction.updateMany.mockResolvedValue({ count: 5 });
      mockPrismaService.category.delete.mockResolvedValue(mockCategory);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.remove('1', userId);

      expect(mockPrismaService.category.findFirst).toHaveBeenCalledWith({
        where: {
          userId,
          name: 'Deleted category',
        },
      });
      expect(mockPrismaService.category.create).toHaveBeenCalledWith({
        data: {
          name: 'Uncategorized',
          description: 'Default category for transactions from deleted categories',
          color: '#999999',
          userId,
          budgetAmount: 0,
          isActive: false,
        },
      });
      expect(mockPrismaService.transaction.updateMany).toHaveBeenCalledWith({
        where: { categoryId: '1' },
        data: {
          categoryId: defaultCategory.id,
          updatedAt: expect.any(Date),
        },
      });
      expect(consoleSpy).toHaveBeenCalledWith(
        'Moved 5 transactions to "Deleted category"',
      );

      consoleSpy.mockRestore();
    });

    it('should use existing default category if available', async () => {
      const existingDefaultCategory = {
        id: 'existing-default',
        name: 'Deleted category',
        userId,
      };

      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.transaction.count.mockResolvedValue(3);
      mockPrismaService.category.findFirst.mockResolvedValue(existingDefaultCategory);
      mockPrismaService.transaction.updateMany.mockResolvedValue({ count: 3 });
      mockPrismaService.category.delete.mockResolvedValue(mockCategory);

      await service.remove('1', userId);

      expect(mockPrismaService.category.create).not.toHaveBeenCalled();
      expect(mockPrismaService.transaction.updateMany).toHaveBeenCalledWith({
        where: { categoryId: '1' },
        data: {
          categoryId: existingDefaultCategory.id,
          updatedAt: expect.any(Date),
        },
      });
    });

    it('should throw NotFoundException if category not found', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.remove('999', userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user not authorized', async () => {
      const unauthorizedCategory = { ...mockCategory, userId: 'user2' };
      mockPrismaService.category.findUnique.mockResolvedValue(unauthorizedCategory);

      await expect(service.remove('1', userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
