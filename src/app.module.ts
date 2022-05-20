import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SuperController } from './super/super.controller';
import { AdminController } from './admin/admin.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TableGuest, TableGuestSchema } from './schemas/table_guest.schema';
import { AdminUser, AdminUserSchema } from './schemas/admin_user.schema';
import { Table, TableSchema } from './schemas/table.schema';
import { TableUser, TableUserSchema } from './schemas/table_user.schema';
import { TableRecord, TableRecordSchema } from './schemas/table_record';
import { TableGuestBetting, TableGuestBettingSchema } from './schemas/table_guest_betting.schema';
import { TableSettlement, TableSettlementSchema } from './schemas/table_settlement.schema';
import { JwtStrategy } from './strategy/jwt.strategy';
import { AdminMenu, AdminMenuSchema } from './schemas/admin_menu.schema';
import { AdminRole, AdminRoleSchema } from './schemas/admin_role.schema';
import { AdminUserRole, AdminUserRoleSchema } from './schemas/admin_user_role';
import { AdminPermission, AdminPermissionSchema } from './schemas/admin_permission.schema';
import { AdminRoleMenu, AdminRoleMenuSchema } from './schemas/admin_role_menu';
import { AdminRolePermission, AdminRolePermissionSchema } from './schemas/admin_role_permission';
import { TableGuestCurrency, TableGuestCurrencySchema } from './schemas/table_guest_currency.schema';
import { TableGuestBorrowing, TableGuestBorrowingSchema } from './schemas/table_guest_borrowing.schema';
import { TableGuestChipRecord, TableGuestChipRecordSchema } from './schemas/table_guest_chip.schema';
import { TableGuestSettlement, TableGuestSettlementSchema } from './schemas/table_guest_settlement.schema';
import { SuperLoginToken, SuperLoginTokenSchema } from './schemas/super_login_token';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: '123456',
      signOptions: { expiresIn: '7200s' }
    }),
    MongooseModule.forRoot('mongodb://localhost:37017/tracking'),
    // MongooseModule.forRoot('mongodb://192.168.13.25:21001/tracking'),
    MongooseModule.forFeature([
      { name: AdminUser.name, schema: AdminUserSchema },
      { name: Table.name, schema: TableSchema },
      { name: TableUser.name, schema: TableUserSchema },
      { name: TableGuest.name, schema: TableGuestSchema },
      { name: TableRecord.name, schema: TableRecordSchema },
      { name: TableGuestBetting.name, schema: TableGuestBettingSchema },
      { name: TableSettlement.name, schema: TableSettlementSchema },

      { name: SuperLoginToken.name, schema: SuperLoginTokenSchema },

      { name: TableGuestCurrency.name, schema: TableGuestCurrencySchema },
      { name: TableGuestBorrowing.name, schema: TableGuestBorrowingSchema },
      { name: TableGuestChipRecord.name, schema: TableGuestChipRecordSchema },
      { name: TableGuestSettlement.name, schema: TableGuestSettlementSchema },

      { name: AdminUser.name, schema: AdminUserSchema },
      { name: AdminMenu.name, schema: AdminMenuSchema },
      { name: AdminRole.name, schema: AdminRoleSchema },
      { name: AdminUserRole.name, schema: AdminUserRoleSchema },
      { name: AdminPermission.name, schema: AdminPermissionSchema },
      { name: AdminRoleMenu.name, schema: AdminRoleMenuSchema },
      { name: AdminRolePermission.name, schema: AdminRolePermissionSchema },
    ]),
    // AuthModule,
    // UserModule,
    //
    // TableModule,
    // AdminModule,
  ],
  controllers: [SuperController, AdminController],
  providers: [AppService, JwtStrategy],
})
export class AppModule {}
