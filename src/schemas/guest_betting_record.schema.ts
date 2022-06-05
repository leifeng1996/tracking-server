import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Table } from './table.schema';
import { Guest } from './guest.schema';

export type  GuestBettingRecordDocument = GuestBettingRecord & Document;
@Schema()
export class GuestBettingRecord extends Document {
  @Prop()
  game: string;
  @Prop()
  type: number;
  @Prop()
  noRun: number;
  @Prop()
  noActive: number;
  @Prop({ ref: () => Guest })
  user: Types.ObjectId;
  @Prop({ ref: () => Table })
  table: Types.ObjectId;
  @Prop({ type: Number, default: 0 })
  status: number;
  @Prop()
  createTimeDate: Date;
  @Prop()
  modifyTimeDate: Date;


  @Prop({ type: Object })
  result: any;
  @Prop({ type: Object })
  userBetData: any;
  @Prop()
  userBetMoney: number;
  @Prop({ type: Object })
  settlementData: any;
  @Prop()
  settlementMoney: number;

  /** @description 参与洗码计算 */
  @Prop()
  validBetMoney: number;

  /** @description 2022-04-28 新增水字段 */
  @Prop()
  water: number;
  /** @description 2022-04-28 新增洗码量字段 */
  @Prop()
  washCode: number;
  /** @description 2022-04-28 新增洗码费字段 */
  @Prop()
  washCodeCost: number;

  /** @description 2022-05-10 增加备注字段 */
  @Prop()
  description: string;
}
export const GuestBettingRecordSchema = SchemaFactory.createForClass(GuestBettingRecord);
GuestBettingRecordSchema.set('collection', 'guest_betting_record');
