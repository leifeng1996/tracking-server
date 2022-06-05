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
  @Prop({ type: Date, default: new Date() })
  createTimeDate: Date;
  @Prop({ type: Date, default: new Date() })
  modifyTimeDate: Date;
}

export const GuestSettlementRecordSchema = SchemaFactory.createForClass(GuestSettlementRecord);
GuestSettlementRecordSchema.set('collection', 'guest_settlement_record');