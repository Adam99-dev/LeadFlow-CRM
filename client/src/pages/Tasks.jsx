import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  ListTodo,
  Search,
  RefreshCw,
  Clock,
  PlayCircle,
  CheckCircle2,
  User,
  Building2,
  Flag,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import { PageLoader } from "../components/ui/Loader";
import { useTask } from "../context/TaskContext";
import { useWorkspace } from "../context/WorkspaceContext";
import { useAuth } from "../context/AuthContext";
import { setWorkspaceId } from "../lib/api";

const COLUMNS = [
  {
    id: "PENDING",
    label: "Pending",
    icon: Clock,
    accent: "from-slate-500/20 to-slate-600/10",
    border: "border-slate-500/30",
    badge: "bg-slate-500/20 text-slate-300",
  },
  {
    id: "IN_PROGRESS",
    label: "In Progress",
    icon: PlayCircle,
    accent: "from-amber-500/20 to-orange-600/10",
    border: "border-amber-500/30",
    badge: "bg-amber-500/20 text-amber-300",
  },
  {
    id: "COMPLETED",
    label: "Completed",
    icon: CheckCircle2,
    accent: "from-emerald-500/20 to-green-600/10",
    border: "border-emerald-500/30",
    badge: "bg-emerald-500/20 text-emerald-300",
  },
];

const PRIORITY_STYLES = {
  HIGH: "bg-red-500/20 text-red-400 border-red-500/30",
  MEDIUM: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  LOW: "bg-blue-500/20 text-blue-300 border-blue-500/30",
};

function PriorityBadge({ priority }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${PRIORITY_STYLES[priority] || PRIORITY_STYLES.MEDIUM}`}
    >
      <Flag className="h-3 w-3" />
      {priority}
    </span>
  );
}

function TaskCard({
  task,
  workspaceId,
  isAdmin,
  userId,
  onStatusChange,
  updatingId,
}) {
  const canEdit = isAdmin || task.assignedToId === userId;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-white/10 bg-[#0a0f2a]/80 p-4 shadow-lg hover:border-white/20 transition-colors"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <h4 className="font-semibold text-white text-sm leading-snug">
          {task.title}
        </h4>
        <PriorityBadge priority={task.priority} />
      </div>

      {task.description && (
        <p className="mb-3 text-xs text-gray-400 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="mb-3 space-y-1.5 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <Building2 className="h-3.5 w-3.5 shrink-0 text-blue-400" />
          {task.lead ? (
            <Link
              to={`/workspace/${workspaceId}/leads/${task.leadId}`}
              className="text-blue-300 hover:text-blue-200 hover:underline truncate"
            >
              {task.lead.companyName}
            </Link>
          ) : (
            <span>Lead #{task.leadId}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <User className="h-3.5 w-3.5 shrink-0 text-purple-400" />
          <span className="truncate">
            {task.assignedTo?.name || "Unassigned"}
          </span>
        </div>
      </div>

      {canEdit ? (
        <div className="relative">
          <select
            value={task.status}
            disabled={updatingId === task.id}
            onChange={(e) => onStatusChange(task.id, e.target.value)}
            className="w-full appearance-none rounded-lg border border-white/10 bg-white/5 py-2 pl-3 pr-8 text-xs text-white focus:border-blue-500 focus:outline-none disabled:opacity-50"
          >
            {COLUMNS.map((col) => (
              <option key={col.id} value={col.id} className="bg-gray-900">
                {col.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
      ) : (
        <p className="text-xs text-gray-500">View only</p>
      )}
    </motion.div>
  );
}

function KanbanColumn({ column, tasks, ...cardProps }) {
  const Icon = column.icon;

  return (
    <div
      className={`flex min-h-[420px] flex-col rounded-2xl border bg-gradient-to-b ${column.accent} ${column.border} backdrop-blur-xl`}
    >
      <div className="flex items-center justify-between border-b border-white/10 p-4">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-white" />
          <h3 className="font-semibold text-white">{column.label}</h3>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${column.badge}`}
        >
          {tasks.length}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3 max-h-[calc(100vh-320px)] [&::-webkit-scrollbar]:hidden">
        {tasks.length === 0 ? (
          <p className="py-8 text-center text-xs text-gray-500">No tasks</p>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} {...cardProps} />
          ))
        )}
      </div>
    </div>
  );
}

export default function Tasks() {
  const { id: routeWorkspaceId } = useParams();
  const { user } = useAuth();
  const { workspace, loading: workspaceLoading } = useWorkspace();
  const { 
    tasks, 
    loading, 
    error, 
    getTaskByUserId,
    updateTaskStatus 
  } = useTask();
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const isAdmin = workspace?.role === "ADMIN";
  const workspaceId = workspace?.id || routeWorkspaceId;

  const loadUserTasks = useCallback(async (showRefresh = false) => {
    if (!workspaceId || !user?.id) return;
    if (showRefresh) setRefreshing(true);

    try {
      setWorkspaceId(workspaceId);
      const result = await getTaskByUserId(user.id);

      if (!result.success) {
        toast.error(result.message || "Failed to load tasks");
      }
    } finally {
      if (showRefresh) setRefreshing(false);
    }
  }, [getTaskByUserId, user?.id, workspaceId]);

  useEffect(() => {
    if (workspaceId && user?.id) {
      loadUserTasks();
    }
  }, [loadUserTasks, workspaceId, user?.id]);

  // Filter tasks based on search term
  const filteredTasks = useMemo(() => {
    if (!searchTerm.trim()) return tasks;
    const q = searchTerm.toLowerCase();
    return tasks.filter(
      (t) =>
        t.title?.toLowerCase().includes(q) ||
        t.lead?.companyName?.toLowerCase().includes(q) ||
        t.assignedTo?.name?.toLowerCase().includes(q),
    );
  }, [tasks, searchTerm]);

  // Group tasks by status for Kanban view
  const tasksByStatus = useMemo(() => {
    const grouped = { PENDING: [], IN_PROGRESS: [], COMPLETED: [] };
    filteredTasks.forEach((task) => {
      if (grouped[task.status]) grouped[task.status].push(task);
    });
    return grouped;
  }, [filteredTasks]);

  // Calculate statistics
  const stats = useMemo(
    () => ({
      total: tasks.length,
      pending: tasks.filter((t) => t.status === "PENDING").length,
      inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
      completed: tasks.filter((t) => t.status === "COMPLETED").length,
    }),
    [tasks],
  );

  // Handle status change for a task
  const handleStatusChange = async (taskId, status) => {
    setUpdatingId(taskId);
    try {
      const result = await updateTaskStatus(taskId, status);
      if (result.success) {
        toast.success("Task status updated");
        // Refresh tasks to get updated list
        await loadUserTasks();
      } else {
        toast.error(result.message || "Failed to update status");
      }
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  if (workspaceLoading && !workspaceId) {
    return (
      <div className="flex h-screen bg-[#040a18]">
        <Sidebar />
        <div className="ml-64 flex flex-1 items-center justify-center p-6">
          <PageLoader label="Loading workspace..." />
        </div>
      </div>
    );
  }

  if (!workspaceId) {
    return (
      <div className="flex h-screen bg-[#040a18]">
        <Sidebar />
        <div className="ml-64 flex flex-1 items-center justify-center p-6">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-3 h-12 w-12 text-amber-400" />
            <p className="text-white font-medium">Select a workspace</p>
            <p className="text-gray-400 text-sm mt-1">
              Open a workspace to view tasks
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#040a18]">
      <Sidebar />

      <div className="ml-64 flex-1 overflow-y-auto h-screen [&::-webkit-scrollbar]:hidden">
        <div className="p-6">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-wrap items-center justify-between gap-4"
          >
            <div>
              <h1 className="mb-2 flex items-center gap-2 text-3xl font-bold text-white">
                Tasks Assigned to You
              </h1>
              <p className="text-gray-400">
                Manage and track tasks assigned to you from your leads
              </p>
            </div>
            <button
              type="button"
              onClick={() => loadUserTasks(true)}
              disabled={refreshing || loading}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-gray-300 transition hover:bg-white/10 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </motion.div>

          {/* Statistics Cards */}
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              {
                label: "Total Tasks",
                value: stats.total,
                icon: ListTodo,
                color: "text-blue-400",
              },
              {
                label: "Pending",
                value: stats.pending,
                icon: Clock,
                color: "text-slate-300",
              },
              {
                label: "In Progress",
                value: stats.inProgress,
                icon: PlayCircle,
                color: "text-amber-300",
              },
              {
                label: "Completed",
                value: stats.completed,
                icon: CheckCircle2,
                color: "text-emerald-300",
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 p-4 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">{stat.label}</p>
                    <p className="mt-1 text-2xl font-bold text-white">
                      {stat.value}
                    </p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Search Bar */}
          <div className="mb-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 p-4 backdrop-blur-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks, leads, or assignees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Tasks Kanban Board */}
          {loading && !tasks.length ? (
            <PageLoader label="Loading your tasks..." />
          ) : filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 py-20">
              <ListTodo className="mb-4 h-14 w-14 text-gray-600" />
              <h3 className="text-lg font-semibold text-white">
                No tasks assigned to you
              </h3>
              <p className="mt-1 text-sm text-gray-400">
                {searchTerm
                  ? "Try a different search"
                  : "Tasks assigned to you will appear here"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              {COLUMNS.map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  tasks={tasksByStatus[column.id]}
                  workspaceId={workspaceId}
                  isAdmin={isAdmin}
                  userId={user?.id}
                  onStatusChange={handleStatusChange}
                  updatingId={updatingId}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
