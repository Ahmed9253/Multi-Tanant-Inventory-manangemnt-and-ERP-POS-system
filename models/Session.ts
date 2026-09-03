import mongoose, { Schema, Document } from "mongoose";

export interface ISessionDoc extends Document {
  userId: mongoose.Types.ObjectId;
  businessId: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

const SessionSchema = new Schema<ISessionDoc>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  businessId: {
    type: Schema.Types.ObjectId,
    ref: "Business",
    required: true,
  },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

SessionSchema.index({ token: 1 }, { unique: true });
SessionSchema.index({ userId: 1 });
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Session ||
  mongoose.model<ISessionDoc>("Session", SessionSchema);
