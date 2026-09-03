import mongoose, { Schema, Document } from "mongoose";

export interface IInventoryMovementDoc extends Document {
  businessId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  variantSku?: string;
  quantity: number;
  type:
    | "PURCHASE_RECEIVED"
    | "SALE"
    | "SALE_RETURN"
    | "ADJUSTMENT"
    | "TRANSFER_OUT"
    | "TRANSFER_IN"
    | "DAMAGE"
    | "EXPIRY"
    | "OPENING_BALANCE";
  reference?: string;
  referenceId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
}

const InventoryMovementSchema = new Schema<IInventoryMovementDoc>(
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
    quantity: { type: Number, required: true },
    type: {
      type: String,
      required: true,
      enum: [
        "PURCHASE_RECEIVED",
        "SALE",
        "SALE_RETURN",
        "ADJUSTMENT",
        "TRANSFER_OUT",
        "TRANSFER_IN",
        "DAMAGE",
        "EXPIRY",
        "OPENING_BALANCE",
      ],
    },
    reference: { type: String },
    referenceId: { type: Schema.Types.ObjectId },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    notes: { type: String },
  },
  { timestamps: true }
);

InventoryMovementSchema.index({ businessId: 1, storeId: 1 });
InventoryMovementSchema.index({ businessId: 1, productId: 1 });
InventoryMovementSchema.index({ businessId: 1, type: 1 });
InventoryMovementSchema.index({ businessId: 1, createdAt: -1 });

export default mongoose.models.InventoryMovement ||
  mongoose.model<IInventoryMovementDoc>(
    "InventoryMovement",
    InventoryMovementSchema
  );
