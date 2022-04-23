import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TableGuestChipRecordDocument = TableGuestChipRecord & Document;

@Schema()
export class TableGuestChipRecord extends Document {
  @Prop()
  user: Types.ObjectId;
  @Prop()
  type: number;
  @Prop()
  before: number;
  @Prop()
  money: number;
  @Prop()
  after: number;
  @Prop()
  master: Types.ObjectId;
  @Prop()
  description: string;
  @Prop({ type: Date, default: new Date() })
  createTimeDate: Date;
  @Prop({ type: Date, default: new Date() })
  modifyTimeDate: Date;
}

export const TableGuestChipRecordSchema = SchemaFactory.createForClass(TableGuestChipRecord);
TableGuestChipRecordSchema.set('collection', 'table_guest_chip_record');
