import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type GuestChipRecordDocument = GuestChipRecord & Document;

@Schema()
export class GuestChipRecord extends Document {
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

export const GuestChipRecordSchema = SchemaFactory.createForClass(GuestChipRecord);
GuestChipRecordSchema.set('collection', 'guest_chip_record');
