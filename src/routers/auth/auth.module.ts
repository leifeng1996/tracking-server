import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TableUser, TableUserSchema } from '../../schemas/table_user.schema';
import { AuthController } from './auth.controller';
import { UserService } from '../user/user.service';
import { JwtModule } from '@nestjs/jwt';
import { TableGuest, TableGuestSchema } from '../../schemas/table_guest.schema';
import { AdminUser, AdminUserSchema } from '../../schemas/admin_user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TableGuest.name, schema: TableGuestSchema },
      { name: AdminUser.name, schema: AdminUserSchema },
      { name: TableUser.name, schema: TableUserSchema },


    ]),
    JwtModule.register({
      secret: '123456',
      signOptions: { expiresIn: '7200s' }
    })
  ],
  providers: [AuthService, UserService],
  exports: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
