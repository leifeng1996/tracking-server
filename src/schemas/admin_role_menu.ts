import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AdminMenu } from './admin_menu.schema';
import { AdminRole } from './admin_role.schema';

export type AdminRoleMenuDocument = AdminRoleMenu & Document;

@Schema()
export class AdminRoleMenu extends Document {
  @Prop({ ref: () => AdminMenu })
  menu: Types.ObjectId;
  @Prop({ ref: () => AdminRole })
  role: Types.ObjectId;
}

export const AdminRoleMenuSchema = SchemaFactory.createForClass(AdminRoleMenu);
AdminRoleMenuSchema.set('collection', 'admin_role_menu')