import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Table } from './table.schema';
import { TableGuest } from './table_guest.schema';

export type  GuestBetModifyRecordDocument = GuestBetModifyRecord & Document;
@Schema()
export class GuestBetModifyRecord extends Document {
  @Prop()
  game: string;

  @Prop()
  noRun: number;
  @Prop()
  noActive: number;

  @Prop()
  recordType: number;

  @Prop()
  oldType: number;
  @Prop()
  newType: number;

  @Prop({ ref: () => Table })
  table: Types.ObjectId;

  @Prop({ ref: () => TableGuest })
  oldUser: Types.ObjectId;
  @Prop({ ref: () => TableGuest })
  newUser: Types.ObjectId;

  @Prop({ type: Object })
  oldResult: any;
  @Prop({ type: Object })
  newResult: any;

  @Prop({ type: Object })
  oldUserBetData: any;
  @Prop()
  oldUserBetMoney: number;

  @Prop({ type: Object })
  newUserBetData: any;
  @Prop()
  newUserBetMoney: number;

  @Prop({ type: Object })
  oldSettlementData: any;
  @Prop()
  oldSettlementMoney: number;

  @Prop({ type: Object })
  newSettlementData: any;
  @Prop()
  newSettlementMoney: number;

  @Prop()
  createTimeDate: Date;
}
export const GuestBetModifyRecordSchema = SchemaFactory.createForClass(GuestBetModifyRecord);
GuestBetModifyRecordSchema.set('collection', 'guest_betting_modify_record');
