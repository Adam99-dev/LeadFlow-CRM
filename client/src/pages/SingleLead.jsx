import { useCallback, useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Users,
  PlusCircle,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Calendar,
  Flag,
  MoreVertical,
  Zap,
  Target,
  Layers,
  User,
  ChevronDown,
  Loader2,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import { PageLoader } from "../components/ui/Loader";
import { useLead } from "../context/LeadContext";
import { useTask } from "../context/TaskContext";
import { setWorkspaceId } from "../lib/api";
import toast from "react-hot-toast";

// Custom Assigned To Dropdown Component
const AssignedToSelect = ({ value, onChange, employees, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedEmployee = employees?.find((emp) => emp.id === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 flex items-center justify-between hover:bg-white/8"
      >
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-blue-400" />
          <span className="text-gray-300">
            {selectedEmployee ? selectedEmployee.name : "Select assignee"}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-[#0f1729] border border-white/10 rounded-xl overflow-hidden shadow-2xl animate-fadeIn">
          <div className="max-h-48 overflow-y-auto custom-scrollbar">
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2.5 flex items-center gap-2 hover:bg-white/10 transition-all duration-150 text-left group"
            >
              <div className="p-1 rounded-lg bg-gray-400/10">
                <User className="w-4 h-4 text-gray-400" />
              </div>
              <span className="text-gray-400 flex-1">Unassigned</span>
              {!value && (
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
              )}
            </button>

            {employees?.map((employee) => (
              <button
                key={employee.id}
                type="button"
                onClick={() => {
                  onChange(employee.id);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2.5 flex items-center gap-2 hover:bg-white/10 transition-all duration-150 text-left group ${
                  value === employee.id ? "bg-white/5" : ""
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  <span className="text-xs font-medium text-white">
                    {employee.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-white flex-1">{employee.name}</span>
                {value === employee.id && (
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SingleLead = () => {
  const { workspaceId, leadId } = useParams();
  const { currentLead, getLead, loading: leadLoading } = useLead();
  const {
    getLeadTasks,
    tasks,
    createTask,
    updateTaskStatus,
    deleteTask,
    loading: taskLoading,
  } = useTask();

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    dueDate: "",
    status: "PENDING",
    assignedToId: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [showMenuForTask, setShowMenuForTask] = useState(null);
  const [hoveredTask, setHoveredTask] = useState(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const leadTasks = tasks.filter((t) => t.leadId === parseInt(leadId, 10));

  const loadLeadData = useCallback(async () => {
    if (!workspaceId || !leadId) return;

    setWorkspaceId(workspaceId);
    setInitialLoadComplete(false);

    const [leadResult, taskResult] = await Promise.all([
      getLead(leadId),
      getLeadTasks(leadId),
    ]);

    if (!leadResult.success) {
      toast.error(leadResult.error || "Failed to load lead");
    }
    if (!taskResult.success) {
      toast.error(taskResult.message || "Failed to load lead tasks");
    }

    setInitialLoadComplete(true);
  }, [getLead, getLeadTasks, leadId, workspaceId]);

  useEffect(() => {
    loadLeadData();
  }, [loadLeadData]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) {
      toast.error("Task title is required");
      return;
    }

    if (!taskForm.assignedToId) {
      toast.error("Please assign the task to a team member");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createTask({
        ...taskForm,
        leadId: parseInt(leadId, 10),
      });

      if (result.success) {
        toast.success("Task created successfully");
        setShowTaskModal(false);
        resetTaskForm();
        await getLeadTasks(leadId);
      }
    } catch {
      toast.error("Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    const result = await updateTaskStatus(taskId, newStatus);
    if (result.success) {
      toast.success("Task status updated");
      await getLeadTasks(leadId);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      const result = await deleteTask(taskId);
      if (result.success) {
        toast.success("Task deleted successfully");
        await getLeadTasks(leadId);
      }
      setShowMenuForTask(null);
    }
  };

  const resetTaskForm = () => {
    setTaskForm({
      title: "",
      description: "",
      priority: "MEDIUM",
      dueDate: "",
      status: "PENDING",
      assignedToId: null,
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "HIGH":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      case "MEDIUM":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "LOW":
        return "text-green-400 bg-green-400/10 border-green-400/20";
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case "IN_PROGRESS":
        return <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />;
      case "PENDING":
        return <AlertCircle className="h-5 w-5 text-yellow-400" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusOptions = () => {
    return [
      {
        value: "PENDING",
        label: "Pending",
        color: "text-yellow-400",
        icon: AlertCircle,
      },
      {
        value: "IN_PROGRESS",
        label: "In Progress",
        color: "text-blue-400",
        icon: Loader2,
      },
      {
        value: "COMPLETED",
        label: "Completed",
        color: "text-green-400",
        icon: CheckCircle,
      },
    ];
  };

  if (leadLoading || (!initialLoadComplete && !currentLead)) {
    return (
      <div className="flex h-screen bg-[#040a18]">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <PageLoader label="Loading lead..." />
        </div>
      </div>
    );
  }

  if (!currentLead) {
    return (
      <div className="flex h-screen bg-[#040a18]">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center p-6">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-3 h-12 w-12 text-amber-400" />
            <p className="text-white font-medium">Lead not found</p>
            <Link
              to={`/workspace/${workspaceId}/leads`}
              className="mt-3 inline-flex text-sm text-blue-400 hover:text-blue-300"
            >
              Back to leads
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#040a18]">
      <Sidebar />
      <div className="flex-1 overflow-y-auto ml-64 p-6">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Header with breadcrumb */}
        <div className="relative mb-8">
          <Link
            to={`/workspace/${workspaceId}/leads`}
            className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-all duration-300 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to leads
          </Link>

          <div className="mt-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Lead Details
                </h1>
              </div>
              <p className="text-gray-400 mt-1">
                Manage lead information and associated tasks
              </p>
            </div>
          </div>
        </div>

        {!leadLoading && currentLead && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
            {/* Lead Information Card - Enhanced */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl overflow-hidden shadow-2xl">
                <div className="p-6">
                  {/* Avatar and name section */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
                          <span className="text-2xl font-bold text-white">
                            {currentLead.contactPerson?.charAt(0) || "?"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h1 className="text-xl font-bold text-white">
                          {currentLead.contactPerson}
                        </h1>
                        <p className="flex items-center gap-1 text-sm text-gray-400">
                          <Building2 className="h-3 w-3" />
                          {currentLead.companyName}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border backdrop-blur-sm
                      ${
                        currentLead.status === "WON"
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : currentLead.status === "LOST"
                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                            : currentLead.status === "NEGOTIATION"
                              ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                              : currentLead.status === "CONTACTED"
                                ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      }`}
                    >
                      <Target className="h-3 w-3" />
                      {currentLead.status}
                    </div>
                  </div>

                  {/* Contact details */}
                  <div className="space-y-4 mt-6">
                    <div className="group p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300">
                      <p className="text-xs text-gray-500 mb-1">
                        Email Address
                      </p>
                      <a
                        href={`mailto:${currentLead.contactEmail}`}
                        className="flex items-center gap-2 text-gray-300 hover:text-blue-400 transition-colors"
                      >
                        <Mail className="h-4 w-4 text-blue-400" />
                        <span className="text-sm">
                          {currentLead.contactEmail}
                        </span>
                      </a>
                    </div>

                    <div className="group p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300">
                      <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                      <a
                        href={`tel:${currentLead.contactNumber}`}
                        className="flex items-center gap-2 text-gray-300 hover:text-green-400 transition-colors"
                      >
                        <Phone className="h-4 w-4 text-green-400" />
                        <span className="text-sm">
                          {currentLead.contactNumber}
                        </span>
                      </a>
                    </div>

                    <div className="group p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300">
                      <p className="text-xs text-gray-500 mb-1">Assigned To</p>
                      <div className="flex items-start gap-2">
                        <Users className="mt-0.5 h-4 w-4 shrink-0 text-purple-400" />
                        <div className="flex flex-wrap gap-1">
                          {currentLead.assignedTo?.map((u, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 text-xs text-gray-300"
                            >
                              {u.name}
                            </span>
                          )) || (
                            <span className="text-sm text-gray-400">
                              Unassigned
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick stats */}
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 rounded-xl bg-white/5">
                        <p className="text-2xl font-bold text-white">
                          {leadTasks.length}
                        </p>
                        <p className="text-xs text-gray-500">Total Tasks</p>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-white/5">
                        <p className="text-2xl font-bold text-green-400">
                          {
                            leadTasks.filter((t) => t.status === "COMPLETED")
                              .length
                          }
                        </p>
                        <p className="text-xs text-gray-500">Completed</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tasks Section - Enhanced */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl overflow-hidden shadow-2xl">
                {/* Tasks Header */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Layers className="h-5 w-5 text-blue-400" />
                        <h2 className="text-xl font-semibold text-white">
                          Tasks & Activities
                        </h2>
                      </div>
                      <p className="text-sm text-gray-400">
                        {leadTasks.length} task
                        {leadTasks.length !== 1 ? "s" : ""} •
                        {
                          leadTasks.filter((t) => t.status === "COMPLETED")
                            .length
                        }{" "}
                        completed •
                        {
                          leadTasks.filter((t) => t.status === "IN_PROGRESS")
                            .length
                        }{" "}
                        in progress
                      </p>
                    </div>

                    <button
                      onClick={() => setShowTaskModal(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl transition-all duration-300 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 transform hover:scale-105"
                    >
                      <PlusCircle className="h-4 w-4" />
                      Create Task
                    </button>
                  </div>
                </div>

                {/* Tasks List */}
                <div className="p-6">
                  {taskLoading ? (
                    <div className="flex justify-center py-16">
                      <div className="relative">
                        <div className="w-12 h-12 border-3 border-white/20 border-t-blue-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-6 h-6 bg-blue-500/20 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                      <p className="text-gray-400 mt-4 ml-5">
                        Loading tasks...
                      </p>
                    </div>
                  ) : leadTasks.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 mb-4 border border-white/10">
                        <CheckCircle className="h-10 w-10 text-gray-500" />
                      </div>
                      <p className="text-gray-400 font-medium">No tasks yet</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Create your first task to get started
                      </p>
                      <button
                        onClick={() => setShowTaskModal(true)}
                        className="mt-4 inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm transition-colors"
                      >
                        Create your first task
                        <ArrowLeft className="h-3 w-3 rotate-180" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {leadTasks.map((task, index) => (
                        <div
                          key={task.id}
                          onMouseEnter={() => setHoveredTask(task.id)}
                          onMouseLeave={() => setHoveredTask(null)}
                          className="group bg-white/5 rounded-xl transition-all duration-300 border border-white/5 hover:border-white/20 hover:bg-white/10 hover:translate-x-1 relative animate-fadeInUp"
                          style={{
                            animationDelay: `${index * 50}ms`,
                          }}
                        >
                          <div className="p-4">
                            <div className="flex items-start gap-4">
                              {/* Status Checkbox - Animated */}
                              <button
                                onClick={() =>
                                  handleUpdateTaskStatus(
                                    task.id,
                                    task.status === "COMPLETED"
                                      ? "PENDING"
                                      : "COMPLETED",
                                  )
                                }
                                className="relative mt-0.5 group/btn"
                              >
                                <div
                                  className={`absolute inset-0 rounded-full transition-transform duration-300 scale-0 group-hover/btn:scale-100 ${task.status === "COMPLETED" ? "bg-green-500/20" : "bg-white/10"}`}
                                ></div>
                                {getStatusIcon(task.status)}
                              </button>

                              {/* Task Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 flex-wrap mb-2">
                                  <h3
                                    className={`text-white font-medium transition-all duration-300 ${task.status === "COMPLETED" ? "line-through text-gray-500" : ""}`}
                                  >
                                    {task.title}
                                  </h3>
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}
                                  >
                                    <Flag className="h-3 w-3" />
                                    {task.priority}
                                  </span>
                                </div>

                                {task.description && (
                                  <p
                                    className={`text-sm text-gray-400 mb-3 transition-all duration-300 ${task.status === "COMPLETED" ? "line-through text-gray-500" : ""}`}
                                  >
                                    {task.description}
                                  </p>
                                )}

                                {task.dueDate && (
                                  <div className="flex items-center gap-2 text-xs">
                                    <Calendar className="h-3.5 w-3.5 text-gray-500" />
                                    <span
                                      className={`${new Date(task.dueDate) < new Date() && task.status !== "COMPLETED" ? "text-red-400" : "text-gray-500"}`}
                                    >
                                      Due:{" "}
                                      {new Date(
                                        task.dueDate,
                                      ).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })}
                                    </span>
                                    {new Date(task.dueDate) < new Date() &&
                                      task.status !== "COMPLETED" && (
                                        <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded text-[10px] font-medium">
                                          Overdue
                                        </span>
                                      )}
                                  </div>
                                )}

                                {/* Show assigned to in task */}
                                {task.assignedTo && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                                      <span className="text-[10px] font-medium text-white">
                                        {task.assignedTo.name
                                          ?.charAt(0)
                                          .toUpperCase()}
                                      </span>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                      Assigned to: {task.assignedTo.name}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* More Actions Menu - Styled */}
                              <div className="relative">
                                <button
                                  onClick={() =>
                                    setShowMenuForTask(
                                      showMenuForTask === task.id
                                        ? null
                                        : task.id,
                                    )
                                  }
                                  className={`p-2 rounded-lg transition-all duration-300 ${hoveredTask === task.id ? "bg-white/10" : ""}`}
                                >
                                  <MoreVertical
                                    className={`h-4 w-4 transition-colors duration-300 ${hoveredTask === task.id ? "text-white" : "text-gray-500"}`}
                                  />
                                </button>

                                {showMenuForTask === task.id && (
                                  <div className="absolute right-0 mt-2 w-52 bg-[#0a1225] border border-white/10 rounded-xl shadow-2xl z-10 overflow-hidden animate-fadeIn">
                                    <div className="py-2">
                                      <div className="px-4 py-2 text-xs text-gray-500 border-b border-white/10 flex items-center gap-2">
                                        <Zap className="h-3 w-3" />
                                        Change Status
                                      </div>
                                      {getStatusOptions().map((status) => (
                                        <button
                                          key={status.value}
                                          onClick={() => {
                                            handleUpdateTaskStatus(
                                              task.id,
                                              status.value,
                                            );
                                            setShowMenuForTask(null);
                                          }}
                                          className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/10 transition-all duration-200 flex items-center gap-3 ${status.color} ${task.status === status.value ? "bg-white/5" : ""}`}
                                        >
                                          <status.icon className="h-4 w-4" />
                                          {status.label}
                                          {task.status === status.value && (
                                            <CheckCircle className="h-3 w-3 ml-auto" />
                                          )}
                                        </button>
                                      ))}
                                      <div className="border-t border-white/10 mt-2 pt-2">
                                        <button
                                          onClick={() =>
                                            handleDeleteTask(task.id)
                                          }
                                          className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-white/10 transition-all duration-200 flex items-center gap-3"
                                        >
                                          <X className="h-4 w-4" />
                                          Delete Task
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Progress indicator for completed tasks */}
                          {task.status === "COMPLETED" && (
                            <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-b-xl animate-slideIn"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Task Modal - With Assigned To Field */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md transform transition-all duration-300 animate-scaleUp">
            <div className="rounded-2xl bg-gradient-to-br from-[#0a1225] to-[#040a18] border border-white/20 shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl">
                    <PlusCircle className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      Create New Task
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Add a task to track progress
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowTaskModal(false);
                    resetTaskForm();
                  }}
                  className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200 group"
                >
                  <X className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleCreateTask} className="p-6 space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Task Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={taskForm.title}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, title: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                    placeholder="Enter task title"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={taskForm.description}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, description: e.target.value })
                    }
                    rows="3"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 resize-none"
                    placeholder="Enter task description (optional)"
                  />
                </div>

                {/* Priority and Due Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={taskForm.priority}
                      onChange={(e) =>
                        setTaskForm({ ...taskForm, priority: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 cursor-pointer appearance-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 1rem center",
                        backgroundSize: "1rem",
                      }}
                    >
                      <option value="LOW">🟢 Low</option>
                      <option value="MEDIUM">🟡 Medium</option>
                      <option value="HIGH">🔴 High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Due Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input
                        type="date"
                        value={taskForm.dueDate}
                        onChange={(e) =>
                          setTaskForm({ ...taskForm, dueDate: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 [color-scheme:dark]"
                      />
                    </div>
                  </div>
                </div>

                {/* Assigned To - New Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <span className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-blue-400" />
                      Assign To
                    </span>
                  </label>
                  <AssignedToSelect
                    value={taskForm.assignedToId}
                    onChange={(value) =>
                      setTaskForm({ ...taskForm, assignedToId: value })
                    }
                    employees={currentLead?.assignedTo || []}
                  />
                  {currentLead?.assignedTo?.length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      No team members assigned to this lead yet
                    </p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={taskForm.status}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, status: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 cursor-pointer appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 1rem center",
                      backgroundSize: "1rem",
                    }}
                  >
                    <option value="PENDING">⏳ Pending</option>
                    <option value="IN_PROGRESS">🔄 In Progress</option>
                    <option value="COMPLETED">✅ Completed</option>
                  </select>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTaskModal(false);
                      resetTaskForm();
                    }}
                    className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-all duration-200 font-medium border border-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed font-medium relative overflow-hidden group"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Creating...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <PlusCircle className="w-4 h-4" />
                        Create Task
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleLead;
