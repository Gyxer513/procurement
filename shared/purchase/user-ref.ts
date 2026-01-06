export type UserRef = {
  fullName: string;
  email: string;
  keycloakId?: string;
};

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class UserRefSchema {
  @Prop({ type: String, required: true })
  fullName!: string;

  @Prop({ type: String, required: true })
  email!: string;

  @Prop({ type: String })
  keycloakId?: string;
}

export const UserRefSchemaFactory = SchemaFactory.createForClass(UserRefSchema);
