import mongoose, { Schema, Document } from "mongoose";

export interface IInventoryDoc extends Document {
  businessId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  variantSku?: string;
  quantity: number;
  reservedQuantity: number;
  incomingQuantity: number;
  lastCountedAt?: Date;
  updatedAt: Date;
}

const InventorySchema = new Schema<IInventoryDoc>(
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
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variantSku: { type: String },
    quantity: { type: Number, required: true, default: 0 },
    reservedQuantity: { type: Number, required: true, default: 0 },
    incomingQuantity: { type: Number, required: true, default: 0 },
    lastCountedAt: { type: Date },
  },
  { timestamps: true }
);

InventorySchema.index(
  { businessId: 1, storeId: 1, productId: 1, variantSku: 1 },
  { unique: true }
);
InventorySchema.index({ businessId: 1, storeId: 1 });

export default mongoose.models.Inventory ||
  mongoose.model<IInventoryDoc>("Inventory", InventorySchema);
