import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  UnauthorizedException,
  UseFilters,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { UserResponseDto } from 'src/users/dto/user-response.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthResponseDto, AuthUserDto } from './dto';
import { HttpExceptionFilter } from 'src/exceptions/http-exception.filter';

@UseFilters(HttpExceptionFilter)
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<UserResponseDto, 'password'>> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.usersService.comparePassword(
      user,
      password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const { password: _, ...userWithoutPassword } = user;
    return new UserResponseDto(userWithoutPassword);
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    return this.generateTokens(user);
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    try {
      const user = await this.usersService.create(registerDto);
      return this.generateTokens(user);
    } catch (error) {
      console.error('Error during registration:', error);
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new HttpException(
        'An unexpected error occurred during registration',
        500,
      );
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const payload: { sub: string } = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_SECRET'),
      });

      const user = await this.usersService.findOne(payload.sub);
      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<AuthResponseDto> {
    try {
      const payload: { sub: string } = this.jwtService.verify(
        resetPasswordDto.token,
        {
          secret: this.configService.get('JWT_SECRET'),
        },
      );

      const user = await this.usersService.findOne(payload.sub);
      if (!user) {
        throw new UnauthorizedException();
      }
      const password = resetPasswordDto.newPassword;
      await this.usersService.update(user.id, { password });

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  // TODO
  // async forgotPassword()

  private generateTokens(user: UserResponseDto): AuthResponseDto {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const userInfo = {
      ...(user.id && { id: user.id }),
      ...(user.email && { email: user.email }),
      ...(user.firstName && { firstName: user.firstName }),
      ...(user.lastName && { lastName: user.lastName }),
      ...(user.role && { role: user.role }),
    };
    const authUser = new AuthUserDto(userInfo);
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRATION') || '1h',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '7d',
    });
    return new AuthResponseDto({
      accessToken,
      refreshToken,
      user: authUser,
    });
  }
}
