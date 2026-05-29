import { useState } from "react";
import {
  BarChart3,
  FileText,
  Calendar,
  MessageSquare,
  Settings,
  LogOut,
  Sparkles,
  ChevronRight,
  House,
  SquareCheck,
  Users,
  Headset,
} from "lucide-react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useWorkspace } from "../context/WorkspaceContext.jsx";
import logoImage from "../../public/LeadFlow.png";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { workspaceId: urlWorkspaceId } = useParams();
  const { user, logout } = useAuth();
  const { workspace, workspaces, switchWorkspace } = useWorkspace();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Get workspaceId from context first, fallback to URL params
  const workspaceId = workspace?.id || urlWorkspaceId;

  const navItems = [
    {
      name: "Dashboard",
      icon: House,
      path: "dashboard",
      requiresUpgrade: false,
    },
    { name: "Leads", icon: Headset, path: "leads", requiresUpgrade: false },
    { name: "Tasks", icon: SquareCheck, path: "tasks", requiresUpgrade: false },
    {
      name: "Employees",
      icon: Users,
      path: "employees",
      requiresUpgrade: false,
    },
    {
      name: "Analytics",
      icon: BarChart3,
      path: "analytics",
      requiresUpgrade: true,
    },
    { name: "Reports", icon: FileText, path: "reports", requiresUpgrade: true },
    {
      name: "Calendar",
      icon: Calendar,
      path: "calendar",
      requiresUpgrade: true,
    },
    {
      name: "Messages",
      icon: MessageSquare,
      path: "messages",
      requiresUpgrade: true,
    },
    {
      name: "Settings",
      icon: Settings,
      path: "settings",
      requiresUpgrade: false,
    },
  ];

  // Get current path segment after workspaceId
  const getCurrentPathSegment = () => {
    const pathParts = location.pathname.split("/");
    const workspaceIndex = pathParts.findIndex((part) => part === workspaceId);
    if (workspaceIndex !== -1 && pathParts.length > workspaceIndex + 1) {
      return pathParts[workspaceIndex + 1];
    }
    return "";
  };

  const currentSegment = getCurrentPathSegment();

  // Update active state based on current path segment
  const updatedNavItems = navItems.map((item) => ({
    ...item,
    active:
      currentSegment === item.path ||
      (currentSegment === "" && item.path === "dashboard"),
  }));

  const handleNavigation = (path) => {
    if (!workspaceId) {
      console.error("No workspace ID available for navigation");
      return;
    }
    navigate(`/workspace/${workspaceId}/${path}`);
  };

  const handleUpgradeClick = () => {
    if (workspaceId) {
      navigate(`/workspace/${workspaceId}/upgrade`);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const result = await logout();
    if (result.success) {
      setTimeout(() => {
        navigate("/auth");
        window.location.reload();
      }, 1500);
    }
    setIsLoggingOut(false);
  };

  if (!workspaceId) {
    return (
      <aside className="w-64 h-screen bg-[#040a18] flex flex-col fixed left-0 top-0">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-4">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-400 text-sm">Loading workspace...</p>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 h-screen bg-[#040a18] flex flex-col fixed left-0 top-0">
      {/* Logo Space */}
      <button
        onClick={() => handleNavigation("dashboard")}
        className="cursor-pointer"
      >
        <div className="pt-6 pb-4 px-4 border-b border-blue-900/30">
          <div className="flex items-center justify-center gap-2">
            <img src={logoImage} alt="LeadFlow Logo" />
          </div>
        </div>
      </button>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-4 overflow-y-auto">
        <ul className="space-y-1.5">
          {updatedNavItems.map((item) => (
            <li key={item.name}>
              {!item.requiresUpgrade ? (
                // Free feature - clickable
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    item.active
                      ? "bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg shadow-blue-500/20"
                      : "text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-blue-600/50 hover:to-blue-800/50"
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 ${item.active ? "text-white" : "text-gray-400"}`}
                  />
                  <span className="text-sm font-medium">{item.name}</span>
                </button>
              ) : (
                // Upgrade feature - disabled with upgrade button
                <div className="w-full">
                  <div
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg opacity-60 cursor-not-allowed ${
                      item.active
                        ? "bg-gradient-to-r from-blue-600 to-blue-800 text-white"
                        : "text-gray-400"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm font-medium flex-1 text-left">
                      {item.name}
                    </span>
                    <div className="flex bg-blue-600/30 items-center gap-1 px-2 py-1 rounded">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                      <span className="text-xs text-yellow-500">Upgrade</span>
                    </div>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Quick Workspace Switcher (Optional) */}
      {workspaces.length > 1 && (
        <div className="px-3 mb-2">
          <div className="border-t border-blue-900/30 pt-3">
            <p className="text-gray-400 text-xs mb-2 px-2">Switch Workspace</p>
            <div className="space-y-1">
              {workspaces.slice(0, 3).map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => {
                    switchWorkspace(ws);
                    navigate(`/workspace/${ws.id}/dashboard`);
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${
                    ws.id === workspaceId
                      ? "bg-blue-500/20 text-blue-400"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {ws.name}
                </button>
              ))}
              {workspaces.length > 3 && (
                <button
                  onClick={() => navigate("/workspaces")}
                  className="w-full text-left px-2 py-1.5 rounded text-xs text-blue-400 hover:bg-blue-500/10"
                >
                  View all ({workspaces.length})...
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Section */}
      <div className="px-3 mb-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="text-white text-sm font-medium">Upgrade Plan</span>
          </div>
          <p className="text-white/90 text-xs mb-3">
            Unlock advanced features and analytics.
          </p>
          <button
            onClick={handleUpgradeClick}
            className="w-full flex items-center justify-between bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2.5 transition-all duration-200"
          >
            <span className="text-white text-sm font-medium">Upgrade Now</span>
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Admin User Section */}
      <div className="px-3 pb-6">
        <div className="border-t border-blue-900/30 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-bold">
                  {user?.name?.charAt(0) || "A"}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">
                  {user?.name || "Admin User"}
                </p>
                <p className="text-gray-400 text-xs">{user?.email || ""}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
