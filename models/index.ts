/**
 * Central export file for all MongoDB/Mongoose models
 * Import models from here to use them in your API routes
 * 
 * Example usage:
 * import { User, Workspace, Project, Task } from "@/models";
 */

// User
export { default as User } from "./User/userSchema";
export type { IUser } from "./User/userSchema";

// Workspace
export { default as Workspace } from "./Workspace/workspaceSchema";
export type {
  IWorkspace,
  IWorkspaceMember,
  IWorkspaceSettings,
} from "./Workspace/workspaceSchema";
export {
  defaultWorkspaceSettings,
  createWorkspace,
} from "./Workspace/workspaceSchema";

// Project
export { default as Project } from "./Project/projectSchema";
export type {
  IProject,
  IProjectMember,
  IProjectSettings,
  ITaskStatus,
  ITaskPriority,
  ProjectStatus,
} from "./Project/projectSchema";
export {
  defaultTaskStatuses,
  defaultTaskPriorities,
  defaultProjectSettings,
  projectColors,
  createProject,
} from "./Project/projectSchema";

// Task
export {
  default as Task,
  TaskComment,
  TaskActivity,
  TaskAttachment,
} from "./Task/taskSchema";
export type {
  ITask,
  ITaskComment,
  ITaskActivity,
  ITaskAttachment,
  TaskType,
  TaskActivityAction,
} from "./Task/taskSchema";
export { taskTypeConfig, createTask } from "./Task/taskSchema";
