import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { ServicesModule } from './services/services.module';
import { OfficesModule } from './offices/offices.module';
import { LocationsModule } from './locations/locations.module';
import { CategoriesModule } from './categories/categories.module';
import { AdminModule } from './admin/admin.module';
import { AuthGuard } from './common/guards/auth.guard';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      global: true,
    }),
    CategoriesModule,
    ServicesModule,
    OfficesModule,
    LocationsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
