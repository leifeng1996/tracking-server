import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
export type GuestSettlementRecordDocument = GuestSettlementRecord & Document;
@Schema()
export class GuestSettlementRecord extends Document {
  @Prop()
  user: Types.ObjectId;
  @Prop()
  washCode: number;
  @Prop()
  washCodeCost: number;
  @Prop()
  description: string;
  @Prop()
  createTimeDate: Date;
}

export const GuestSettlementRecordSchema = SchemaFactory.createForClass(GuestSettlementRecord);
GuestSettlementRecordSchema.set('collection', 'guest_settlement_record');