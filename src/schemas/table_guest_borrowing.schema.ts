import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TableGuestBorrowingDocument = TableGuestBorrowing & Document;

@Schema()
export class TableGuestBorrowing extends Document {
  @Prop()
  user: Types.ObjectId;
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

export const TableGuestBorrowingSchema = SchemaFactory.createForClass(TableGuestBorrowing);
TableGuestBorrowingSchema.set('collection', 'table_guest_borrowing');
