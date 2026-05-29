import express from "express";
import {
  getAllTasks,
  getTaskByUserId,
  getTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from "../controllers/task.js";
import { authenticate } from "../middleware/authentication.js";
import { workspaceMiddleware } from "../middleware/workspaceId.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = express.Router();

router.use(authenticate, workspaceMiddleware);

router.get("/", getAllTasks);
router.get("/user/:userId", getTaskByUserId);
router.get("/:taskId", getTask);
router.patch("/:taskId", requireAdmin, updateTask);
router.patch("/:taskId/status", updateTaskStatus);
router.delete("/:taskId", requireAdmin, deleteTask);

export default router;
