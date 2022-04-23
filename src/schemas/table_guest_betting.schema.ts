import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Table } from './table.schema';
import { TableGuest } from './table_guest.schema';

export type  TableGuestBettingDocument = TableGuestBetting & Document;
@Schema()
export class TableGuestBetting extends Document {
  @Prop()
  game: string;
  @Prop()
  type: number;
  @Prop()
  noRun: number;
  @Prop()
  noActive: number;
  @Prop({ ref: () => TableGuest })
  user: Types.ObjectId;
  @Prop({ ref: () => Table })
  table: Types.ObjectId;
  @Prop({ type: Object })
  result: any;
  @Prop({ type: Object })
  userBetData: any;
  @Prop()
  userBetMoney: number;
  @Prop({ type: Object })
  settlementData: any;
  @Prop()
  settlementMoney: number;
  @Prop()
  validBetMoney: number;
  @Prop({ type: Number, default: 0 })
  status: number;
  @Prop()
  createTimeDate: Date;
  @Prop()
  modifyTimeDate: Date;
}
export const TableGuestBettingSchema = SchemaFactory.createForClass(TableGuestBetting);
TableGuestBettingSchema.set('collection', 'table_guest_betting');
