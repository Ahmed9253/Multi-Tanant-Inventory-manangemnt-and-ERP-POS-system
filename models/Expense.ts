import mongoose, { Schema, Document } from "mongoose";

export interface IExpenseDoc extends Document {
  businessId: mongoose.Types.ObjectId;
  storeId?: mongoose.Types.ObjectId;
  categoryId?: string;
  amount: number;
  description: string;
  date: Date;
  receiptUrl?: string;
  status: "pending" | "approved" | "rejected";
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpenseDoc>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    storeId: { type: Schema.Types.ObjectId, ref: "Store" },
    categoryId: { type: String },
    amount: { type: Number, required: true },
    description: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    receiptUrl: String,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

ExpenseSchema.index({ businessId: 1, storeId: 1, date: -1 });
ExpenseSchema.index({ businessId: 1, status: 1 });
ExpenseSchema.index({ businessId: 1, createdBy: 1 });

export default mongoose.models.Expense ||
  mongoose.model<IExpenseDoc>("Expense", ExpenseSchema);
