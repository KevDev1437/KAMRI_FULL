import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cors from 'cors';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet());
  app.use(cors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3002', // Dashboard admin
      'http://localhost:3000', // Web app
      'http://192.168.129.10:3000', // Mobile app (même IP que le PC)
      'http://192.168.129.10:3001', // Mobile app direct
    ],
    credentials: true,
  }));

  // Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('KAMRI API - Dropshipping Platform')
    .setDescription(`
      API complète pour la plateforme e-commerce KAMRI avec support dropshipping.
      
      ## Fonctionnalités principales :
      - 🛍️ **Gestion produits** : CRUD complet avec badges et fournisseurs
      - 🏪 **Fournisseurs** : Intégration Temu, AliExpress, Shein
      - 🗂️ **Mapping catégories** : Synchronisation automatique
      - 📊 **Dashboard** : Statistiques et analytics
      - 👥 **Utilisateurs** : Authentification JWT avec rôles
      - ⚙️ **Paramètres** : Configuration globale
      - 💳 **Paiements** : Intégration Stripe
      
      ## Authentification :
      Utilisez le token JWT dans l'en-tête Authorization : \`Bearer <token>\`
    `)
    .setVersion('2.0')
    .addBearerAuth()
    .addTag('auth', 'Authentification et autorisation')
    .addTag('products', 'Gestion des produits')
    .addTag('suppliers', 'Gestion des fournisseurs')
    .addTag('categories', 'Gestion des catégories')
    .addTag('orders', 'Gestion des commandes')
    .addTag('users', 'Gestion des utilisateurs')
    .addTag('settings', 'Paramètres globaux')
    .addTag('dashboard', 'Statistiques et analytics')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();

