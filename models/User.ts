import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUserDoc extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  phone?: string;
  status: "active" | "inactive" | "suspended";
  emailVerified?: Date;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUserDoc>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true, select: false },
    avatar: { type: String },
    phone: { type: String, trim: true },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    emailVerified: { type: Date },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ status: 1 });

UserSchema.pre("save", async function () {
   
  const user = this as unknown as {
    isModified: (path: string) => boolean;
    password: string;
  };
  if (!user.isModified("password")) return;
  const salt = await bcrypt.genSalt(12);
  user.password = await bcrypt.hash(user.password, salt);
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User ||
  mongoose.model<IUserDoc>("User", UserSchema);
