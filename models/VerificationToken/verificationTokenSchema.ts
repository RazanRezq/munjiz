import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * Verification Token Interface
 * Used for email verification during user registration
 */
export interface IVerificationToken extends Document {
  email: string;
  token: string;
  expires: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Verification Token Schema
 * Stores tokens for email verification with expiration
 */
const VerificationTokenSchema = new Schema<IVerificationToken>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expires: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Compound index to ensure one active token per email
VerificationTokenSchema.index({ email: 1, token: 1 }, { unique: true });

// Index on expires field for automatic cleanup of expired tokens
VerificationTokenSchema.index({ expires: 1 });

// Export the model
const VerificationToken: Model<IVerificationToken> =
  mongoose.models.VerificationToken ||
  mongoose.model<IVerificationToken>("VerificationToken", VerificationTokenSchema);

export default VerificationToken;
