import express from "express";
import {
  createLead,
  getAllLeads,
  getLead,
  updateLead,
  deleteLead,
} from "../controllers/lead.js";
import {
  createTask,
  getLeadTasks,
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

router.post("/", requireAdmin, createLead);
router.get("/", getAllLeads);
router.get("/:leadId", getLead);
router.patch("/:leadId", requireAdmin, updateLead);
router.delete("/:leadId", requireAdmin, deleteLead);

router.post("/:leadId/tasks", requireAdmin, createTask);
router.get("/:leadId/tasks", getLeadTasks);

export default router;
