import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
export type GuestDocument = Guest & Document;
@Schema()
export class Guest extends Document {
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
  xmRate: number;
  @Prop()
  profitRate: number;
  @Prop()
  status: number;
  @Prop()
  remark: string;
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
  earnings: number;
  @Prop()
  companyEarnings: number;
}

export const GuestSchema = SchemaFactory.createForClass(Guest);
GuestSchema.set('collection', 'guest');