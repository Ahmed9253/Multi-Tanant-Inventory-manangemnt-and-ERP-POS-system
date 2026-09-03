import mongoose, { Schema, Document } from "mongoose";

export interface INotificationDoc extends Document {
  businessId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  read: boolean;
  link?: string;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotificationDoc>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["info", "warning", "success", "error"],
      default: "info",
    },
    read: { type: Boolean, default: false },
    link: String,
  },
  { timestamps: true }
);

NotificationSchema.index({ businessId: 1, userId: 1, read: 1 });
NotificationSchema.index({ businessId: 1, createdAt: -1 });

export default mongoose.models.Notification ||
  mongoose.model<INotificationDoc>("Notification", NotificationSchema);
