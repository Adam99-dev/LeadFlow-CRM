import prisma from "../config/db.js";

export async function findWorkspaceLead(workspaceId, leadId) {
  return prisma.lead.findFirst({
    where: {
      id: Number(leadId),
      workspaceId,
    },
    include: {
      assignedTo: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}

export function isUserAssignedToLead(lead, userId) {
  return lead.assignedTo.some((user) => user.id === userId);
}

export async function assertLeadVisible(req, res, leadId) {
  const lead = await findWorkspaceLead(req.workspace.id, leadId);

  if (!lead) {
    res.status(404).json({ success: false, message: "Lead not found" });
    return null;
  }

  if (req.membership.role === "ADMIN") {
    return lead;
  }

  if (!isUserAssignedToLead(lead, req.user.id)) {
    res.status(403).json({ success: false, message: "Access denied" });
    return null;
  }

  return lead;
}

export function memberLeadFilter(userId) {
  return {
    assignedTo: {
      some: { id: userId },
    },
  };
}

export function memberTaskFilter(userId) {
  return {
    lead: {
      assignedTo: {
        some: { id: userId },
      },
    },
  };
}
