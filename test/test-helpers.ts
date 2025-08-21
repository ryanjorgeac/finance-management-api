import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../src/database/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

export const createMockPrismaService = () => ({
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $transaction: jest.fn(),
  cleanDb: jest.fn(),
  user: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  category: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  transaction: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
});

export const createMockConfigService = () => ({
  get: jest.fn((key: string) => {
    const mockConfig = {
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test_db',
      JWT_SECRET: 'test-secret',
      JWT_EXPIRATION: '1h',
      NODE_ENV: 'test',
    };
    return mockConfig[key];
  }),
});

export const createMockJwtService = () => ({
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
  verify: jest.fn().mockReturnValue({ sub: 'user-id', email: 'test@test.com' }),
});

export const createTestingModule = async (providers: any[] = []) => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      ...providers,
      {
        provide: PrismaService,
        useValue: createMockPrismaService(),
      },
      {
        provide: ConfigService,
        useValue: createMockConfigService(),
      },
      {
        provide: JwtService,
        useValue: createMockJwtService(),
      },
    ],
  }).compile();

  return module;
};

export const mockUser = {
  id: '1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  password: '$2b$10$hashedpassword',
  role: 'USER',
  balance: 1000.0,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockCategory = {
  id: '1',
  name: 'Food',
  description: 'Food expenses',
  color: '#FF5733',
  type: 'EXPENSE',
  userId: '1',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockTransaction = {
  id: '1',
  description: 'Test transaction',
  amount: 100.0,
  type: 'EXPENSE',
  date: new Date('2024-01-01'),
  categoryId: '1',
  userId: '1',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};
