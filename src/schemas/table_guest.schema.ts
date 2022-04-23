import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
export type TableGuestDocument = TableGuest & Document;
@Schema()
export class TableGuest extends Document {
  @Prop()
  account: string;
  @Prop()
  password: string;
  @Prop()
  realName: string;
  @Prop()
  phone: string;
  @Prop()
  level: number;
  @Prop()
  ratio: number;
  @Prop()
  share: number;
  @Prop()
  status: number;
  @Prop()
  description: string;
  @Prop()
  agent: Types.ObjectId;
  @Prop({ type: Date, default: new Date() })
  createTimeDate: Date;
  @Prop({ type: Date, default: new Date() })
  modifyTimeDate: Date;


  // 聚合查询字段
  @Prop()
  team: number;
  @Prop()
  notSettleWashCode: number;
  @Prop()
  washCodeBalance: number;
  @Prop()
  totalWin: number;
  @Prop()
  totalWinCash: number;
  @Prop()
  totalWinChip: number;
  @Prop()
  totalBet: number;
  @Prop()
  validBet: number;
  @Prop()
  washCodeCost: number;
  @Prop()
  bacLose: number;
  @Prop()
  bacWin: number;
  @Prop()
  bacWater: number;
  @Prop()
  lhLose: number;
  @Prop()
  lhWin: number;
  @Prop()
  lhWater: number;
  @Prop()
  shareEarnings: number;
  @Prop()
  companyEarnings: number;
}

export const TableGuestSchema = SchemaFactory.createForClass(TableGuest);
TableGuestSchema.set('collection', 'table_guest');