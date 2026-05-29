import prisma from "../config/db.js";
import { assertLeadVisible, memberTaskFilter } from "../utils/leadAccess.js";

const TASK_STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED"];

const taskInclude = {
  assignedTo: {
    select: { id: true, name: true, email: true },
  },
  lead: {
    select: {
      id: true,
      companyName: true,
      status: true,
    },
  },
};

async function validateTaskAssignee(workspaceId, leadId, assignedToId) {
  const membership = await prisma.membership.findUnique({
    where: {
      userId_workspaceId: {
        userId: assignedToId,
        workspaceId,
      },
    },
  });

  if (!membership) {
    return { ok: false, message: "Assigned user is not a member of this workspace" };
  }

  const lead = await prisma.lead.findFirst({
    where: { id: leadId, workspaceId },
    include: {
      assignedTo: { select: { id: true } },
    },
  });

  if (!lead) {
    return { ok: false, message: "Lead not found in this workspace" };
  }

  const assignedToLead = lead.assignedTo.some((u) => u.id === assignedToId);
  if (!assignedToLead) {
    return {
      ok: false,
      message: "Assigned user must already be assigned to this lead",
    };
  }

  return { ok: true, lead };
}

export const createTask = async (req, res) => {
  try {
    const workspaceId = req.workspace.id;
    const leadId = Number(req.params.leadId);
    const { title, description, priority, dueDate, assignedToId } = req.body;

    if (!title || !assignedToId) {
      return res.status(400).json({
        success: false,
        message: "Title and assignedToId are required",
      });
    }

    const validation = await validateTaskAssignee(
      workspaceId,
      leadId,
      assignedToId,
    );

    if (!validation.ok) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        assignedToId,
        leadId,
        workspaceId,
      },
      include: taskInclude,
    });

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    console.error("createTask:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllTasks = async (req, res) => {
  try {
    const workspaceId = req.workspace.id;
    const isAdmin = req.membership.role === "ADMIN";

    const tasks = await prisma.task.findMany({
      where: {
        workspaceId,
        ...(isAdmin ? {} : memberTaskFilter(req.user.id)),
      },
      orderBy: { createdAt: "desc" },
      include: taskInclude,
    });

    return res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.error("getAllTasks:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getTaskByUserId = async (req, res) => {
  try {
    const workspaceId = req.workspace.id;
    const { userId } = req.params;
    const isAdmin = req.membership.role === "ADMIN";

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    if (!isAdmin && userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Members can only view their own tasks",
      });
    }

    const membership = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
    });

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: "User not found in this workspace",
      });
    }

    const tasks = await prisma.task.findMany({
      where: {
        workspaceId,
        assignedToId: userId,
        ...(isAdmin ? {} : memberTaskFilter(req.user.id)),
      },
      orderBy: { createdAt: "desc" },
      include: taskInclude,
    });

    return res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.error("getTaskByUserId:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getLeadTasks = async (req, res) => {
  try {
    const lead = await assertLeadVisible(req, res, req.params.leadId);
    if (!lead) return;

    const tasks = await prisma.task.findMany({
      where: {
        workspaceId: req.workspace.id,
        leadId: Number(req.params.leadId),
      },
      orderBy: { createdAt: "desc" },
      include: taskInclude,
    });

    return res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.error("getLeadTasks:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getTask = async (req, res) => {
  try {
    const workspaceId = req.workspace.id;
    const isAdmin = req.membership.role === "ADMIN";

    const task = await prisma.task.findFirst({
      where: {
        id: Number(req.params.taskId),
        workspaceId,
        ...(isAdmin ? {} : memberTaskFilter(req.user.id)),
      },
      include: taskInclude,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({ success: true, task });
  } catch (error) {
    console.error("getTask:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const workspaceId = req.workspace.id;
    const taskId = Number(req.params.taskId);

    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, workspaceId },
    });

    if (!existingTask) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const { title, description, priority, status, dueDate, assignedToId } =
      req.body;

    if (status && !TASK_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    if (assignedToId && assignedToId !== existingTask.assignedToId) {
      const validation = await validateTaskAssignee(
        workspaceId,
        existingTask.leadId,
        assignedToId,
      );

      if (!validation.ok) {
        return res.status(400).json({
          success: false,
          message: validation.message,
        });
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(priority !== undefined && { priority }),
        ...(status !== undefined && { status }),
        ...(dueDate !== undefined && {
          dueDate: dueDate ? new Date(dueDate) : null,
        }),
        ...(assignedToId !== undefined && { assignedToId }),
      },
      include: taskInclude,
    });

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error("updateTask:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const workspaceId = req.workspace.id;
    const taskId = Number(req.params.taskId);
    const { status } = req.body;
    const isAdmin = req.membership.role === "ADMIN";

    if (!status || !TASK_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        workspaceId,
        ...(isAdmin ? {} : memberTaskFilter(req.user.id)),
      },
    });

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (!isAdmin && task.assignedToId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Members can only update status of their own tasks",
      });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status },
      include: taskInclude,
    });

    return res.status(200).json({
      success: true,
      message: "Task status updated",
      task: updatedTask,
    });
  } catch (error) {
    console.error("updateTaskStatus:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await prisma.task.findFirst({
      where: {
        id: Number(req.params.taskId),
        workspaceId: req.workspace.id,
      },
    });

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    await prisma.task.delete({
      where: { id: task.id },
    });

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("deleteTask:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
