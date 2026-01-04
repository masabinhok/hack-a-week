import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UserAuthGuard } from './guards';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({}), // Configuration done via ConfigService
  ],
  controllers: [UsersController],
  providers: [UsersService, UserAuthGuard],
  exports: [UsersService, UserAuthGuard],
})
export class UsersModule {}
