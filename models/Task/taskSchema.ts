import mongoose, { Schema, Document, Model, Types } from "mongoose";

// Task interface - represents a task/issue within a project
export interface ITask extends Document {
  key: string; // e.g., "MUN-1", "MUN-2"
  number: number; // Sequential number within project
  title: string;
  description?: string;
  projectId: Types.ObjectId;
  workspaceId: Types.ObjectId;

  // Type and status
  type: TaskType;
  statusId: string; // References project's taskStatuses
  priorityId: string; // References project's taskPriorities

  // Assignment
  reporterId: string; // User ID - who created
  assigneeId?: string; // User ID - who's working on it

  // Hierarchy
  parentId?: Types.ObjectId; // For subtasks
  subtaskIds: Types.ObjectId[];

  // Labels and categorization
  labels: string[];

  // Time tracking
  estimatedHours?: number;
  loggedHours: number;

  // Dates
  dueDate?: Date;
  startDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Additional fields
  storyPoints?: number;
  sprint?: string;

  // Comments and activity (stored separately for performance)
  commentCount: number;
  attachmentCount: number;
}

export type TaskType =
  | "task"
  | "bug"
  | "story"
  | "epic"
  | "subtask"
  | "improvement"
  | "feature";

// Task comment interface
export interface ITaskComment extends Document {
  taskId: Types.ObjectId;
  authorId: string; // User ID from auth system
  content: string;
  mentions: string[]; // Array of user IDs
  createdAt: Date;
  updatedAt: Date;
  isEdited: boolean;
}

// Task activity/history interface
export interface ITaskActivity extends Document {
  taskId: Types.ObjectId;
  userId: string; // User ID from auth system
  action: TaskActivityAction;
  field?: string; // Which field changed
  oldValue?: string;
  newValue?: string;
  createdAt: Date;
}

export type TaskActivityAction =
  | "created"
  | "updated"
  | "status_changed"
  | "assigned"
  | "unassigned"
  | "commented"
  | "attachment_added"
  | "attachment_removed"
  | "label_added"
  | "label_removed"
  | "moved"
  | "archived"
  | "restored";

// Task attachment interface
export interface ITaskAttachment extends Document {
  taskId: Types.ObjectId;
  uploaderId: string; // User ID from auth system
  filename: string;
  originalName: string;
  mimeType: string;
  size: number; // in bytes
  url: string;
  createdAt: Date;
}

// Task type icons and colors
export const taskTypeConfig: Record<TaskType, { icon: string; color: string }> =
  {
    task: { icon: "CheckSquare", color: "#3B82F6" },
    bug: { icon: "Bug", color: "#EF4444" },
    story: { icon: "BookOpen", color: "#10B981" },
    epic: { icon: "Zap", color: "#8B5CF6" },
    subtask: { icon: "GitBranch", color: "#6B7280" },
    improvement: { icon: "TrendingUp", color: "#F59E0B" },
    feature: { icon: "Star", color: "#EC4899" },
  };

// Task Schema
const TaskSchema = new Schema<ITask>(
  {
    key: { type: String, required: true, unique: true, index: true },
    number: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["task", "bug", "story", "epic", "subtask", "improvement", "feature"],
      default: "task",
    },
    statusId: { type: String, required: true, index: true },
    priorityId: { type: String, required: true },
    reporterId: { type: String, required: true, index: true },
    assigneeId: { type: String, index: true },
    parentId: { type: Schema.Types.ObjectId, ref: "Task" },
    subtaskIds: [{ type: Schema.Types.ObjectId, ref: "Task" }],
    labels: [{ type: String }],
    estimatedHours: { type: Number },
    loggedHours: { type: Number, default: 0 },
    dueDate: { type: Date },
    startDate: { type: Date },
    completedAt: { type: Date },
    storyPoints: { type: Number },
    sprint: { type: String },
    commentCount: { type: Number, default: 0 },
    attachmentCount: { type: Number, default: 0 },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Add indexes for better query performance
TaskSchema.index({ projectId: 1, number: 1 }, { unique: true });
TaskSchema.index({ workspaceId: 1, statusId: 1 });
TaskSchema.index({ assigneeId: 1 });
TaskSchema.index({ reporterId: 1 });
TaskSchema.index({ parentId: 1 });

// Task Comment Schema
const TaskCommentSchema = new Schema<ITaskComment>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true,
    },
    authorId: { type: String, required: true, index: true },
    content: { type: String, required: true },
    mentions: [{ type: String }],
    isEdited: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Add indexes
TaskCommentSchema.index({ taskId: 1, createdAt: -1 });

// Task Activity Schema
const TaskActivitySchema = new Schema<ITaskActivity>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true,
    },
    userId: { type: String, required: true, index: true },
    action: {
      type: String,
      enum: [
        "created",
        "updated",
        "status_changed",
        "assigned",
        "unassigned",
        "commented",
        "attachment_added",
        "attachment_removed",
        "label_added",
        "label_removed",
        "moved",
        "archived",
        "restored",
      ],
      required: true,
    },
    field: { type: String },
    oldValue: { type: String },
    newValue: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false, // We only need createdAt
  }
);

// Add indexes
TaskActivitySchema.index({ taskId: 1, createdAt: -1 });

// Task Attachment Schema
const TaskAttachmentSchema = new Schema<ITaskAttachment>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true,
    },
    uploaderId: { type: String, required: true, index: true },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false, // We only need createdAt
  }
);

// Add indexes
TaskAttachmentSchema.index({ taskId: 1, createdAt: -1 });

// Create a new task object helper
export function createTask(
  title: string,
  projectId: Types.ObjectId,
  workspaceId: Types.ObjectId,
  projectKey: string,
  taskNumber: number,
  reporterId: string,
  type: TaskType = "task",
  statusId: string = "todo",
  priorityId: string = "medium"
): Partial<ITask> {
  return {
    key: `${projectKey}-${taskNumber}`,
    number: taskNumber,
    title,
    projectId,
    workspaceId,
    type,
    statusId,
    priorityId,
    reporterId,
    subtaskIds: [],
    labels: [],
    loggedHours: 0,
    commentCount: 0,
    attachmentCount: 0,
  };
}

// Export the models
const Task: Model<ITask> =
  mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);

const TaskComment: Model<ITaskComment> =
  mongoose.models.TaskComment ||
  mongoose.model<ITaskComment>("TaskComment", TaskCommentSchema);

const TaskActivity: Model<ITaskActivity> =
  mongoose.models.TaskActivity ||
  mongoose.model<ITaskActivity>("TaskActivity", TaskActivitySchema);

const TaskAttachment: Model<ITaskAttachment> =
  mongoose.models.TaskAttachment ||
  mongoose.model<ITaskAttachment>("TaskAttachment", TaskAttachmentSchema);

export default Task;
export { TaskComment, TaskActivity, TaskAttachment };
