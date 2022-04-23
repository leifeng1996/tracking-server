import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AdminRole } from './admin_role.schema';
import { AdminUser } from './admin_user.schema';

export type AdminUserRoleDocument = AdminUserRole & Document;

@Schema()
export class AdminUserRole extends Document {
  @Prop({ ref: () => AdminUser })
  user: Types.ObjectId;
  @Prop({ ref: () => AdminRole })
  role: Types.ObjectId;
  @Prop({ type: Array })
  inventoryMenu;
  @Prop({ type: Array })
  menuDetail;
  @Prop({ type: Array })
  inventoryPermission;
  @Prop({ type: Array })
  permissionDetail;
}

export const AdminUserRoleSchema = SchemaFactory.createForClass(AdminUserRole);
AdminUserRoleSchema.set('collection', 'admin_user_role');