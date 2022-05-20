import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
export type TableGuestCurrencyDocument = TableGuestCurrency & Document;
@Schema()
export class TableGuestCurrency extends Document {
  @Prop()
  user: Types.ObjectId;
  @Prop()
  chip: number;
  @Prop()
  borrowing: number;
  @Prop()
  washCode: number;
  @Prop()
  washCodeCost: number;
}

export const TableGuestCurrencySchema = SchemaFactory.createForClass(TableGuestCurrency);
TableGuestCurrencySchema.set('collection', 'table_guest_currency');