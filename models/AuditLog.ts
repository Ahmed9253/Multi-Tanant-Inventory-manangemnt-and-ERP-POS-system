import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLogDoc extends Document {
  businessId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  action: string;
  resource: string;
  resourceId?: mongoose.Types.ObjectId;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLogDoc>(
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
    action: { type: String, required: true },
    resource: { type: String, required: true },
    resourceId: { type: Schema.Types.ObjectId },
    metadata: { type: Schema.Types.Mixed },
    ipAddress: String,
  },
  { timestamps: true }
);

AuditLogSchema.index({ businessId: 1, createdAt: -1 });
AuditLogSchema.index({ businessId: 1, resource: 1 });
AuditLogSchema.index({ businessId: 1, userId: 1 });
AuditLogSchema.index({ businessId: 1, action: 1 });

export default mongoose.models.AuditLog ||
  mongoose.model<IAuditLogDoc>("AuditLog", AuditLogSchema);
