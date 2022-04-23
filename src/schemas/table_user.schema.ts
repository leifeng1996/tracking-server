import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Table } from './table.schema';

export type TableUserDocument = TableUser & Document;

@Schema()
export class TableUser extends Document {
  @Prop()
  account: string;
  @Prop()
  password: string;
  @Prop()
  realName: string;
  @Prop({ ref: () => Table })
  table: Types.ObjectId;
  @Prop()
  createTimeDate: Date;
  @Prop()
  modifyTimeDate: Date;
}

export const TableUserSchema = SchemaFactory.createForClass(TableUser);
TableUserSchema.set('collection', 'table_user');
