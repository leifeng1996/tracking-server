import { Module } from '@nestjs/common';
import { TableService } from './table.service';
import { TableController } from './table.controller';
import { JwtStrategy } from '../../strategy/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { TableUser, TableUserSchema } from '../../schemas/table_user.schema';
import { UserService } from '../user/user.service';
import { Table, TableSchema } from '../../schemas/table.schema';
import { TableRecord, TableRecordSchema } from '../../schemas/table_record';
import { TableGuest, TableGuestSchema } from '../../schemas/table_guest.schema';
import { TableGuestBetting, TableGuestBettingSchema } from '../../schemas/table_guest_betting.schema';
import { TableSettlement, TableSettlementSchema } from '../../schemas/table_settlement.schema';
import { AdminUser, AdminUserSchema } from '../../schemas/admin_user.schema';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: '123456',
      signOptions: { expiresIn: '7200s' }
    }),
    MongooseModule.forFeature([
      { name: TableGuest.name, schema: TableGuestSchema },
      { name: AdminUser.name, schema: AdminUserSchema },
      { name: Table.name, schema: TableSchema },
      { name: TableUser.name, schema: TableUserSchema },
      { name: TableGuest.name, schema: TableGuestSchema },
      { name: TableRecord.name, schema: TableRecordSchema },
      { name: TableGuestBetting.name, schema: TableGuestBettingSchema },
      { name: TableSettlement.name, schema: TableSettlementSchema },
    ]),
  ],
  controllers: [TableController],
  providers: [TableService, JwtStrategy, UserService],
  exports: [TableService]
})
export class TableModule {}
