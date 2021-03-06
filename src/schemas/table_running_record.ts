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
export type TableRunningRecordDocument = TableRunningRecord & Document;

@Schema()
export class TableRunningRecord extends Document {
  @Prop()
  table: Types.ObjectId;
  @Prop()
  noRun: number;
  @Prop()
  noActive: number;
  @Prop({ type: Object})
  result: any;
  @Prop()
  createTimeDate: Date;
  @Prop()
  modifyTimeDate: Date;
}

export const TableRunningRecordSchema = SchemaFactory.createForClass(TableRunningRecord);
TableRunningRecordSchema.set('collection', 'table_running_record');

