import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SuperLoginTokenDocument = SuperLoginToken & Document;

@Schema()
export class SuperLoginToken extends Document {
  @Prop()
  user: Types.ObjectId;
  @Prop()
  token: string;
}

export const SuperLoginTokenSchema = SchemaFactory.createForClass(SuperLoginToken);
SuperLoginTokenSchema.set('collection', 'super_login_token');
