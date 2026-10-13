import mongoose from "mongoose";

const saleSchema = new mongoose.Schema(
  {
    items: [
      {
        productId: mongoose.Schema.Types.ObjectId,
        name: String,
        quantity: Number,
        price: Number,
      },
    ],
    subtotal: Number,
    tax: Number,
    discount: Number,
    total: Number,
    paymentMethod: String,
    customer: String,
  },
  { timestamps: true },
);

export const Sale = mongoose.models.Sale ?? mongoose.model("Sale", saleSchema);
