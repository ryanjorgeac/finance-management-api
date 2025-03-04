import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { UserResponseDto } from 'src/users/dto/user-response.dto';
import { User } from 'src/users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

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
  ): Promise<Omit<UserResponseDto, 'password'> | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && user.password === password) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: Partial<User>;
  }> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.generateTokens(user);
  }

  async register(registerDto: RegisterDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: Partial<User>;
  }> {
     const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('User cannot be created with this email');
    }
    const user = await this.usersService.create(registerDto);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return this.generateTokens(result);
  }

  async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    user: Partial<User>;
  }> {
    try {
      const payload: { sub: string } = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_SECRET'),
      });

      const user = await this.usersService.findOne(payload.sub);
      const { password, ...result } = user;

      return this.generateTokens(result);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  forgotPassword() {
    // TODO: Implement this method
    return;
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<object> {
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

      return { message: 'Password has been reset successfully' };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private generateTokens(user: Partial<User>): {
    accessToken: string;
    refreshToken: string;
    user: Partial<User>;
  } {
    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      accessToken: this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRATION') || '1h',
      }),
      refreshToken: this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '7d',
      }),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }
}
