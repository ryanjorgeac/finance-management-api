import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpCode,
  HttpStatus,
  NotFoundException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { GetUser } from 'src/auth/decorators';
import { ExceptionResponseDto } from 'src/exceptions/exception-response.dto';

@ApiTags('Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
    type: ExceptionResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Unauthorized',
    type: ExceptionResponseDto,
  })
  @ApiBody({ type: CreateCategoryDto })
  async create(
    @GetUser() user: { sub: string },
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const category = await this.categoriesService.create(
      user.sub,
      createCategoryDto,
    );
    return new CategoryResponseDto(category);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
    type: [CategoryResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @GetUser() user: { sub: string },
  ): Promise<CategoryResponseDto[]> {
    const categories = await this.categoriesService.findAll(user.sub);
    return categories.map((category) => new CategoryResponseDto(category));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Category retrieved successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Unauthorized',
    type: ExceptionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
    type: ExceptionResponseDto,
  })
  async findOne(
    @GetUser() user: { sub: string },
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CategoryResponseDto> {
    const category = await this.categoriesService.findOne(id, user.sub);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return new CategoryResponseDto(category);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update category by ID' })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
    type: ExceptionResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ExceptionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
    type: ExceptionResponseDto,
  })
  @ApiBody({ type: UpdateCategoryDto })
  async update(
    @GetUser() user: { sub: string },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const category = await this.categoriesService.update(
      id,
      user.sub,
      updateCategoryDto,
    );
    return new CategoryResponseDto(category);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete category by ID' })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({ status: 204, description: 'Category deleted successfully' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ExceptionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
    type: ExceptionResponseDto,
  })
  async remove(
    @GetUser() user: { sub: string },
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.categoriesService.remove(id, user.sub);
  }
}
