import prisma from "../config/db.js";
import { generateJoinCode, slugify } from "../utils/generateCode.js";

const workspaceSelect = {
  id: true,
  name: true,
  slug: true,
  joinCode: true,
  createdAt: true,
  updatedAt: true,
};

export const getUserWorkspaces = async (req, res) => {
  try {
    const memberships = await prisma.membership.findMany({
      where: { userId: req.user.id },
      include: {
        workspace: { select: workspaceSelect },
      },
      orderBy: { workspace: { createdAt: "desc" } },
    });

    return res.status(200).json({
      success: true,
      workspaces: memberships.map((m) => ({
        ...m.workspace,
        role: m.role,
      })),
    });
  } catch (error) {
    console.error("getUserWorkspaces:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createWorkspace = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;

  if (!name?.trim()) {
    return res.status(400).json({
      success: false,
      message: "Workspace name is required",
    });
  }

  try {
    const baseSlug = slugify(name);
    let slug = baseSlug || `workspace-${Date.now()}`;
    let joinCode = generateJoinCode();
    let attempts = 0;

    while (attempts < 5) {
      const slugTaken = await prisma.workspace.findUnique({ where: { slug } });
      const codeTaken = await prisma.workspace.findUnique({ where: { joinCode } });

      if (!slugTaken && !codeTaken) break;

      if (slugTaken) slug = `${baseSlug}-${Date.now()}`;
      if (codeTaken) joinCode = generateJoinCode();
      attempts += 1;
    }

    const workspace = await prisma.$transaction(async (tx) => {
      const newWorkspace = await tx.workspace.create({
        data: {
          name: name.trim(),
          slug,
          joinCode,
          ownerId: userId,
        },
        select: workspaceSelect,
      });

      await tx.membership.create({
        data: {
          userId,
          workspaceId: newWorkspace.id,
          role: "ADMIN",
        },
      });

      return newWorkspace;
    });

    return res.status(201).json({
      success: true,
      message: "Workspace created successfully",
      workspace: { ...workspace, role: "ADMIN" },
    });
  } catch (error) {
    console.error("createWorkspace:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const joinWorkspace = async (req, res) => {
  const { joinCode } = req.body;
  const userId = req.user.id;

  if (!joinCode?.trim()) {
    return res.status(400).json({
      success: false,
      message: "Join code is required",
    });
  }

  try {
    const workspace = await prisma.workspace.findUnique({
      where: { joinCode: joinCode.trim().toUpperCase() },
      select: workspaceSelect,
    });

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Invalid join code",
      });
    }

    const existingMembership = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId: workspace.id,
        },
      },
    });

    if (existingMembership) {
      return res.status(400).json({
        success: false,
        message: "You are already a member of this workspace",
      });
    }

    await prisma.membership.create({
      data: {
        userId,
        workspaceId: workspace.id,
        role: "MEMBER",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Joined workspace successfully",
      workspace: { ...workspace, role: "MEMBER" },
    });
  } catch (error) {
    console.error("joinWorkspace:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getWorkspaceMembers = async (req, res) => {
  try {
    const members = await prisma.membership.findMany({
      where: { workspaceId: req.workspace.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
      orderBy: { user: { name: "asc" } },
    });

    return res.status(200).json({
      success: true,
      members: members.map((m) => ({
        id: m.id,
        role: m.role,
        user: m.user,
      })),
    });
  } catch (error) {
    console.error("getWorkspaceMembers:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
