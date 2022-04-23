import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import Mongoose from 'mongoose';

export type AdminUserDocument = AdminUser & Document;

@Schema()
export class AdminUser extends Document {
  @Prop()
  account: string;
  @Prop()
  password: string;
  @Prop()
  description: string;
  @Prop({ type: Number, default: 0 })
  status: number;
  @Prop({ type: Date, default: new Date()})
  createTimeDate: Date;
  @Prop({ type: Date, default: new Date()})
  modifyTimeDate: Date;

  @Prop({ type: Array })
  inventoryMenu;
  @Prop({ type: Array })
  menuDetail;
  @Prop({ type: Array })
  inventoryPermission;
  @Prop({ type: Array })
  permissionDetail;
}

export const AdminUserSchema = SchemaFactory.createForClass(AdminUser);
AdminUserSchema.set('collection', 'admin_user');
