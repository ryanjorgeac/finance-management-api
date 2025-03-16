// import {
//   Controller,
//   Get,
//   Post,
//   Body,
//   Patch,
//   Param,
//   Delete,
//   UseGuards,
//   Request,
//   UseInterceptors,
//   ClassSerializerInterceptor,
//   HttpCode,
//   HttpStatus,
//   NotFoundException,
//   ParseUUIDPipe,
// } from '@nestjs/common';
// import { AccountsService } from './accounts.service';
// import {
//   AccountResponseDto,
//   BalanceResponseDto,
//   CreateAccountDto,
//   UpdateAccountDto,
// } from './dto/';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import {
//   ApiTags,
//   ApiOperation,
//   ApiResponse,
//   ApiBearerAuth,
//   ApiParam,
//   ApiBody,
// } from '@nestjs/swagger';

// @ApiTags('accounts')
// @ApiBearerAuth()
// @Controller('accounts')
// @UseGuards(JwtAuthGuard)
// @UseInterceptors(ClassSerializerInterceptor)
// export class AccountsController {
//   constructor(private readonly accountsService: AccountsService) {}

//   @Post()
//   @ApiOperation({ summary: 'Create a new account' })
//   @ApiResponse({
//     status: 201,
//     description: 'Account created successfully',
//     type: AccountResponseDto,
//   })
//   @ApiResponse({ status: 400, description: 'Bad request - validation error' })
//   @ApiResponse({ status: 401, description: 'Unauthorized' })
//   @ApiBody({ type: CreateAccountDto })
//   async create(
//     @Request() req,
//     @Body() createAccountDto: CreateAccountDto,
//   ): Promise<AccountResponseDto> {
//     const account = await this.accountsService.create(
//       req.user.id,
//       createAccountDto,
//     );
//     return new AccountResponseDto(account);
//   }

//   @Get()
//   @ApiOperation({ summary: 'Get all accounts for the current user' })
//   @ApiResponse({
//     status: 200,
//     description: 'Accounts retrieved successfully',
//     type: [AccountResponseDto],
//   })
//   @ApiResponse({ status: 401, description: 'Unauthorized' })
//   async findAll(@Request() req): Promise<AccountResponseDto[]> {
//     const accounts = await this.accountsService.findAll(req.user.id);
//     return accounts.map((account) => new AccountResponseDto(account));
//   }

//   @Get('balance')
//   @ApiOperation({ summary: 'Get balance summary for all accounts' })
//   @ApiResponse({
//     status: 200,
//     description: 'Balance retrieved successfully',
//     type: BalanceResponseDto,
//   })
//   @ApiResponse({ status: 401, description: 'Unauthorized' })
//   async getBalance(@Request() req): Promise<BalanceResponseDto> {
//     const balance = await this.accountsService.getBalance(req.user.id);
//     return new BalanceResponseDto(balance);
//   }

//   @Get(':id')
//   @ApiOperation({ summary: 'Get account by ID' })
//   @ApiParam({
//     name: 'id',
//     description: 'Account ID',
//     type: 'string',
//     format: 'uuid',
//   })
//   @ApiResponse({
//     status: 200,
//     description: 'Account retrieved successfully',
//     type: AccountResponseDto,
//   })
//   @ApiResponse({ status: 401, description: 'Unauthorized' })
//   @ApiResponse({ status: 404, description: 'Account not found' })
//   async findOne(
//     @Request() req,
//     @Param('id', ParseUUIDPipe) id: string,
//   ): Promise<AccountResponseDto> {
//     const account = await this.accountsService.findOne(id, req.user.id);
//     if (!account) {
//       throw new NotFoundException(`Account with ID ${id} not found`);
//     }
//     return new AccountResponseDto(account);
//   }

//   @Patch(':id')
//   @ApiOperation({ summary: 'Update account by ID' })
//   @ApiParam({
//     name: 'id',
//     description: 'Account ID',
//     type: 'string',
//     format: 'uuid',
//   })
//   @ApiResponse({
//     status: 200,
//     description: 'Account updated successfully',
//     type: AccountResponseDto,
//   })
//   @ApiResponse({ status: 400, description: 'Bad request - validation error' })
//   @ApiResponse({ status: 401, description: 'Unauthorized' })
//   @ApiResponse({ status: 404, description: 'Account not found' })
//   @ApiBody({ type: UpdateAccountDto })
//   async update(
//     @Request() req,
//     @Param('id', ParseUUIDPipe) id: string,
//     @Body() updateAccountDto: UpdateAccountDto,
//   ): Promise<AccountResponseDto> {
//     const account = await this.accountsService.update(
//       id,
//       req.user.id,
//       updateAccountDto,
//     );
//     return new AccountResponseDto(account);
//   }

//   @Delete(':id')
//   @HttpCode(HttpStatus.NO_CONTENT)
//   @ApiOperation({ summary: 'Delete account by ID' })
//   @ApiParam({
//     name: 'id',
//     description: 'Account ID',
//     type: 'string',
//     format: 'uuid',
//   })
//   @ApiResponse({ status: 204, description: 'Account deleted successfully' })
//   @ApiResponse({ status: 401, description: 'Unauthorized' })
//   @ApiResponse({ status: 404, description: 'Account not found' })
//   async remove(
//     @Request() req,
//     @Param('id', ParseUUIDPipe) id: string,
//   ): Promise<void> {
//     await this.accountsService.remove(id, req.user.id);
//   }
// }
