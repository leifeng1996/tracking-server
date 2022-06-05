import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
export type GuestCurrencyDocument = GuestCurrency & Document;
@Schema()
export class GuestCurrency extends Document {
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

export const GuestCurrencySchema = SchemaFactory.createForClass(GuestCurrency);
GuestCurrencySchema.set('collection', 'guest_currency');