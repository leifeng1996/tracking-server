import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AdminRoleDocument = AdminRole & Document;

@Schema()
export class AdminRole extends Document {
  @Prop()
  name: string;
  @Prop()
  description: string;
  @Prop({ type: Date, default: Date.now() })
  createTimeDate: Date;
  @Prop({ type: Date, default: Date.now() })
  modifyTimeDate: Date;
}

export const AdminRoleSchema = SchemaFactory.createForClass(AdminRole);
AdminRoleSchema.set('collection', 'admin_role');