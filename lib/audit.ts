import { connectDB } from "./db";
import { AuditLog } from "@/models";

export async function createAuditLog(params: {
  businessId: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}): Promise<void> {
  await connectDB();
  await AuditLog.create({
    businessId: params.businessId,
    userId: params.userId,
    action: params.action,
    resource: params.resource,
    resourceId: params.resourceId,
    metadata: params.metadata,
    ipAddress: params.ipAddress,
  });
}
