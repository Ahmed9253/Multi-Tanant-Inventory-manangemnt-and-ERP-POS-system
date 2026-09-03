import mongoose, { Schema, Document } from "mongoose";

export interface ISaleDoc extends Document {
  businessId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  cashierId: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId;
  receiptNumber: string;
  invoiceNumber: string;
  items: {
    productId: mongoose.Types.ObjectId;
    variantSku?: string;
    name: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    costPrice: number;
    discountAmount: number;
    taxRate: number;
    taxAmount: number;
    total: number;
  }[];
  subtotal: number;
  discountAmount: number;
  discountPercent: number;
  taxAmount: number;
  total: number;
  payments: {
    method: "cash" | "card" | "bank_transfer" | "mobile" | "other";
    amount: number;
    reference?: string;
    receivedAt: Date;
  }[];
  status: "completed" | "refunded" | "partially_refunded" | "voided";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SaleItemSchema = new Schema(
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
    unitPrice: { type: Number, required: true },
    costPrice: { type: Number, required: true, default: 0 },
    discountAmount: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    total: { type: Number, required: true },
  },
  { _id: false }
);

const SalePaymentSchema = new Schema(
  {
    method: {
      type: String,
      required: true,
      enum: ["cash", "card", "bank_transfer", "mobile", "other"],
    },
    amount: { type: Number, required: true },
    reference: String,
    receivedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const SaleSchema = new Schema<ISaleDoc>(
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
    cashierId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
    receiptNumber: { type: String, required: true },
    invoiceNumber: { type: String, required: true },
    items: [SaleItemSchema],
    subtotal: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    discountPercent: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    payments: [SalePaymentSchema],
    status: {
      type: String,
      enum: ["completed", "refunded", "partially_refunded", "voided"],
      default: "completed",
    },
    notes: String,
  },
  { timestamps: true }
);

SaleSchema.index({ businessId: 1, storeId: 1, createdAt: -1 });
SaleSchema.index({ businessId: 1, receiptNumber: 1 });
SaleSchema.index({ businessId: 1, customerId: 1 });
SaleSchema.index({ businessId: 1, cashierId: 1 });
SaleSchema.index({ businessId: 1, status: 1 });

export default mongoose.models.Sale ||
  mongoose.model<ISaleDoc>("Sale", SaleSchema);
