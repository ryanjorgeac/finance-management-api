import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import * as argon from 'argon2';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const alreadyCreated = await this.findByEmail(createUserDto.email);
    if (alreadyCreated) {
      throw new Error('User with this E-mail already exists');
    }
    const hashedPw: string = await this.hashPassword(createUserDto.password);
    const prismaUser = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPw,
      },
    });
    return new User(prismaUser);
  }

  async findAll(): Promise<User[]> {
    const prismaUsers = await this.prisma.user.findMany();
    return prismaUsers.map((prismaUser) => new User(prismaUser));
  }

  async findOne(id: string): Promise<User> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!prismaUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return new User(prismaUser);
  }

  async findByEmail(email: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { email },
    });
    return prismaUser ? new User(prismaUser) : null;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.findOne(id);

    if (updateUserDto.email) {
      const emailOwner = await this.checkEmailOwner(updateUserDto.email, id);
      if (!emailOwner) {
        throw new ConflictException('User with this email already exists');
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = await this.hashPassword(updateUserDto.password);
    }

    const updatedPrismaUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    return new User(updatedPrismaUser);
  }

  async remove(id: string): Promise<User> {
    const toDeleteUser = await this.findOne(id);
    await this.prisma.user.delete({
      where: { id },
    });
    return new User(toDeleteUser);
  }

  private async hashPassword(password: string): Promise<string> {
    const hash = await argon.hash(password);
    return hash;
  }

  private async checkEmailOwner(
    email: string,
    userId: string,
  ): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        id: { not: userId },
      },
    });
    return !!user;
  }

  async comparePassword(user: User, password: string): Promise<boolean> {
    const userPw = user.password;
    return argon.verify(userPw, password);
  }
}
