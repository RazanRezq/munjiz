import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * Invitation Status Types
 */
export type InvitationStatus = "pending" | "accepted" | "declined" | "expired";

/**
 * Workspace Role Types (matching workspace member roles)
 */
export type InvitationRole = "admin" | "member" | "viewer";

/**
 * Invitation Interface - represents a workspace invitation
 */
export interface IInvitation extends Document {
  email: string; // Email of the invited user
  workspaceId: mongoose.Types.ObjectId; // The workspace being invited to
  workspaceName: string; // Cached workspace name for emails
  invitedBy: mongoose.Types.ObjectId; // User who sent the invitation
  inviterName: string; // Cached inviter name for emails
  role: InvitationRole; // Role the user will have upon accepting
  token: string; // Unique invitation token
  status: InvitationStatus;
  message?: string; // Optional custom message from the inviter
  expires: Date; // Expiration date
  acceptedAt?: Date; // When the invitation was accepted
  declinedAt?: Date; // When the invitation was declined
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Default expiration time for invitations (7 days)
 */
export const INVITATION_EXPIRY_DAYS = 7;

/**
 * Generate invitation expiration date
 */
export const getInvitationExpiry = () => {
  return new Date(Date.now() + INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
};

/**
 * Invitation Schema
 */
const InvitationSchema = new Schema<IInvitation>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    workspaceName: {
      type: String,
      required: true,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    inviterName: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "member", "viewer"],
      default: "member",
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "expired"],
      default: "pending",
    },
    message: {
      type: String,
      maxlength: 500,
    },
    expires: {
      type: Date,
      required: true,
      default: getInvitationExpiry,
    },
    acceptedAt: {
      type: Date,
    },
    declinedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for finding invitations by email
InvitationSchema.index({ email: 1 });

// Index for finding invitations by workspace
InvitationSchema.index({ workspaceId: 1 });

// Index for finding pending invitations by token
InvitationSchema.index({ token: 1 }, { unique: true });

// Compound index for checking if user is already invited to a workspace
InvitationSchema.index({ email: 1, workspaceId: 1, status: 1 });

// Index on expires for cleanup of expired invitations
InvitationSchema.index({ expires: 1 });

// Export the model
const Invitation: Model<IInvitation> =
  mongoose.models.Invitation ||
  mongoose.model<IInvitation>("Invitation", InvitationSchema);

export default Invitation;
