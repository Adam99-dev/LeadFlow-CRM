import { useState, useEffect } from "react";
import {
  Plus,
  LogIn,
  ChevronRight,
  X,
  Copy,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useWorkspace } from "../context/WorkspaceContext";
import { useNavigate } from "react-router-dom";
import { FullPageLoader } from "../components/ui/Loader";

const WorkspacePage = () => {
  const navigate = useNavigate();
  const {
    workspace: currentWorkspace,
    workspaces,
    loading,
    switchWorkspace,
    createWorkspace,
    joinWorkspace,
  } = useWorkspace();

  const [joinCode, setJoinCode] = useState("");
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [createModal, setCreateModal] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!workspaceName.trim()) {
      toast.error("Workspace name is required");
      return;
    }

    try {
      const data = await createWorkspace(workspaceName.trim());
      toast.success("Workspace created successfully");
      setCreateModal(false);
      setWorkspaceName("");
      if (data.workspace) {
        navigate(`/workspace/${data.workspace.id}/dashboard`);
      }
    } catch (error) {
      toast.error(error.message || "Failed to create workspace");
    }
  };

  const handleJoinWorkspace = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      toast.error("Please enter a join code");
      return;
    }

    try {
      const data = await joinWorkspace(joinCode);
      toast.success("Successfully joined workspace");
      setShowJoinModal(false);
      setJoinCode("");
      if (data.workspace) {
        navigate(`/workspace/${data.workspace.id}/dashboard`);
      }
    } catch (error) {
      toast.error(error.message || "Failed to join workspace");
    }
  };

  const handleOpenWorkspace = (ws) => {
    switchWorkspace(ws);
    toast.success(`Opening ${ws.name}...`);
    navigate(`/workspace/${ws.id}/dashboard`);
  };

  const copyJoinCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Join code copied");
  };

  const filteredWorkspaces = workspaces.filter(
    (ws) =>
      ws.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ws.slug?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getRoleBadgeColor = (role) =>
    role === "ADMIN"
      ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
      : "bg-blue-500/20 text-blue-400 border-blue-500/30";

  useEffect(() => {
    if (!currentWorkspace && workspaces.length > 0 && !loading) {
      // optional: auto-select first workspace
    }
  }, [currentWorkspace, workspaces, loading]);

  if (loading) {
    return <FullPageLoader label="Loading workspaces..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#040a18] via-[#0a0f2a] to-[#040a18]">
      <Toaster position="top-right" />

      {createModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0f2a] border border-white/10 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Create Workspace</h3>
              <button type="button" onClick={() => setCreateModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateWorkspace}>
              <label className="text-sm text-blue-200 mb-2 block">Workspace Name</label>
              <input
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="Acme Sales"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 mb-6"
                required
              />
              <p className="text-xs text-gray-400 mb-4">
                Slug and join code are generated automatically. You will be the admin.
              </p>
              <div className="flex gap-3">
                <button type="button" onClick={() => setCreateModal(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white hover:bg-white/5">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showJoinModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0f2a] border border-white/10 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Join a Workspace</h3>
              <button type="button" onClick={() => setShowJoinModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleJoinWorkspace}>
              <label className="text-sm text-blue-200 mb-2 block">Join Code</label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="Enter join code from your admin"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 mb-6 uppercase"
                autoFocus
                required
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowJoinModal(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white hover:bg-white/5">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold">
                  Join
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 mt-40">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">My Workspaces</h1>
            <p className="text-blue-300">Manage and collaborate across all your workspaces</p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowJoinModal(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-blue-500/50 text-blue-400 hover:bg-blue-500/10">
              <LogIn className="w-4 h-4" /> Join Workspace
            </button>
            <button type="button" onClick={() => setCreateModal(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/30">
              <Plus className="w-4 h-4" /> New Workspace
            </button>
          </div>
        </div>

        <input
          type="text"
          placeholder="Search workspaces..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-96 bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 mb-8"
        />

        {filteredWorkspaces.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
            
            <p className="text-gray-400 mb-4">No workspaces yet</p>
            <button type="button" onClick={() => setCreateModal(true)} className="px-4 py-2 rounded-lg bg-blue-600 text-white">
              Create your first workspace
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredWorkspaces.map((ws) => (
              <div
                key={ws.id}
                className={`bg-white/5 rounded-2xl border p-6 ${
                  currentWorkspace?.id === ws.id ? "border-blue-500/50" : "border-white/10"
                }`}
              >
                <div className="flex justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{ws.name}</h3>
                    <p className="text-sm text-gray-400">Slug: {ws.slug}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs border ${getRoleBadgeColor(ws.role)}`}>
                    {ws.role}
                  </span>
                </div>
                {ws.role === "ADMIN" && ws.joinCode && (
                  <button
                    type="button"
                    onClick={() => copyJoinCode(ws.joinCode)}
                    className="mb-4 flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                  >
                    Join code: {ws.joinCode} <Copy className="w-3 h-3" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleOpenWorkspace(ws)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium"
                >
                  Open Workspace <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkspacePage;
