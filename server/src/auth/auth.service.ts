import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && user.status === 'active') {
      return user;
    }

    return null;
  }

  async login(email: string | any) {
    console.log('🔑 [AuthService] Tentative de connexion pour:', email);
    
    // Si email est un objet, extraire la vraie valeur email
    const actualEmail = typeof email === 'string' ? email : email.email;
    console.log('📧 [AuthService] Email extrait:', actualEmail);
    
    // Vérifier si l'utilisateur existe
    let user = await this.validateUser(actualEmail);
    
    // Si l'utilisateur n'existe pas, le créer automatiquement
    if (!user) {
      console.log('👤 [AuthService] Utilisateur non trouvé, création automatique...');
      user = await this.createUser(actualEmail, actualEmail.split('@')[0], 'auto-generated');
      console.log('✅ [AuthService] Utilisateur créé:', user.id);
    } else {
      console.log('✅ [AuthService] Utilisateur trouvé:', user.id);
    }

    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role 
    };

    const token = this.jwtService.sign(payload);
    console.log('🎫 [AuthService] Token JWT généré');

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async register(email: string | any, name: string, password: string = 'auto-generated', role: string = 'user') {
    // Si email est un objet, extraire la vraie valeur email
    const actualEmail = typeof email === 'string' ? email : email.email;
    console.log('📧 [AuthService] Email extrait pour register:', actualEmail);
    
    const existingUser = await this.prisma.user.findUnique({
      where: { email: actualEmail },
    });

    if (existingUser) {
      throw new UnauthorizedException('Un utilisateur avec cet email existe déjà');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await this.prisma.user.create({
      data: {
        email: actualEmail,
        name,
        password: hashedPassword,
        role,
        status: 'active',
      },
    });

    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async createUser(email: string | any, name: string, password: string) {
    // Si email est un objet, extraire la vraie valeur email
    const actualEmail = typeof email === 'string' ? email : email.email;
    console.log('📧 [AuthService] Email extrait pour createUser:', actualEmail);
    
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: {
        email: actualEmail,
        name,
        password: hashedPassword,
        role: 'user',
        status: 'active',
      },
    });
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    return user;
  }

  async updateProfile(userId: string, data: { name?: string; email?: string }) {
    console.log('👤 [AuthService] Mise à jour du profil pour:', userId, data);
    
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    console.log('✅ [AuthService] Profil mis à jour:', user.id);
    return user;
  }
}

