import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TableDocument = Table & Document;

@Schema()
export class Table extends Document {
  @Prop()
  game: string;
  @Prop()
  noRun: number;
  @Prop()
  tableNum: number;
  @Prop()
  openCash: number;
  @Prop()
  openChip: number;
  @Prop()
  middleCash: number;
  @Prop()
  middleChip: number;
  @Prop({ type: Object })
  limit: any;
  @Prop()
  superPass: string;
  @Prop()
  openTimeDate: Date;
  @Prop()
  overTimeDate: Date;
  @Prop({ type: Date, default: new Date() })
  createTimeDate: Date;
  @Prop({ type: Date, default: new Date() })
  modifyTimeDate: Date;
}

export const TableSchema = SchemaFactory.createForClass(Table);
TableSchema.set('collection', 'table');
