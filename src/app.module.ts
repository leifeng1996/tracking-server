import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SuperController } from './super/super.controller';
import { AdminController } from './admin/admin.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { Guest, GuestSchema } from './schemas/guest.schema';
import { AdminUser, AdminUserSchema } from './schemas/admin_user.schema';
import { Table, TableSchema } from './schemas/table.schema';
import { TableUser, TableUserSchema } from './schemas/table_user.schema';
import { TableRunningRecord, TableRunningRecordSchema } from './schemas/table_running_record';
import { GuestBettingRecord, GuestBettingRecordSchema } from './schemas/guest_betting_record.schema';
import { TableSettlementRecord, TableSettlementRecordSchema } from './schemas/table_settlement_record.schema';
import { JwtStrategy } from './strategy/jwt.strategy';
import { AdminMenu, AdminMenuSchema } from './schemas/admin_menu.schema';
import { AdminRole, AdminRoleSchema } from './schemas/admin_role.schema';
import { AdminUserRole, AdminUserRoleSchema } from './schemas/admin_user_role';
import { AdminPermission, AdminPermissionSchema } from './schemas/admin_permission.schema';
import { AdminRoleMenu, AdminRoleMenuSchema } from './schemas/admin_role_menu';
import { AdminRolePermission, AdminRolePermissionSchema } from './schemas/admin_role_permission';
import { GuestCurrency, GuestCurrencySchema } from './schemas/guest_currency.schema';
import { GuestBorrowingRecord, GuestBorrowingRecordSchema } from './schemas/guest_borrowing_record.schema';
import { GuestChipRecord, GuestChipRecordSchema } from './schemas/guest_chip_record.schema';
import { GuestSettlementRecord, GuestSettlementRecordSchema } from './schemas/guest_settlement_record.schema';
import { SuperLoginToken, SuperLoginTokenSchema } from './schemas/super_login_token';
import { TableRunModifyRecord, TableRunModifyRecordSchema } from './schemas/table_running_modify_record';
import { GuestBetModifyRecord, GuestBetModifyRecordSchema } from './schemas/guest_betting_modify_record.schema';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: '123456',
      signOptions: { expiresIn: '7200s' }
    }),
    // MongooseModule.forRoot('mongodb://localhost:37017/tracking'),
    MongooseModule.forRoot('mongodb://server.128652345215.com:21001,server.128652345215.com:21002, server.128652345215.com:21003/tracking'),
    MongooseModule.forFeature([
      { name: AdminUser.name, schema: AdminUserSchema },
      { name: Table.name, schema: TableSchema },
      { name: TableUser.name, schema: TableUserSchema },
      { name: Guest.name, schema: GuestSchema },
      { name: TableRunningRecord.name, schema: TableRunningRecordSchema },
      { name: TableSettlementRecord.name, schema: TableSettlementRecordSchema },
      { name: GuestBettingRecord.name, schema: GuestBettingRecordSchema },

      { name: TableRunModifyRecord.name, schema: TableRunModifyRecordSchema },
      { name: GuestBetModifyRecord.name, schema: GuestBetModifyRecordSchema },

      { name: SuperLoginToken.name, schema: SuperLoginTokenSchema },

      { name: GuestCurrency.name, schema: GuestCurrencySchema },
      { name: GuestBorrowingRecord.name, schema: GuestBorrowingRecordSchema },
      { name: GuestChipRecord.name, schema: GuestChipRecordSchema },
      { name: GuestSettlementRecord.name, schema: GuestSettlementRecordSchema },

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
