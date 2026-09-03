import mongoose, { Schema, Document } from "mongoose";

export interface IProductDoc extends Document {
  businessId: mongoose.Types.ObjectId;
  name: string;
  sku: string;
  barcode?: string;
  description?: string;
  categoryId?: mongoose.Types.ObjectId;
  brand?: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  taxRate: number;
  minimumStock: number;
  maximumStock: number;
  images: string[];
  hasVariants: boolean;
  variants: {
    name: string;
    sku: string;
    barcode?: string;
    costPrice: number;
    sellingPrice: number;
    stock: number;
    attributes: Record<string, string>;
  }[];
  status: "active" | "inactive" | "archived";
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const ProductVariantSchema = new Schema(
  {
    name: { type: String, required: true },
    sku: { type: String, required: true },
    barcode: String,
    costPrice: { type: Number, required: true, default: 0 },
    sellingPrice: { type: Number, required: true, default: 0 },
    stock: { type: Number, required: true, default: 0 },
    attributes: { type: Map, of: String },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProductDoc>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, trim: true },
    barcode: { type: String, trim: true },
    description: { type: String, trim: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category" },
    brand: { type: String, trim: true },
    unit: { type: String, required: true, default: "pcs" },
    costPrice: { type: Number, required: true, default: 0 },
    sellingPrice: { type: Number, required: true, default: 0 },
    taxRate: { type: Number, default: 0 },
    minimumStock: { type: Number, default: 0 },
    maximumStock: { type: Number, default: 0 },
    images: [{ type: String }],
    hasVariants: { type: Boolean, default: false },
    variants: [ProductVariantSchema],
    status: {
      type: String,
      enum: ["active", "inactive", "archived"],
      default: "active",
    },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

ProductSchema.index({ businessId: 1, sku: 1 }, { unique: true });
ProductSchema.index({ businessId: 1, barcode: 1 });
ProductSchema.index({ businessId: 1, name: "text", sku: "text", barcode: "text" });
ProductSchema.index({ businessId: 1, status: 1 });
ProductSchema.index({ businessId: 1, categoryId: 1 });

export default mongoose.models.Product ||
  mongoose.model<IProductDoc>("Product", ProductSchema);
