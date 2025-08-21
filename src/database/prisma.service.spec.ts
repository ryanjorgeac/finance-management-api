import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../src/database/prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      switch (key) {
        case 'DATABASE_URL':
          return 'postgresql://test:test@localhost:5432/test_db';
        case 'NODE_ENV':
          return 'test';
        default:
          return undefined;
      }
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should configure database URL from config service', () => {
    expect(configService.get).toHaveBeenCalledWith('DATABASE_URL');
  });

  it('should configure logging based on NODE_ENV', () => {
    expect(configService.get).toHaveBeenCalledWith('NODE_ENV');
  });

  describe('onModuleInit', () => {
    it('should connect to database', async () => {
      const connectSpy = jest.spyOn(service, '$connect').mockResolvedValue();
      
      await service.onModuleInit();
      
      expect(connectSpy).toHaveBeenCalled();
    });
  });

  describe('onModuleDestroy', () => {
    it('should disconnect from database', async () => {
      const disconnectSpy = jest.spyOn(service, '$disconnect').mockResolvedValue();
      
      await service.onModuleDestroy();
      
      expect(disconnectSpy).toHaveBeenCalled();
    });
  });

  describe('cleanDb', () => {
    it('should delete all data in transaction', async () => {
      const mockDeleteMany = jest.fn();
      const mockTransaction = jest.fn().mockResolvedValue([]);
      
      // Mock the service methods
      jest.spyOn(service, '$transaction').mockImplementation(mockTransaction);
      
      // Mock the Prisma model methods
      Object.defineProperty(service, 'user', {
        value: { deleteMany: mockDeleteMany },
        writable: true,
      });
      Object.defineProperty(service, 'category', {
        value: { deleteMany: mockDeleteMany },
        writable: true,
      });
      Object.defineProperty(service, 'transaction', {
        value: { deleteMany: mockDeleteMany },
        writable: true,
      });
      
      await service.cleanDb();
      
      expect(mockTransaction).toHaveBeenCalled();
    });
  });
});
