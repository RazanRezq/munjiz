import mongoose, { Schema, Document, Model } from "mongoose";

// User interface - represents a user in the system
export interface IUser extends Document {
  name?: string;
  email: string;
  emailVerified?: Date;
  image?: string;
  password?: string; // For credentials login (hashed)
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

// User Schema
const UserSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: {
      type: String,
      required: true,
      unique: true, // This already creates an index
      lowercase: true,
      trim: true,
    },
    emailVerified: { type: Date },
    image: { type: String },
    password: { type: String }, // Hashed password for credentials auth
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Index already created by unique: true on email field

// Export the model
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
