import prisma from "../config/db.js";
import {
  assertLeadVisible,
  findWorkspaceLead,
  memberLeadFilter,
} from "../utils/leadAccess.js";

const LEAD_STATUSES = ["NEW", "CONTACTED", "NEGOTIATION", "WON", "LOST"];

const leadInclude = {
  assignedTo: {
    select: { id: true, name: true, email: true },
  },
  tasks: {
    orderBy: { createdAt: "desc" },
    include: {
      assignedTo: {
        select: { id: true, name: true, email: true },
      },
    },
  },
};

async function validateWorkspaceAssignees(workspaceId, assignedToIds) {
  const members = await prisma.membership.findMany({
    where: {
      workspaceId,
      userId: { in: assignedToIds },
      role: "MEMBER",
    },
    select: { userId: true },
  });

  return members.length === assignedToIds.length;
}

export const createLead = async (req, res) => {
  try {
    const workspaceId = req.workspace.id;
    const {
      companyName,
      contactPerson,
      contactEmail,
      contactNumber,
      status,
      notes,
      assignedToIds,
    } = req.body;

    if (
      !companyName ||
      !contactPerson ||
      !contactEmail ||
      !contactNumber ||
      !Array.isArray(assignedToIds) ||
      assignedToIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields including assignedToIds are mandatory",
      });
    }

    if (status && !LEAD_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const validAssignees = await validateWorkspaceAssignees(
      workspaceId,
      assignedToIds,
    );

    if (!validAssignees) {
      return res.status(400).json({
        success: false,
        message: "Leads can only be assigned to workspace members (not admins)",
      });
    }

    const lead = await prisma.lead.create({
      data: {
        companyName,
        contactPerson,
        contactEmail,
        contactNumber,
        status: status || "NEW",
        notes,
        workspaceId,
        assignedTo: {
          connect: assignedToIds.map((id) => ({ id })),
        },
      },
      include: leadInclude,
    });

    return res.status(201).json({
      success: true,
      message: "Lead created successfully",
      lead,
    });
  } catch (error) {
    console.error("createLead:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getAllLeads = async (req, res) => {
  try {
    const workspaceId = req.workspace.id;
    const isAdmin = req.membership.role === "ADMIN";

    const leads = await prisma.lead.findMany({
      where: {
        workspaceId,
        ...(isAdmin ? {} : memberLeadFilter(req.user.id)),
      },
      orderBy: { createdAt: "desc" },
      include: leadInclude,
    });

    return res.status(200).json({ success: true, leads });
  } catch (error) {
    console.error("getAllLeads:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getLead = async (req, res) => {
  try {
    const lead = await assertLeadVisible(req, res, req.params.leadId);
    if (!lead) return;

    const fullLead = await prisma.lead.findFirst({
      where: {
        id: Number(req.params.leadId),
        workspaceId: req.workspace.id,
      },
      include: leadInclude,
    });

    return res.status(200).json({ success: true, lead: fullLead });
  } catch (error) {
    console.error("getLead:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updateLead = async (req, res) => {
  try {
    const workspaceId = req.workspace.id;
    const leadId = Number(req.params.leadId);

    const existingLead = await findWorkspaceLead(workspaceId, leadId);

    if (!existingLead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    const {
      companyName,
      contactPerson,
      contactEmail,
      contactNumber,
      status,
      notes,
      assignedToIds,
    } = req.body;

    if (status && !LEAD_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    if (assignedToIds !== undefined) {
      if (!Array.isArray(assignedToIds) || assignedToIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "assignedToIds must be a non-empty array",
        });
      }

      const validAssignees = await validateWorkspaceAssignees(
        workspaceId,
        assignedToIds,
      );

      if (!validAssignees) {
        return res.status(400).json({
          success: false,
          message: "Leads can only be assigned to workspace members (not admins)",
        });
      }
    }

    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        ...(companyName !== undefined && { companyName }),
        ...(contactPerson !== undefined && { contactPerson }),
        ...(contactEmail !== undefined && { contactEmail }),
        ...(contactNumber !== undefined && { contactNumber }),
        ...(status !== undefined && { status }),
        ...(notes !== undefined && { notes }),
        ...(assignedToIds !== undefined && {
          assignedTo: {
            set: [],
            connect: assignedToIds.map((id) => ({ id })),
          },
        }),
      },
      include: leadInclude,
    });

    return res.status(200).json({
      success: true,
      message: "Lead updated successfully",
      lead: updatedLead,
    });
  } catch (error) {
    console.error("updateLead:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteLead = async (req, res) => {
  try {
    const existingLead = await findWorkspaceLead(
      req.workspace.id,
      req.params.leadId,
    );

    if (!existingLead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    await prisma.lead.delete({
      where: { id: Number(req.params.leadId) },
    });

    return res.status(200).json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (error) {
    console.error("deleteLead:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
