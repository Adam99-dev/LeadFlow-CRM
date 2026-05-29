import express from "express";
import { authenticate } from "../middleware/authentication.js";
import { workspaceMiddleware } from "../middleware/workspaceId.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import {
  getUserWorkspaces,
  createWorkspace,
  joinWorkspace,
  getWorkspaceMembers,
} from "../controllers/workspace.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getUserWorkspaces);
router.post("/", createWorkspace);
router.post("/join", joinWorkspace);

router.get(
  "/members",
  workspaceMiddleware,
  requireAdmin,
  getWorkspaceMembers,
);

export default router;
