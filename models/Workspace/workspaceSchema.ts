import mongoose, { Schema, Document, Model } from "mongoose";

// Workspace interface - represents a user's workspace
export interface IWorkspace extends Document {
  name: string;
  description?: string;
  ownerId: string; // User ID from auth system
  members: IWorkspaceMember[];
  settings: IWorkspaceSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWorkspaceMember {
  userId: string; // User ID from auth system
  email: string;
  role: "owner" | "admin" | "member" | "viewer";
  joinedAt: Date;
}

export interface IWorkspaceSettings {
  defaultProjectView: "board" | "list" | "timeline";
  allowMemberInvites: boolean;
  isPublic: boolean;
}

// Default workspace settings
export const defaultWorkspaceSettings: IWorkspaceSettings = {
  defaultProjectView: "board",
  allowMemberInvites: true,
  isPublic: false,
};

// Workspace Member Schema
const WorkspaceMemberSchema = new Schema<IWorkspaceMember>({
  userId: { type: String, required: true },
  email: { type: String, required: true },
  role: {
    type: String,
    enum: ["owner", "admin", "member", "viewer"],
    required: true,
  },
  joinedAt: { type: Date, default: Date.now },
});

// Workspace Settings Schema
const WorkspaceSettingsSchema = new Schema<IWorkspaceSettings>({
  defaultProjectView: {
    type: String,
    enum: ["board", "list", "timeline"],
    default: "board",
  },
  allowMemberInvites: { type: Boolean, default: true },
  isPublic: { type: Boolean, default: false },
});

// Workspace Schema
const WorkspaceSchema = new Schema<IWorkspace>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    ownerId: { type: String, required: true, index: true },
    members: { type: [WorkspaceMemberSchema], default: [] },
    settings: { type: WorkspaceSettingsSchema, default: defaultWorkspaceSettings },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Add indexes for better query performance
WorkspaceSchema.index({ ownerId: 1 });
WorkspaceSchema.index({ "members.userId": 1 });

// Create a new workspace object helper
export function createWorkspace(
  name: string,
  ownerId: string,
  ownerEmail: string,
  description?: string
): Partial<IWorkspace> {
  const now = new Date();
  return {
    name,
    description: description || "",
    ownerId,
    members: [
      {
        userId: ownerId,
        email: ownerEmail,
        role: "owner",
        joinedAt: now,
      },
    ],
    settings: defaultWorkspaceSettings,
  };
}

// Export the model
const Workspace: Model<IWorkspace> =
  mongoose.models.Workspace || mongoose.model<IWorkspace>("Workspace", WorkspaceSchema);

export default Workspace;
