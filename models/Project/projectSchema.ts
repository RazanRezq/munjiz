import mongoose, { Schema, Document, Model, Types } from "mongoose";

// Project interface - represents a project within a workspace
export interface IProject extends Document {
  name: string;
  description?: string;
  key: string; // Short key for task IDs (e.g., "MUN" for MUN-1, MUN-2)
  workspaceId: Types.ObjectId;
  ownerId: string; // User ID from auth system
  lead?: string; // User ID of project lead
  members: IProjectMember[];
  status: ProjectStatus;
  visibility: "public" | "private" | "workspace";
  color: string; // Hex color for project identification
  icon?: string; // Emoji or icon name
  settings: IProjectSettings;
  taskCount: number;
  completedTaskCount: number;
  createdAt: Date;
  updatedAt: Date;
  startDate?: Date;
  endDate?: Date;
}

export interface IProjectMember {
  userId: string; // User ID from auth system
  role: "lead" | "member" | "viewer";
  joinedAt: Date;
}

export interface IProjectSettings {
  defaultView: "board" | "list" | "timeline" | "calendar";
  enableTimeTracking: boolean;
  enableSubtasks: boolean;
  taskStatuses: ITaskStatus[];
  taskPriorities: ITaskPriority[];
}

export interface ITaskStatus {
  id: string;
  name: string;
  color: string;
  order: number;
  category: "todo" | "in_progress" | "done";
}

export interface ITaskPriority {
  id: string;
  name: string;
  color: string;
  order: number;
}

export type ProjectStatus = "active" | "archived" | "completed" | "on_hold";

// Default task statuses (Jira-like)
export const defaultTaskStatuses: ITaskStatus[] = [
  { id: "backlog", name: "Backlog", color: "#6B7280", order: 0, category: "todo" },
  { id: "todo", name: "To Do", color: "#3B82F6", order: 1, category: "todo" },
  { id: "in_progress", name: "In Progress", color: "#F59E0B", order: 2, category: "in_progress" },
  { id: "in_review", name: "In Review", color: "#8B5CF6", order: 3, category: "in_progress" },
  { id: "done", name: "Done", color: "#10B981", order: 4, category: "done" },
];

// Default task priorities
export const defaultTaskPriorities: ITaskPriority[] = [
  { id: "highest", name: "Highest", color: "#EF4444", order: 0 },
  { id: "high", name: "High", color: "#F97316", order: 1 },
  { id: "medium", name: "Medium", color: "#F59E0B", order: 2 },
  { id: "low", name: "Low", color: "#3B82F6", order: 3 },
  { id: "lowest", name: "Lowest", color: "#6B7280", order: 4 },
];

// Default project settings
export const defaultProjectSettings: IProjectSettings = {
  defaultView: "board",
  enableTimeTracking: false,
  enableSubtasks: true,
  taskStatuses: defaultTaskStatuses,
  taskPriorities: defaultTaskPriorities,
};

// Project colors
export const projectColors = [
  "#EF4444", // Red
  "#F97316", // Orange
  "#F59E0B", // Amber
  "#84CC16", // Lime
  "#10B981", // Emerald
  "#14B8A6", // Teal
  "#06B6D4", // Cyan
  "#3B82F6", // Blue
  "#6366F1", // Indigo
  "#8B5CF6", // Violet
  "#A855F7", // Purple
  "#EC4899", // Pink
];

// Task Status Schema
const TaskStatusSchema = new Schema<ITaskStatus>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    color: { type: String, required: true },
    order: { type: Number, required: true },
    category: {
      type: String,
      enum: ["todo", "in_progress", "done"],
      required: true,
    },
  },
  { _id: false }
);

// Task Priority Schema
const TaskPrioritySchema = new Schema<ITaskPriority>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    color: { type: String, required: true },
    order: { type: Number, required: true },
  },
  { _id: false }
);

// Project Settings Schema
const ProjectSettingsSchema = new Schema<IProjectSettings>(
  {
    defaultView: {
      type: String,
      enum: ["board", "list", "timeline", "calendar"],
      default: "board",
    },
    enableTimeTracking: { type: Boolean, default: false },
    enableSubtasks: { type: Boolean, default: true },
    taskStatuses: {
      type: [TaskStatusSchema],
      default: defaultTaskStatuses,
    },
    taskPriorities: {
      type: [TaskPrioritySchema],
      default: defaultTaskPriorities,
    },
  },
  { _id: false }
);

// Project Member Schema
const ProjectMemberSchema = new Schema<IProjectMember>(
  {
    userId: { type: String, required: true },
    role: {
      type: String,
      enum: ["lead", "member", "viewer"],
      required: true,
    },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// Project Schema
const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    key: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
      unique: true,
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    ownerId: { type: String, required: true, index: true },
    lead: { type: String },
    members: { type: [ProjectMemberSchema], default: [] },
    status: {
      type: String,
      enum: ["active", "archived", "completed", "on_hold"],
      default: "active",
    },
    visibility: {
      type: String,
      enum: ["public", "private", "workspace"],
      default: "workspace",
    },
    color: { type: String, required: true },
    icon: { type: String },
    settings: {
      type: ProjectSettingsSchema,
      default: defaultProjectSettings,
    },
    taskCount: { type: Number, default: 0 },
    completedTaskCount: { type: Number, default: 0 },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Add indexes for better query performance
ProjectSchema.index({ workspaceId: 1, status: 1 });
ProjectSchema.index({ ownerId: 1 });
ProjectSchema.index({ "members.userId": 1 });
ProjectSchema.index({ key: 1 }, { unique: true });

// Create a new project object helper
export function createProject(
  name: string,
  key: string,
  workspaceId: Types.ObjectId,
  ownerId: string,
  description?: string
): Partial<IProject> {
  const now = new Date();
  return {
    name,
    description: description || "",
    key: key.toUpperCase(),
    workspaceId,
    ownerId,
    members: [
      {
        userId: ownerId,
        role: "lead",
        joinedAt: now,
      },
    ],
    status: "active",
    visibility: "workspace",
    color: projectColors[Math.floor(Math.random() * projectColors.length)],
    settings: defaultProjectSettings,
    taskCount: 0,
    completedTaskCount: 0,
  };
}

// Export the model
const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);

export default Project;
