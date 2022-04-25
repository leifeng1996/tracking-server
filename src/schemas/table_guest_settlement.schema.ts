import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
export type TableGuestSettlementDocument = TableGuestSettlement & Document;
@Schema()
export class TableGuestSettlement extends Document {
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

export const TableGuestSettlementSchema = SchemaFactory.createForClass(TableGuestSettlement);
TableGuestSettlementSchema.set('collection', 'table_guest_settlement');