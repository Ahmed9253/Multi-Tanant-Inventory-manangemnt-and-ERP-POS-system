import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: String,
    price: Number,
    stock: Number,
    barcode: { type: String, unique: true, sparse: true },
    sku: String,
  },
  { timestamps: true },
);

export const Product =
  mongoose.models.Product ?? mongoose.model("Product", productSchema);
