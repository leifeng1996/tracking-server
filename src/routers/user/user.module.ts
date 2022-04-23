import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TableUser, TableUserSchema } from '../../schemas/table_user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { TableGuest, TableGuestSchema } from '../../schemas/table_guest.schema';
import { AdminUser, AdminUserSchema } from '../../schemas/admin_user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TableGuest.name, schema: TableGuestSchema },
      { name: AdminUser.name, schema: AdminUserSchema },
      { name: TableUser.name, schema: TableUserSchema}
    ])
  ],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
