import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AdminMenuDocument = AdminMenu & Document;

@Schema()
export class AdminMenu extends Document {
  @Prop()
  name: string;
  @Prop()
  path: string;
  @Prop()
  icon: string;
  @Prop()
  sort: number;
  @Prop()
  title: string;
  @Prop()
  subtitle: string;
  @Prop({ type: String, default: '_self' })
  target: string;
  @Prop({ type: Boolean, default: false })
  divided;
  @Prop({ type: Boolean, default: false })
  hideSider: boolean;
  @Prop({ ref: () => AdminMenu })
  parent: Types.ObjectId;
  @Prop({ type: Date, default: Date.now() })
  createTimeDate: Date;
  @Prop({ type: Date, default: Date.now() })
  modifyTimeDate: Date;
}

export const AdminMenuSchema = SchemaFactory.createForClass(AdminMenu);
AdminMenuSchema.set('collection', 'admin_menu');