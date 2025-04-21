import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UpdateUserDto, UserResponseDto } from './dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser, Roles } from '../auth/decorators/';
import { UsersService } from './users.service';
import { User } from '../users/entities/user.entity';

@ApiTags('Users')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: UserResponseDto,
  })
  async getProfile(@GetUser() user: { sub: string }): Promise<User | null> {
    console.log(user);
    const foundUser = await this.usersService.findOne(user.sub);
    return foundUser;
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({
    status: 201,
    description: 'User profile updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({ type: UpdateUserDto })
  async updateProfile(
    @GetUser() user: { sub: string },
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    console.log(user);
    const updatedUser = await this.usersService.update(user.sub, updateUserDto);
    return new UserResponseDto(updatedUser);
  }

  @Delete('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete current user account' })
  @ApiResponse({
    status: 200,
    description: 'User account deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteProfile(
    @GetUser() user: { sub: string },
  ): Promise<UserResponseDto> {
    const removedUser = await this.usersService.remove(user.sub);
    return new UserResponseDto(removedUser);
  }

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: [UserResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires admin role' })
  async findAll(): Promise<UserResponseDto[]> {
    console.log('This is a comment');
    const users = await this.usersService.findAll();
    const usersDto = users.map((user) => new UserResponseDto(user));
    return usersDto;
  }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires admin role' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param() userId: string): Promise<UserResponseDto> {
    const user = await this.usersService.findOne(userId);
    return new UserResponseDto(user);
  }
}
