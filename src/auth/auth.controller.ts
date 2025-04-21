import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RegisterDto,
  AuthResponseDto,
  RefreshTokenDto,
  ResetPasswordDto,
} from './dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ExceptionResponseDto } from 'src/exceptions/exception-response.dto';

@ApiTags('Auth')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
    type: ExceptionResponseDto,
  })
  @ApiBody({ type: LoginDto })
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return await this.authService.login(loginDto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email could not be created',
    type: ExceptionResponseDto,
    schema: {
      example: {
        statusCode: 409,
        timestamp: '2025-04-21T12:34:56.789Z',
        path: '/api/v1/auth/register',
        message: 'User cannot be created with this email',
        descriptionOrOptions: 'User cannot be created with this email',
      },
    },
  })
  @ApiBody({ type: RegisterDto })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    const authResult = await this.authService.register(registerDto);
    return authResult;
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<AuthResponseDto> {
    const authResult = await this.authService.refreshToken(
      refreshTokenDto.refreshToken,
    );
    return authResult;
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using token' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 401, description: 'Invalid or expired token' })
  @ApiBody({ type: ResetPasswordDto })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<object> {
    return await this.authService.resetPassword(resetPasswordDto);
  }
}
