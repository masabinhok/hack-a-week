import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { ServicesModule } from './services/services.module';
import { SubServicesModule } from './sub-services/sub-services.module';
import { OfficesModule } from './offices/offices.module';
import { LocationsModule } from './locations/locations.module';

@Module({
  imports: [PrismaModule, ConfigModule.forRoot({
    isGlobal: true,
  }), ServicesModule, SubServicesModule, OfficesModule, LocationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
