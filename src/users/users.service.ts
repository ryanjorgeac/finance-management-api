import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const alreadyCreated = await this.prisma.user.findFirst({
      where: { email: createUserDto.email },
    });
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
    const user = new User(prismaUser);
    return user;
  }

  async findAll(): Promise<User[]> {
    const prismaUsers = await this.prisma.user.findMany();
    const users = prismaUsers.map((prismaUser) => new User(prismaUser));
    return users;
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

    if (!prismaUser) {
      return null;
    }

    return new User(prismaUser);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.findOne(id);

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
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }
}
