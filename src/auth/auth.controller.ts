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

@ApiTags('auth')
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
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiBody({ type: LoginDto })
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<object> {
    const authResult = await this.authService.login(loginDto);
    return authResult;
  }

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Bad request - validation error or user already exists',
  })
  @ApiBody({ type: RegisterDto })
  async register(@Body() registerDto: RegisterDto): Promise<object> {
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
  ): Promise<object> {
    const authResult = await this.authService.refreshToken(
      refreshTokenDto.refreshToken,
    );
    return authResult;
  }

  //   @Post('forgot-password')
  //   @HttpCode(HttpStatus.OK)
  //   @ApiOperation({ summary: 'Request password reset' })
  //   @ApiResponse({ status: 200, description: 'Password reset token generated' })
  //   @ApiResponse({ status: 400, description: 'Email not found' })
  //   @ApiBody({ type: ForgotPasswordDto })
  //   async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
  //     return await this.authService.forgotPassword(forgotPasswordDto);
  //   }

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
