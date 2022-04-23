import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AdminRolePermissionDocument = AdminRolePermission & Document;

@Schema()
export class AdminRolePermission extends Document {
  @Prop()
  permission: Types.ObjectId;
  @Prop()
  role: Types.ObjectId;
}

export const AdminRolePermissionSchema = SchemaFactory.createForClass(AdminRolePermission);
AdminRolePermissionSchema.set('collection', 'admin_role_permission')