import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Table } from './table.schema';
export type TableSettlementDocument = TableSettlement & Document;
@Schema()
export class TableSettlement extends Document {
  @Prop({ ref: () => Table })
  table: Types.ObjectId;
  @Prop()
  openCash: number;
  @Prop()
  openChip: number;
  @Prop()
  middleCash: number;
  @Prop()
  middleChip: number;
  @Prop()
  totalWinCash: number;
  @Prop()
  totalWinChip: number;
  @Prop()
  openTimeDate: Date;
  @Prop()
  overTimeDate: Date;
}

export const TableSettlementSchema = SchemaFactory.createForClass(TableSettlement);
TableSettlementSchema.set('collection', 'table_settlement');