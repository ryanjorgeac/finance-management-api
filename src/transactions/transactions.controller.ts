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
  Query,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiExtraModels,
} from '@nestjs/swagger';
import { GetUser } from 'src/auth/decorators';
import { ExceptionResponseDto } from 'src/exceptions/exception-response.dto';
import { PaginatedTransactionsResponseDto } from './dto/paginated-transactions-response.dto';
import { fromEntity } from '@/common/utils/transaction-mapper';

@ApiTags('Transactions')
@ApiBearerAuth()
@Controller('transactions')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({
    status: 201,
    description: 'Transaction created successfully',
    type: TransactionResponseDto,
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
  @ApiResponse({
    status: 404,
    description: 'Category not found',
    type: ExceptionResponseDto,
  })
  @ApiBody({ type: CreateTransactionDto })
  async create(
    @GetUser() user: { sub: string },
    @Body() createTransactionDto: CreateTransactionDto,
  ): Promise<TransactionResponseDto> {
    const transaction = await this.transactionsService.create(
      user.sub,
      createTransactionDto,
    );
    return fromEntity(transaction);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all transactions with filtering and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved successfully',
    type: PaginatedTransactionsResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Unauthorized',
    type: ExceptionResponseDto,
  })
  @ApiExtraModels(TransactionQueryDto)
  async findAll(
    @GetUser() user: { sub: string },
    @Query() query: TransactionQueryDto,
  ): Promise<PaginatedTransactionsResponseDto> {
    const { transactions, total, page, limit } =
      await this.transactionsService.findAll(user.sub, query);
    return new PaginatedTransactionsResponseDto(
      transactions,
      total,
      page,
      limit,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  @ApiParam({
    name: 'id',
    description: 'Transaction ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction retrieved successfully',
    type: TransactionResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Unauthorized',
    type: ExceptionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Transaction not found',
    type: ExceptionResponseDto,
  })
  async findOne(
    @GetUser() user: { sub: string },
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TransactionResponseDto> {
    const transaction = await this.transactionsService.findOne(id, user.sub);
    return fromEntity(transaction);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update transaction by ID' })
  @ApiParam({
    name: 'id',
    description: 'Transaction ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction updated successfully',
    type: TransactionResponseDto,
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
  @ApiResponse({
    status: 404,
    description: 'Transaction not found',
    type: ExceptionResponseDto,
  })
  @ApiBody({ type: UpdateTransactionDto })
  async update(
    @GetUser() user: { sub: string },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ): Promise<TransactionResponseDto> {
    const transaction = await this.transactionsService.update(
      id,
      user.sub,
      updateTransactionDto,
    );
    return fromEntity(transaction);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete transaction by ID' })
  @ApiParam({
    name: 'id',
    description: 'Transaction ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({ status: 204, description: 'Transaction deleted successfully' })
  @ApiResponse({
    status: 403,
    description: 'Unauthorized',
    type: ExceptionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Transaction not found',
    type: ExceptionResponseDto,
  })
  async remove(
    @GetUser() user: { sub: string },
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.transactionsService.remove(id, user.sub);
  }
}
