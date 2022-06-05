import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type GuestBorrowingRecordDocument = GuestBorrowingRecord & Document;

@Schema()
export class GuestBorrowingRecord extends Document {
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

export const GuestBorrowingRecordSchema = SchemaFactory.createForClass(GuestBorrowingRecord);
GuestBorrowingRecordSchema.set('collection', 'guest_borrowing_record');
