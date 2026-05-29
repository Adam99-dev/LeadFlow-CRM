import { createContext, useCallback, useContext, useState } from "react";
import toast from "react-hot-toast";
import { useWorkspace } from "./WorkspaceContext";
import { apiRequest } from "../lib/api.js";

const LeadContext = createContext();

export const LEAD_STATUSES = {
  NEW: "NEW",
  CONTACTED: "CONTACTED",
  NEGOTIATION: "NEGOTIATION",
  WON: "WON",
  LOST: "LOST",
};

export const useLead = () => {
  const context = useContext(LeadContext);
  if (!context) {
    throw new Error("useLead must be used within a LeadProvider");
  }
  return context;
};

export const LeadProvider = ({ children }) => {
  const { workspace } = useWorkspace();

  const [leads, setLeads] = useState([]);
  const [currentLead, setCurrentLead] = useState(null);
  const [userLeads, setUserLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const canEditLead = (lead) => {
    return lead?.status !== LEAD_STATUSES.WON && lead?.status !== LEAD_STATUSES.LOST;
  };

  const validateLeadData = (leadData) => {
    const errors = {};
    if (!leadData.companyName?.trim()) errors.companyName = "Company name is required";
    if (!leadData.contactPerson?.trim()) errors.contactPerson = "Contact person is required";
    if (!leadData.contactEmail?.trim()) errors.contactEmail = "Contact email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadData.contactEmail)) {
      errors.contactEmail = "Invalid email format";
    }
    if (!leadData.contactNumber?.trim()) errors.contactNumber = "Contact number is required";
    if (!leadData.assignedToIds?.length) {
      errors.assignedToIds = "Assign at least one workspace member (not admin)";
    }
    return { isValid: Object.keys(errors).length === 0, errors };
  };

  const getAllLeads = async () => {
    if (!workspace?.id) {
      toast.error("Please select a workspace");
      return { success: false, error: "No workspace selected" };
    }

    try {
      setLoading(true);
      setError(null);
      const data = await apiRequest("/api/leads", { workspaceScoped: true });
      setLeads(data.leads);
      return { success: true, leads: data.leads };
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const getLead = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiRequest(`/api/leads/${id}`, { workspaceScoped: true });
      setCurrentLead(data.lead);
      return { success: true, lead: data.lead };
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const createLead = async (leadData) => {
    if (!workspace?.id) {
      toast.error("Please select a workspace");
      return { success: false, error: "No workspace selected" };
    }

    try {
      setLoading(true);
      setError(null);
      const validation = validateLeadData(leadData);
      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors)[0]);
      }

      const data = await apiRequest("/api/leads", {
        method: "POST",
        body: leadData,
        workspaceScoped: true,
      });

      setLeads((prev) => [data.lead, ...prev]);
      toast.success("Lead created successfully");
      return { success: true, lead: data.lead };
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateLead = async (id, leadData, options = {}) => {
    if (!workspace?.id) {
      toast.error("Please select a workspace");
      return { success: false, error: "No workspace selected" };
    }

    const currentLeadData = leads.find((lead) => lead.id === id);
    if (currentLeadData && !canEditLead(currentLeadData)) {
      const errorMsg = `${currentLeadData.status} leads cannot be edited`;
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      setLoading(true);
      setError(null);

      if (!options.partial) {
        const validation = validateLeadData(leadData);
        if (!validation.isValid) {
          throw new Error(Object.values(validation.errors)[0]);
        }
      }

      const data = await apiRequest(`/api/leads/${id}`, {
        method: "PATCH",
        body: leadData,
        workspaceScoped: true,
      });

      const updated = data.lead;
      setLeads((prev) => prev.map((lead) => (lead.id === id ? updated : lead)));
      if (currentLead?.id === id) setCurrentLead(updated);

      toast.success("Lead updated successfully");
      return { success: true, lead: updated, updatedLead: updated };
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (id, status) => {
    return updateLead(id, { status }, { partial: true });
  };

  const deleteLead = async (id) => {
    if (!workspace?.id) {
      toast.error("Please select a workspace");
      return { success: false, error: "No workspace selected" };
    }

    try {
      setLoading(true);
      setError(null);
      await apiRequest(`/api/leads/${id}`, {
        method: "DELETE",
        workspaceScoped: true,
      });

      setLeads((prev) => prev.filter((lead) => lead.id !== id));
      setUserLeads((prev) => prev.filter((lead) => lead.id !== id));
      if (currentLead?.id === id) setCurrentLead(null);

      toast.success("Lead deleted successfully");
      return { success: true };
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const getUserLeads = async () => {
    const result = await getAllLeads();
    if (result.success) setUserLeads(result.leads);
    return result;
  };

  const leadStatuses = [
    { value: LEAD_STATUSES.NEW, label: "New", color: "#3B82F6" },
    { value: LEAD_STATUSES.CONTACTED, label: "Contacted", color: "#F59E0B" },
    { value: LEAD_STATUSES.NEGOTIATION, label: "Negotiation", color: "#8B5CF6" },
    { value: LEAD_STATUSES.WON, label: "Won", color: "#10B981" },
    { value: LEAD_STATUSES.LOST, label: "Lost", color: "#EF4444" },
  ];

  return (
    <LeadContext.Provider
      value={{
        leads,
        currentLead,
        userLeads,
        loading,
        error,
        leadStatuses,
        LEAD_STATUSES,
        getAllLeads,
        getLead,
        createLead,
        updateLead,
        updateLeadStatus,
        deleteLead,
        getUserLeads,
        clearError: () => setError(null),
        resetState: () => {
          setLeads([]);
          setCurrentLead(null);
          setUserLeads([]);
          setError(null);
          setLoading(false);
        },
        canEditLead,
      }}
    >
      {children}
    </LeadContext.Provider>
  );
};

export default LeadContext;
