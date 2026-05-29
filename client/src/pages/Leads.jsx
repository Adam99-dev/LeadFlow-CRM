import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  User,
  Building2,
  Calendar,
  Users,
  UserPlus,
  Clock,
  Trophy,
  XCircle,
  Eye,
  Edit2,
  Trash2,
  Download,
  AlertCircle,
  Plus,
  X,
  Mail,
  Phone,
  FileText,
  Tag,
  Save,
  Loader,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageLoader } from "../components/ui/Loader";
import Sidebar from "../components/Sidebar";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { useLead } from "../context/LeadContext";
import { useWorkspace } from "../context/WorkspaceContext";

// Extracted constants for better maintainability
const STATUS_COLORS = {
  NEW: "bg-green-500/20 text-green-400 border-green-500/30",
  CONTACTED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  NEGOTIATION: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  WON: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  LOST: "bg-red-500/20 text-red-400 border-red-500/30",
};

const STATUS_OPTIONS = [
  "All",
  "NEW",
  "CONTACTED",
  "NEGOTIATION",
  "WON",
  "LOST",
];
const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

// Extracted StatCard component
const StatCard = ({ stat, index, onClick }) => {
  const sparklineConfigs = {
    "Total Leads": [850, 1240, 430, 890, 1520, 610, 1245],
    "New Leads": [120, 195, 78, 142, 210, 98, 238],
    "Contacted Leads": [400, 520, 310, 468, 589, 342, 573],
    "Won Leads": [180, 245, 98, 167, 289, 112, 312],
    "Lost Leads": [80, 110, 65, 94, 118, 72, 122],
  };

  const sparklineData =
    sparklineConfigs[stat.title]?.map((value) => ({ value })) || [];

  const areaColor = stat.color.includes("blue")
    ? "#3b82f6"
    : stat.color.includes("green")
      ? "#10b981"
      : stat.color.includes("orange")
        ? "#f59e0b"
        : stat.color.includes("purple")
          ? "#8b5cf6"
          : stat.color.includes("red")
            ? "#ef4444"
            : "#3b82f6";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={() => onClick?.(stat.title)}
      className="relative bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-2xl border border-white/10 p-5 shadow-lg overflow-hidden group hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
      style={{ boxShadow: `0 0 30px ${stat.color.split(" ")[1]}20` }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at 100% 0%, ${areaColor}30, transparent 70%)`,
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div
            className={`p-2 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}
          >
            <stat.icon className="w-5 h-5 text-white" />
          </div>
          <span
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
              stat.trend === "up"
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {stat.trend === "up" ? "↑" : "↓"} {stat.change}
          </span>
        </div>

        <div>
          <h3 className="text-gray-400 text-sm mb-1">{stat.title}</h3>
          <p className="text-2xl font-bold text-white mb-3">{stat.value}</p>
        </div>

        <div className="h-14 -mx-2 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={sparklineData}
              margin={{ top: 5, right: 5, left: 5, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id={`areaGradient-${index}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={areaColor} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={areaColor} stopOpacity={0} />
                </linearGradient>
                <filter
                  id={`areaGlow-${index}`}
                  x="-50%"
                  y="-50%"
                  width="200%"
                  height="200%"
                >
                  <feGaussianBlur
                    in="SourceGraphic"
                    stdDeviation="3"
                    result="blur1"
                  />
                  <feGaussianBlur
                    in="SourceGraphic"
                    stdDeviation="6"
                    result="blur2"
                  />
                  <feMerge>
                    <feMergeNode in="blur2" />
                    <feMergeNode in="blur1" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={areaColor}
                strokeWidth={2}
                fill={`url(#areaGradient-${index})`}
                filter={`url(#areaGlow-${index})`}
                isAnimationActive={true}
                animationDuration={1000}
                animationBegin={index * 100}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: areaColor }}
          />
          vs last month
        </p>
      </div>
    </motion.div>
  );
};

// Extracted LeadRow component
const LeadRow = ({ lead, index, onView, onEdit, onDelete, onStatusChange }) => {
  const getStatusColor = (status) =>
    STATUS_COLORS[status] || "bg-gray-500/20 text-gray-400";

  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="hover:bg-white/5 transition-colors group"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-purple-400" />
          <span className="text-white font-medium">{lead.companyName}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div>
          <p className="text-white text-sm font-medium">{lead.contactPerson}</p>
          <p className="text-gray-400 text-xs">{lead.contactEmail}</p>
          <p className="text-gray-500 text-xs">{lead.contactNumber}</p>
        </div>
      </td>
      <td className="px-6 py-4">
        <select
          value={lead.status}
          onChange={(e) => onStatusChange(lead.id, e.target.value)}
          className={`inline-flex px-2 py-1 text-xs rounded-full border ${getStatusColor(lead.status)} focus:outline-none cursor-pointer`}
        >
          <option value="NEW">NEW</option>
          <option value="CONTACTED">CONTACTED</option>
          <option value="NEGOTIATION">NEGOTIATION</option>
          <option value="WON">WON</option>
          <option value="LOST">LOST</option>
        </select>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <User className="w-3 h-3 text-white" />
          </div>
          <span className="text-gray-300 text-sm">
            {lead.assignedTo?.map((u) => u.name).join(", ") || "Unassigned"}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Calendar className="w-3 h-3" />
          <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <ActionButton
            icon={Eye}
            onClick={() => onView(lead)}
            label="View"
            color="hover:text-purple-400"
          />
          <ActionButton
            icon={Edit2}
            onClick={() => onEdit(lead)}
            label="Edit"
            color="hover:text-blue-400"
          />
          <ActionButton
            icon={Trash2}
            onClick={() => onDelete(lead)}
            label="Delete"
            color="hover:text-red-400"
          />
        </div>
      </td>
    </motion.tr>
  );
};

const ActionButton = ({ icon: Icon, onClick, label, color }) => (
  <button
    onClick={onClick}
    className="p-1.5 hover:bg-white/10 rounded-lg transition-all"
    title={label}
  >
    <Icon className={`w-4 h-4 text-gray-400 ${color} transition-colors`} />
  </button>
);

// Filter bar component
const FilterBar = ({ filters, onFilterChange, onClearFilters, employees }) => (
  <div className="flex flex-wrap gap-3">
    <FilterDropdown
      label="Status"
      icon={Filter}
      options={STATUS_OPTIONS}
      value={filters.status}
      onChange={(value) => onFilterChange("status", value)}
    />
    <div className="relative">
      <select
        value={filters.assignedTo}
        onChange={(e) => onFilterChange("assignedTo", e.target.value)}
        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:bg-white/10 transition-all appearance-none cursor-pointer"
        style={{ paddingRight: "2.5rem" }}
      >
        <option value="All" className="bg-gray-900">
          All Members
        </option>

        {employees.map((emp) => (
          <option key={emp.user.id} value={emp.user.id}>
            {emp.user.name}
          </option>
        ))}
      </select>

      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
    {(filters.status !== "All" || filters.assignedTo !== "All") && (
      <button
        onClick={onClearFilters}
        className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
      >
        Clear All
      </button>
    )}
  </div>
);

const FilterDropdown = ({ options, value, onChange }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:bg-white/10 transition-all appearance-none cursor-pointer"
      style={{ paddingRight: "2.5rem" }}
    >
      {options.map((option) => (
        <option key={option} value={option} className="bg-gray-800">
          {option}
        </option>
      ))}
    </select>
    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
  </div>
);

// Add/Edit Lead Modal Component
const LeadModal = ({
  isOpen,
  onClose,
  onSubmit,
  lead,
  employees,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    contactEmail: "",
    contactNumber: "",
    status: "NEW",
    notes: "",
    assignedToIds: [],
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (lead) {
      setFormData({
        companyName: lead.companyName || "",
        contactPerson: lead.contactPerson || "",
        contactEmail: lead.contactEmail || "",
        contactNumber: lead.contactNumber || "",
        status: lead.status || "NEW",
        notes: lead.notes || "",
        assignedToIds: lead.assignedTo?.map((u) => u.id) || [],
      });
    } else {
      setFormData({
        companyName: "",
        contactPerson: "",
        contactEmail: "",
        contactNumber: "",
        status: "NEW",
        notes: "",
        assignedToIds: [],
      });
    }
  }, [lead]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssignedToChange = (e) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value,
    );
    setFormData((prev) => ({ ...prev, assignedToIds: selectedOptions }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-2xl w-full mx-4 border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-xl">
                  <UserPlus className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {lead ? "Edit Lead" : "Add New Lead"}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {lead
                      ? "Update the lead details below"
                      : "Enter the lead details below"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Building2 className="w-4 h-4 inline mr-2" />
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    placeholder="Enter company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    placeholder="Full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Tag className="w-4 h-4 inline mr-2" />
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  >
                    {STATUS_OPTIONS.filter((s) => s !== "All").map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Users className="w-4 h-4 inline mr-2" />
                    Assign Members *
                  </label>
                  {employees.length === 0 ? (
                    <p className="text-sm text-amber-400/90 py-2">
                      No members in this workspace yet. Invite teammates with your join code.
                    </p>
                  ) : (
                    <>
                      <select
                        multiple
                        value={formData.assignedToIds.map((id) => id.toString())}
                        onChange={handleAssignedToChange}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 min-h-[80px]"
                      >
                        {employees.map((emp) => (
                          <option key={emp.user.id} value={emp.user.id}>
                            {emp.user.name}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Only members (not admins) can be assigned. Hold Ctrl/Cmd to select multiple.
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  placeholder="Additional information about the lead..."
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {lead ? "Update Lead" : "Save Lead"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
const Leads = () => {
  const navigate = useNavigate();
  // Use contexts
  const {
    leads,
    loading: leadsLoading,
    error: leadsError,
    getAllLeads,
    createLead,
    updateLead,
    updateLeadStatus,
    deleteLead,
  } = useLead();

  const { workspace, teamMembers } = useWorkspace();

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("newest");
  const [filters, setFilters] = useState({
    status: "All",
    assignedTo: "All",
  });
  const [selectedLead, setSelectedLead] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Fetch leads when component mounts or workspace changes
  useEffect(() => {
    if (workspace?.id) {
      getAllLeads();
    }
  }, [workspace?.id]);

  const handleAddLead = async (leadData) => {
    setModalLoading(true);
    try {
      await createLead(leadData);
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateLead = async (leadData) => {
    setModalLoading(true);
    try {
      await updateLead(selectedLead.id, leadData);
    } finally {
      setModalLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateLeadStatus(id, newStatus);
    } catch (error) {
      console.error("Error updating status:", error);
      alert(error.message || "Failed to update status");
    }
  };

  const handleDeleteLead = async () => {
    try {
      await deleteLead(selectedLead.id);

      setShowDeleteModal(false);
      setSelectedLead(null);
    } catch (error) {
      console.error("Error deleting lead:", error);
      alert(error.message || "Failed to delete lead");
    }
  };

  // Filter and search logic
  const filteredLeads = useMemo(() => {
    let filtered = [...leads];

    if (searchTerm) {
      filtered = filtered.filter(
        (lead) =>
          lead.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.contactPerson
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          lead.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (filters.status !== "All") {
      filtered = filtered.filter((lead) => lead.status === filters.status);
    }

    if (filters.assignedTo !== "All") {
      filtered = filtered.filter((lead) =>
        lead.assignedTo?.some((a) => a.id.toString() === filters.assignedTo),
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
    });

    return filtered;
  }, [leads, searchTerm, filters, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLeads.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLeads, currentPage, itemsPerPage]);

  // Stats data
  const stats = [
    {
      title: "Total Leads",
      value: leads.length.toString(),
      change: "+12.5%",
      trend: "up",
      icon: Users,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "New Leads",
      value: leads.filter((l) => l.status === "NEW").length.toString(),
      change: "+8.2%",
      trend: "up",
      icon: UserPlus,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Contacted Leads",
      value: leads
        .filter((l) => l.status === "Contacted Leads")
        .length.toString(),
      change: "-4.5%",
      trend: "down",
      icon: Clock,
      color: "from-orange-500 to-red-500",
    },
    {
      title: "Won Leads",
      value: leads.filter((l) => l.status === "WON").length.toString(),
      change: "+15.6%",
      trend: "up",
      icon: Trophy,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Lost Leads",
      value: leads.filter((l) => l.status === "LOST").length.toString(),
      change: "-3.1%",
      trend: "down",
      icon: XCircle,
      color: "from-red-500 to-rose-500",
    },
  ];

  const handleClearFilters = useCallback(() => {
    setFilters({ status: "All", assignedTo: "All" });
    setSearchTerm("");
    setCurrentPage(1);
  }, []);

  const handleExport = useCallback(() => {
    const csvData = filteredLeads.map((lead) => ({
      Company: lead.companyName,
      Contact: lead.contactPerson,
      Email: lead.contactEmail,
      Phone: lead.contactNumber,
      Status: lead.status,
      "Assigned To": lead.assignedTo?.map((u) => u.name).join(", "),
      Date: new Date(lead.createdAt).toLocaleDateString(),
    }));

    const convertToCSV = (data) => {
      if (!data.length) return "";
      const headers = Object.keys(data[0]);
      const rows = data.map((obj) =>
        headers.map((header) => JSON.stringify(obj[header] || "")).join(","),
      );
      return [headers.join(","), ...rows].join("\n");
    };

    const csv = convertToCSV(csvData);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads_export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredLeads]);

  if (leadsError) {
    return (
      <div className="flex h-screen bg-[#040a18]">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Error Loading Leads
            </h3>
            <button
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-gray-300 hover:bg-white/10 transition-all"
              onClick={() => window.location.reload()}
            >
              Refresh
            </button>
            <p className="text-gray-400">{leadsError}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#040a18] overflow-hidden">
      <Sidebar />

      <div className="flex-1 overflow-y-auto h-screen ml-64 [&::-webkit-scrollbar]:hidden">
        <div className="p-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-wrap items-center justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Lead Management
              </h1>
              <p className="text-gray-400">
                Manage and organize all your leads in one place.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                Add Lead
              </button>

              <button
                onClick={handleExport}
                disabled={filteredLeads.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-xl text-white font-medium hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {stats.map((stat, idx) => (
              <StatCard
                key={idx}
                stat={stat}
                index={idx}
                onClick={(title) => {
                  if (title === "New Leads")
                    setFilters((prev) => ({ ...prev, status: "NEW" }));
                  else if (title === "Won Leads")
                    setFilters((prev) => ({ ...prev, status: "WON" }));
                  else if (title === "Lost Leads")
                    setFilters((prev) => ({ ...prev, status: "LOST" }));
                  else if (title === "Contacted Leads")
                    setFilters((prev) => ({ ...prev, status: "CONTACTED" }));
                }}
              />
            ))}
          </div>

          {/* Filters and Search Bar */}
          <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-2xl border border-white/10 p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by company, contact or email..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
              </div>

              <FilterBar
                filters={filters}
                onFilterChange={(key, value) => {
                  setFilters((prev) => ({ ...prev, [key]: value }));
                  setCurrentPage(1);
                }}
                onClearFilters={handleClearFilters}
                employees={teamMembers}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-sm">Sort by:</span>
                <SortButton
                  active={sortBy === "newest"}
                  onClick={() => setSortBy("newest")}
                  icon={ChevronUp}
                  label="Newest"
                />
                <SortButton
                  active={sortBy === "oldest"}
                  onClick={() => setSortBy("oldest")}
                  icon={ChevronDown}
                  label="Oldest"
                />
              </div>
              <div className="text-sm text-gray-400">
                Found {filteredLeads.length} lead
                {filteredLeads.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>

          {/* Leads Table */}
          <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-lg">
            {leadsLoading ? (
              <PageLoader label="Loading leads..." />
            ) : filteredLeads.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5 border-b border-white/10">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Company
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Assigned To
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {paginatedLeads.map((lead, idx) => (
                        <LeadRow
                          key={lead.id}
                          lead={lead}
                          index={idx}
                          onView={(lead) => {
                            setSelectedLead(lead);
                            navigate(window.location.pathname + `/${lead.id}`);
                          }}
                          onEdit={(lead) => {
                            setSelectedLead(lead);
                            setShowEditModal(true);
                          }}
                          onDelete={(lead) => {
                            setSelectedLead(lead);
                            setShowDeleteModal(true);
                          }}
                          onStatusChange={handleStatusChange}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredLeads.length}
                  startIndex={(currentPage - 1) * itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={(value) => {
                    setItemsPerPage(value);
                    setCurrentPage(1);
                  }}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <LeadModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddLead}
        employees={teamMembers}
        isLoading={modalLoading}
      />

      <LeadModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedLead(null);
        }}
        onSubmit={handleUpdateLead}
        lead={selectedLead}
        employees={teamMembers}
        isLoading={modalLoading}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <DeleteConfirmationModal
            lead={selectedLead}
            onConfirm={handleDeleteLead}
            onCancel={() => {
              setShowDeleteModal(false);
              setSelectedLead(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper components
const SortButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-all ${
      active
        ? "bg-purple-500/20 text-purple-400"
        : "text-gray-400 hover:text-white"
    }`}
  >
    {label}
    <Icon className="w-3 h-3" />
  </button>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16">
    <AlertCircle className="w-16 h-16 text-gray-600 mb-4" />
    <h3 className="text-xl font-semibold text-white mb-2">No leads found</h3>
    <p className="text-gray-400">Try adjusting your search or filters</p>
  </div>
);

const Pagination = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  startIndex,
  onPageChange,
  onItemsPerPageChange,
}) => (
  <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-t border-white/10 bg-white/5">
    <div className="text-gray-400 text-sm">
      Showing {startIndex + 1} to{" "}
      {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} leads
    </div>
    <div className="flex items-center gap-2">
      <select
        value={itemsPerPage}
        onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
        className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-300 text-sm focus:outline-none focus:border-purple-500"
      >
        {ITEMS_PER_PAGE_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option} / page
          </option>
        ))}
      </select>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Previous
        </button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum;
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (currentPage <= 3) {
            pageNum = i + 1;
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + i;
          } else {
            pageNum = currentPage - 2 + i;
          }
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                currentPage === pageNum
                  ? "bg-purple-500 text-white"
                  : "text-gray-300 hover:bg-white/10"
              }`}
            >
              {pageNum}
            </button>
          );
        })}
        {totalPages > 5 && currentPage < totalPages - 2 && (
          <>
            <span className="text-gray-500">...</span>
            <button
              onClick={() => onPageChange(totalPages)}
              className="px-3 py-1.5 rounded-lg transition-all text-gray-300 hover:bg-white/10"
            >
              {totalPages}
            </button>
          </>
        )}
        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Next
        </button>
      </div>
    </div>
  </div>
);

const DeleteConfirmationModal = ({ lead, onConfirm, onCancel }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
    onClick={onCancel}
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 border border-white/10"
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className="text-xl font-semibold text-white mb-2">Delete Lead</h3>
      <p className="text-gray-400 mb-6">
        Are you sure you want to delete {lead?.contactPerson} from{" "}
        {lead?.companyName}? This action cannot be undone.
      </p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:bg-white/10 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all"
        >
          Delete
        </button>
      </div>
    </motion.div>
  </motion.div>
);

export default Leads;
