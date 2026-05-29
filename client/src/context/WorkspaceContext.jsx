import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";
import { apiRequest, setWorkspaceId } from "../lib/api.js";

const WorkspaceContext = createContext();

export const WorkspaceProvider = ({ children }) => {
  const [workspace, setWorkspace] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const { loading: authLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  const fetchWorkspaces = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/api/workspace");

      if (data.success) {
        setWorkspaces(data.workspaces);

        const storedId = localStorage.getItem("leadflow-workspace-id");
        const selected =
          data.workspaces.find((w) => w.id === storedId) ||
          data.workspaces[0] ||
          null;

        setWorkspace(selected);
        if (selected) setWorkspaceId(selected.id);
      } else {
        setWorkspaces([]);
        setWorkspace(null);
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch workspaces");
      setWorkspaces([]);
      setWorkspace(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMembers = useCallback(async () => {
    if (!workspace?.id || workspace.role !== "ADMIN") {
      setMembers([]);
      return;
    }

    try {
      const data = await apiRequest("/api/workspace/members", {
        workspaceScoped: true,
      });

      if (data.success) {
        setMembers(data.members);
      } else {
        setMembers([]);
      }
    } catch {
      setMembers([]);
    }
  }, [workspace?.id, workspace?.role]);

  const switchWorkspace = (ws) => {
    setWorkspace(ws);
    if (ws?.id) setWorkspaceId(ws.id);
    else setWorkspaceId(null);
  };

  const clearWorkspace = () => {
    setWorkspace(null);
    setWorkspaces([]);
    setMembers([]);
    setWorkspaceId(null);
  };

  const createWorkspace = async (name) => {
    const data = await apiRequest("/api/workspace", {
      method: "POST",
      body: { name },
    });
    await fetchWorkspaces();
    if (data.workspace) switchWorkspace(data.workspace);
    return data;
  };

  const joinWorkspace = async (joinCode) => {
    const data = await apiRequest("/api/workspace/join", {
      method: "POST",
      body: { joinCode: joinCode.trim().toUpperCase() },
    });
    await fetchWorkspaces();
    if (data.workspace) switchWorkspace(data.workspace);
    return data;
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchWorkspaces();
    } else if (!authLoading && !isAuthenticated) {
      clearWorkspace();
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, fetchWorkspaces]);

  useEffect(() => {
    if (workspace?.id) {
      setWorkspaceId(workspace.id);
      fetchMembers();
    }
  }, [workspace?.id, workspace?.role, fetchMembers]);

  useEffect(() => {
    const match = location.pathname.match(/\/workspace\/([^/]+)/);
    if (!match || !workspaces.length) return;
    const ws = workspaces.find((w) => w.id === match[1]);
    if (ws && ws.id !== workspace?.id) {
      setWorkspace(ws);
      setWorkspaceId(ws.id);
    }
  }, [location.pathname, workspaces, workspace?.id]);

  const teamMembers = members.filter((m) => m.role === "MEMBER");

  return (
    <WorkspaceContext.Provider
      value={{
        workspace,
        workspaces,
        members,
        employees: members,
        teamMembers,
        loading,
        setWorkspace,
        switchWorkspace,
        clearWorkspace,
        fetchWorkspaces,
        fetchMembers,
        createWorkspace,
        joinWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }
  return context;
};
