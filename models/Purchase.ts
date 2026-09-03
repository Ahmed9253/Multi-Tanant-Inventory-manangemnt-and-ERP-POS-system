import mongoose, { Schema, Document } from "mongoose";

export interface IPurchaseDoc extends Document {
  businessId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  supplierId?: mongoose.Types.ObjectId;
  purchaseOrderNumber: string;
  items: {
    productId: mongoose.Types.ObjectId;
    variantSku?: string;
    name: string;
    sku: string;
    quantity: number;
    receivedQuantity: number;
    costPrice: number;
    taxRate: number;
    taxAmount: number;
    total: number;
  }[];
  subtotal: number;
  taxAmount: number;
  total: number;
  status: "draft" | "ordered" | "received" | "partially_received" | "cancelled";
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseItemSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variantSku: String,
    name: { type: String, required: true },
    sku: { type: String, required: true },
    quantity: { type: Number, required: true },
    receivedQuantity: { type: Number, default: 0 },
    costPrice: { type: Number, required: true },
    taxRate: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    total: { type: Number, required: true },
  },
  { _id: false }
);

const PurchaseSchema = new Schema<IPurchaseDoc>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    supplierId: { type: Schema.Types.ObjectId, ref: "Supplier" },
    purchaseOrderNumber: { type: String, required: true },
    items: [PurchaseItemSchema],
    subtotal: { type: Number, required: true },
    taxAmount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["draft", "ordered", "received", "partially_received", "cancelled"],
      default: "draft",
    },
    notes: String,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

PurchaseSchema.index({ businessId: 1, storeId: 1, createdAt: -1 });
PurchaseSchema.index({ businessId: 1, purchaseOrderNumber: 1 });
PurchaseSchema.index({ businessId: 1, supplierId: 1 });
PurchaseSchema.index({ businessId: 1, status: 1 });

export default mongoose.models.Purchase ||
  mongoose.model<IPurchaseDoc>("Purchase", PurchaseSchema);
