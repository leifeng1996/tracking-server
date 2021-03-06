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
export type TableRunModifyRecordDocument = TableRunModifyRecord & Document;

@Schema()
export class TableRunModifyRecord extends Document {
  @Prop()
  table: Types.ObjectId;
  @Prop()
  type: number;
  @Prop()
  noRun: number;
  @Prop()
  oldNoActive: number;
  @Prop()
  newNoActive: number;
  @Prop({ type: Object})
  oldResult: any;
  @Prop({ type: Object})
  newResult: any;
  @Prop({ type: Object })
  createTimeDate: Date;
}

export const TableRunModifyRecordSchema = SchemaFactory.createForClass(TableRunModifyRecord);
TableRunModifyRecordSchema.set('collection', 'table_running_modify_record');

