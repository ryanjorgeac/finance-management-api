import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../src/auth/auth.controller';
import { AuthService } from '../../src/auth/auth.service';
import {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  ResetPasswordDto,
  AuthResponseDto,
} from '../../src/auth/dto';
import { UserRole } from '@prisma/client';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
    refreshToken: jest.fn(),
    resetPassword: jest.fn(),
  };

  const mockAuthResponse: AuthResponseDto = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    user: {
      id: '1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: UserRole.USER,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login successfully and return auth response', async () => {
      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(mockAuthResponse);
    });

    it('should handle login errors', async () => {
      const error = new Error('Invalid credentials');
      mockAuthService.login.mockRejectedValue(error);

      await expect(controller.login(loginDto)).rejects.toThrow(error);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      password: 'password123',
    };

    it('should register successfully and return auth response', async () => {
      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(mockAuthResponse);
    });

    it('should handle registration errors', async () => {
      const error = new Error('User already exists');
      mockAuthService.register.mockRejectedValue(error);

      await expect(controller.register(registerDto)).rejects.toThrow(error);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('refreshToken', () => {
    const refreshTokenDto: RefreshTokenDto = {
      refreshToken: 'valid-refresh-token',
    };

    it('should refresh token successfully and return auth response', async () => {
      mockAuthService.refreshToken.mockResolvedValue(mockAuthResponse);

      const result = await controller.refreshToken(refreshTokenDto);

      expect(authService.refreshToken).toHaveBeenCalledWith(
        refreshTokenDto.refreshToken,
      );
      expect(result).toEqual(mockAuthResponse);
    });

    it('should handle refresh token errors', async () => {
      const error = new Error('Invalid refresh token');
      mockAuthService.refreshToken.mockRejectedValue(error);

      await expect(controller.refreshToken(refreshTokenDto)).rejects.toThrow(
        error,
      );
      expect(authService.refreshToken).toHaveBeenCalledWith(
        refreshTokenDto.refreshToken,
      );
    });
  });

  describe('resetPassword', () => {
    const resetPasswordDto: ResetPasswordDto = {
      token: 'valid-reset-token',
      newPassword: 'newPassword123',
    };

    it('should reset password successfully and return auth response', async () => {
      mockAuthService.resetPassword.mockResolvedValue(mockAuthResponse);

      const result = await controller.resetPassword(resetPasswordDto);

      expect(authService.resetPassword).toHaveBeenCalledWith(resetPasswordDto);
      expect(result).toEqual(mockAuthResponse);
    });

    it('should handle reset password errors', async () => {
      const error = new Error('Invalid or expired token');
      mockAuthService.resetPassword.mockRejectedValue(error);

      await expect(controller.resetPassword(resetPasswordDto)).rejects.toThrow(
        error,
      );
      expect(authService.resetPassword).toHaveBeenCalledWith(resetPasswordDto);
    });
  });
});
