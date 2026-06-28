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
  ParseUUIDPipe,
} from '@nestjs/common';
import { CommitmentsService } from './commitments.service';
import { CreateCommitmentDto } from './dto/create-commitment.dto';
import { UpdateCommitmentDto } from './dto/update-commitment.dto';
import { CommitmentResponseDto } from './dto/commitment-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { GetUser } from '../auth/decorators';
import { ExceptionResponseDto } from '../exceptions/exception-response.dto';
import { fromEntities, fromEntity } from '@/common/utils/commitment-mapper';

@ApiTags('Commitments')
@ApiBearerAuth()
@Controller('commitments')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class CommitmentsController {
  constructor(private readonly commitmentsService: CommitmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new commitment' })
  @ApiResponse({
    status: 201,
    description: 'Commitment created successfully',
    type: CommitmentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
    type: ExceptionResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - category belongs to another user',
    type: ExceptionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
    type: ExceptionResponseDto,
  })
  @ApiBody({ type: CreateCommitmentDto })
  async create(
    @GetUser() user: { sub: string },
    @Body() createCommitmentDto: CreateCommitmentDto,
  ): Promise<CommitmentResponseDto> {
    const commitment = await this.commitmentsService.create(
      user.sub,
      createCommitmentDto,
    );
    return fromEntity(commitment);
  }

  @Get()
  @ApiOperation({ summary: 'Get all commitments for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Commitments retrieved successfully',
    type: [CommitmentResponseDto],
  })
  @ApiResponse({
    status: 403,
    description: 'Unauthorized',
    type: ExceptionResponseDto,
  })
  async findAll(
    @GetUser() user: { sub: string },
  ): Promise<CommitmentResponseDto[]> {
    const commitments = await this.commitmentsService.findAll(user.sub);
    return fromEntities(commitments);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get commitment by ID' })
  @ApiParam({
    name: 'id',
    description: 'Commitment ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Commitment retrieved successfully',
    type: CommitmentResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
    type: ExceptionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Commitment not found',
    type: ExceptionResponseDto,
  })
  async findOne(
    @GetUser() user: { sub: string },
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CommitmentResponseDto> {
    const commitment = await this.commitmentsService.findOne(id, user.sub);
    return fromEntity(commitment);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update commitment by ID' })
  @ApiParam({
    name: 'id',
    description: 'Commitment ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Commitment updated successfully',
    type: CommitmentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
    type: ExceptionResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
    type: ExceptionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Commitment not found',
    type: ExceptionResponseDto,
  })
  @ApiBody({ type: UpdateCommitmentDto })
  async update(
    @GetUser() user: { sub: string },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCommitmentDto: UpdateCommitmentDto,
  ): Promise<CommitmentResponseDto> {
    const commitment = await this.commitmentsService.update(
      id,
      user.sub,
      updateCommitmentDto,
    );
    return fromEntity(commitment);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete commitment by ID' })
  @ApiParam({
    name: 'id',
    description: 'Commitment ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({ status: 204, description: 'Commitment deleted successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
    type: ExceptionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Commitment not found',
    type: ExceptionResponseDto,
  })
  async remove(
    @GetUser() user: { sub: string },
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.commitmentsService.remove(id, user.sub);
  }
}
