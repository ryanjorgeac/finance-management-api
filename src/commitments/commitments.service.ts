import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Commitment } from './entities/commitment.entity';
import { CreateCommitmentDto } from './dto/create-commitment.dto';
import { UpdateCommitmentDto } from './dto/update-commitment.dto';
import { centsToBigInt } from '../common/utils/bigint-transform';

@Injectable()
export class CommitmentsService {
  constructor(private prisma: PrismaService) {}

  private readonly logger = new Logger(CommitmentsService.name);

  private parseAmountCents(amountCents: number): bigint {
    try {
      return centsToBigInt(amountCents);
    } catch {
      throw new BadRequestException(
        'amountCents must be an integer number of cents',
      );
    }
  }

  async create(
    userId: string,
    createCommitmentDto: CreateCommitmentDto,
  ): Promise<Commitment> {
    const { amountCents, ...createData } = createCommitmentDto;

    const category = await this.prisma.category.findUnique({
      where: { id: createData.categoryId },
    });

    if (!category) {
      throw new NotFoundException(
        `Category with ID ${createData.categoryId} not found`,
      );
    }

    if (category.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to use this category',
      );
    }

    const amount = this.parseAmountCents(amountCents);

    const prismaCommitment = await this.prisma.commitment.create({
      data: {
        ...createData,
        amount,
        userId,
      },
    });

    return new Commitment(prismaCommitment);
  }

  async findAll(userId: string): Promise<Commitment[]> {
    const prismaCommitments = await this.prisma.commitment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return prismaCommitments.map((c) => new Commitment(c));
  }

  async findOne(id: string, userId: string): Promise<Commitment> {
    const prismaCommitment = await this.prisma.commitment.findUnique({
      where: { id },
    });

    if (!prismaCommitment) {
      throw new NotFoundException(`Commitment with ID ${id} not found`);
    }

    if (prismaCommitment.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this commitment',
      );
    }

    return new Commitment(prismaCommitment);
  }

  async update(
    id: string,
    userId: string,
    updateCommitmentDto: UpdateCommitmentDto,
  ): Promise<Commitment> {
    await this.findOne(id, userId);

    const { amountCents, ...updateData } = updateCommitmentDto;

    if (updateData.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: updateData.categoryId },
      });

      if (!category) {
        throw new NotFoundException(
          `Category with ID ${updateData.categoryId} not found`,
        );
      }

      if (category.userId !== userId) {
        throw new ForbiddenException(
          'You do not have permission to use this category',
        );
      }
    }

    const amount =
      amountCents !== undefined
        ? this.parseAmountCents(amountCents)
        : undefined;

    const updatedPrismaCommitment = await this.prisma.commitment.update({
      where: { id },
      data: {
        ...updateData,
        ...(amount !== undefined ? { amount } : {}),
      },
    });

    this.logger.log(`Updated commitment ${id}`);

    return new Commitment(updatedPrismaCommitment);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId);

    await this.prisma.commitment.delete({ where: { id } });

    this.logger.log(`Deleted commitment ${id}`);
  }
}
