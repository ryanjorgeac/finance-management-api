import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../../src/auth/auth.service';
import { UsersService } from '../../src/users/users.service';
import { LoginDto } from '../../src/auth/dto/login.dto';
import { RegisterDto } from '../../src/auth/dto/register.dto';
import { ResetPasswordDto } from '../../src/auth/dto/reset-password.dto';
import { UserResponseDto } from '../../src/users/dto/user-response.dto';
import { User } from '../../src/users/entities/user.entity';
import { UserRole } from '@prisma/client';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    password: '$2b$10$hashedpassword',
    role: UserRole.USER,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockUserResponse = new UserResponseDto({
    id: '1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: UserRole.USER,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  });

  const mockUsersService = {
    findByEmail: jest.fn(),
    comparePassword: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const mockConfig = {
        JWT_SECRET: 'test-secret',
        JWT_EXPIRATION: '1h',
      };
      return mockConfig[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password for valid credentials', async () => {
      const userEntity = new User(mockUser);
      mockUsersService.findByEmail.mockResolvedValue(userEntity);
      mockUsersService.comparePassword.mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password');

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockUsersService.comparePassword).toHaveBeenCalledWith(userEntity, 'password');
      expect(result).toBeInstanceOf(UserResponseDto);
      expect(result.password).toBeUndefined();
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.validateUser('notfound@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const userEntity = new User(mockUser);
      mockUsersService.findByEmail.mockResolvedValue(userEntity);
      mockUsersService.comparePassword.mockResolvedValue(false);

      await expect(
        service.validateUser('test@example.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password',
    };

    it('should return tokens for valid credentials', async () => {
      const userEntity = new User(mockUser);
      mockUsersService.findByEmail.mockResolvedValue(userEntity);
      mockUsersService.comparePassword.mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      password: 'password123',
    };

    it('should create user and return tokens', async () => {
      mockUsersService.create.mockResolvedValue(mockUserResponse);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await service.register(registerDto);

      expect(mockUsersService.create).toHaveBeenCalledWith(registerDto);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
    });

    it('should throw ConflictException if user creation fails with conflict', async () => {
      mockUsersService.create.mockRejectedValue(new ConflictException('User already exists'));

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it('should throw HttpException for unexpected errors', async () => {
      mockUsersService.create.mockRejectedValue(new Error('Unexpected error'));

      await expect(service.register(registerDto)).rejects.toThrow(HttpException);
    });
  });

  describe('refreshToken', () => {
    it('should return new tokens for valid refresh token', async () => {
      const refreshToken = 'valid-refresh-token';
      const payload = { sub: '1' };
      
      mockJwtService.verify.mockReturnValue(payload);
      mockUsersService.findOne.mockResolvedValue(mockUserResponse);
      mockJwtService.sign.mockReturnValue('new-jwt-token');

      const result = await service.refreshToken(refreshToken);

      expect(mockJwtService.verify).toHaveBeenCalledWith(refreshToken, {
        secret: 'test-secret',
      });
      expect(mockUsersService.findOne).toHaveBeenCalledWith('1');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      const refreshToken = 'invalid-refresh-token';
      
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshToken(refreshToken)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('resetPassword', () => {
    const resetPasswordDto: ResetPasswordDto = {
      token: 'valid-reset-token',
      newPassword: 'newPassword123',
    };

    it('should reset password and return tokens', async () => {
      const payload = { sub: '1' };
      
      mockJwtService.verify.mockReturnValue(payload);
      mockUsersService.findOne.mockResolvedValue(mockUserResponse);
      mockUsersService.update.mockResolvedValue(mockUserResponse);
      mockJwtService.sign.mockReturnValue('new-jwt-token');

      const result = await service.resetPassword(resetPasswordDto);

      expect(mockJwtService.verify).toHaveBeenCalledWith(resetPasswordDto.token, {
        secret: 'test-secret',
      });
      expect(mockUsersService.findOne).toHaveBeenCalledWith('1');
      expect(mockUsersService.update).toHaveBeenCalledWith('1', {
        password: 'newPassword123',
      });
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const payload = { sub: '999' };
      
      mockJwtService.verify.mockReturnValue(payload);
      mockUsersService.findOne.mockResolvedValue(null);

      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('generateTokens (private method)', () => {
    it('should generate access and refresh tokens with correct payload', async () => {
      mockJwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const result = await service.login({
        email: 'test@example.com',
        password: 'password',
      });

      // Since generateTokens is private, we test it through login
      const userEntity = new User(mockUser);
      mockUsersService.findByEmail.mockResolvedValue(userEntity);
      mockUsersService.comparePassword.mockResolvedValue(true);

      await service.login({ email: 'test@example.com', password: 'password' });

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
        }),
        expect.objectContaining({
          secret: 'test-secret',
          expiresIn: '1h',
        }),
      );

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
        }),
        expect.objectContaining({
          secret: 'test-secret',
          expiresIn: '7d',
        }),
      );
    });
  });
});
