import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
export interface result {
  banker?: boolean;
  player?: boolean;
  dragon?: boolean;
  tiger?: boolean;
  tie: boolean;
  bankerPair?: boolean;
  playerPair?: boolean;
}
export type TableRecordDocument = TableRecord & Document;

@Schema()
export class TableRecord extends Document {
  @Prop()
  table: Types.ObjectId;
  @Prop()
  noRun: number;
  @Prop()
  noActive: number;
  @Prop({ type: Object})
  result: any;
  @Prop({ type: Object, default: new Date() })
  createTimeDate: Date;
  @Prop({ type: Object, default: new Date() })
  modifyTimeDate: Date;
}

export const TableRecordSchema = SchemaFactory.createForClass(TableRecord);
TableRecordSchema.set('collection', 'table_record');

