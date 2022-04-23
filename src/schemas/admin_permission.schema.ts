import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as Mongoose from 'mongoose';
import { AdminMenu } from './admin_menu.schema';

export type AdminPermissionDocument = AdminPermission & Document;

@Schema()
export class AdminPermission extends Document {
  @Prop()
  name: string;
  @Prop()
  title: string;
  @Prop({ ref: () => AdminMenu })
  parent: Types.ObjectId;
  @Prop({ type: Date, default: Date.now() })
  createTimeDate: Date;
  @Prop({ type: Date, default: Date.now() })
  modifyTimeDate: Date;
}

export const AdminPermissionSchema = SchemaFactory.createForClass(AdminPermission);
AdminPermissionSchema.set('collection', 'admin_permission');
