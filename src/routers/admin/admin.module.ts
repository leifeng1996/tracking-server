import { Module } from '@nestjs/common';
import { SystemController } from './system/system.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TableGuest, TableGuestSchema } from '../../schemas/table_guest.schema';
import { AdminUser, AdminUserSchema } from '../../schemas/admin_user.schema';
import { TableUser, TableUserSchema } from '../../schemas/table_user.schema';
import { UserService } from '../user/user.service';
import { AdminService } from './admin.service';
import { AdminMenu, AdminMenuSchema } from '../../schemas/admin_menu.schema';
import { AdminRole, AdminRoleSchema } from '../../schemas/admin_role.schema';
import { AdminPermission, AdminPermissionSchema } from '../../schemas/admin_permission.schema';
import { AdminRoleMenu, AdminRoleMenuSchema } from '../../schemas/admin_role_menu';
import { AdminRolePermission, AdminRolePermissionSchema } from '../../schemas/admin_role_permission';
import { Table, TableSchema } from '../../schemas/table.schema';
import { TableController } from './table/table.controller';
import { GuestController } from './guest/guest.controller';
import { TableGuestBetting, TableGuestBettingSchema } from '../../schemas/table_guest_betting.schema';
import { TableService } from '../table/table.service';
import { TableRecord, TableRecordSchema } from '../../schemas/table_record';
import { TableSettlement, TableSettlementSchema } from '../../schemas/table_settlement.schema';
import { TableGuestBorrowing, TableGuestBorrowingSchema } from '../../schemas/table_guest_borrowing.schema';
import { TableGuestCurrency, TableGuestCurrencySchema } from '../../schemas/table_guest_currency.schema';
import { TableGuestChipRecord, TableGuestChipRecordSchema } from '../../schemas/table_guest_chip.schema';
import { AdminUserRole, AdminUserRoleSchema } from '../../schemas/admin_user_role';
import { TableGuestSettlement, TableGuestSettlementSchema } from '../../schemas/table_guest_settlement.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AdminUser.name, schema: AdminUserSchema },
      { name: AdminMenu.name, schema: AdminMenuSchema },
      { name: AdminRole.name, schema: AdminRoleSchema },
      { name: AdminUserRole.name, schema: AdminUserRoleSchema },
      { name: AdminPermission.name, schema: AdminPermissionSchema },
      { name: AdminRoleMenu.name, schema: AdminRoleMenuSchema },
      { name: AdminRolePermission.name, schema: AdminRolePermissionSchema },

      { name: Table.name, schema: TableSchema },
      { name: TableUser.name, schema: TableUserSchema },
      { name: TableRecord.name, schema: TableRecordSchema },
      { name: TableSettlement.name, schema: TableSettlementSchema },

      { name: TableGuest.name, schema: TableGuestSchema },
      { name: TableGuestBetting.name, schema: TableGuestBettingSchema },
      { name: TableGuestCurrency.name, schema: TableGuestCurrencySchema },
      { name: TableGuestBorrowing.name, schema: TableGuestBorrowingSchema },
      { name: TableGuestChipRecord.name, schema: TableGuestChipRecordSchema },
      { name: TableGuestSettlement.name, schema: TableGuestSettlementSchema },
    ])
  ],
  providers: [AdminService, UserService, TableService],
  exports: [],
  controllers: [SystemController, TableController, GuestController]
})
export class AdminModule {}
