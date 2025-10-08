import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async validateUser(email: string, password: string) {
    // TODO: Implement proper authentication with Supabase
    // For now, return a mock user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      return user;
    }

    return null;
  }

  async createUser(email: string, name: string) {
    return this.prisma.user.create({
      data: {
        email,
        name,
      },
    });
  }
}

