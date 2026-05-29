import prisma from "../config/db.js";

export const workspaceMiddleware = async (req, res, next) => {
  try {
    const workspaceId = req.headers["x-workspace-id"];

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        message: "x-workspace-id header is required",
      });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found",
      });
    }

    const membership = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: req.user.id,
          workspaceId,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "You do not belong to this workspace",
      });
    }

    req.workspace = workspace;
    req.membership = membership;
    next();
  } catch (error) {
    console.error("workspaceMiddleware:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
