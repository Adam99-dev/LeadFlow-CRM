import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Users, Trophy, Clock, DollarSign,
  Activity, Download, Calendar, ChevronRight, MoreVertical,
  Eye, Edit2, RefreshCw,
} from "lucide-react";
import {
  Line, AreaChart, Area, BarChart, Bar,
  PieChart as RePieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

// StatCard Component
const StatCard = ({ stat, index, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    onClick={() => onClick?.(stat.title)}
    className="relative bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-2xl border border-white/10 p-5 shadow-lg overflow-hidden group hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
    style={{ boxShadow: `0 0 30px ${stat.sparklineColor}20` }}
  >
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{ background: `radial-gradient(circle at 100% 0%, ${stat.sparklineColor}30, transparent 70%)` }} />
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-3">
        <div className={`bg-gradient-to-r ${stat.gradient} p-2 rounded-xl shadow-lg`}>
          <stat.icon className="w-5 h-5 text-white" />
        </div>
        <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
          stat.trend === "up" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
        }`}>
          {stat.trend === "up" ? "↑" : "↓"} {stat.change}
        </span>
      </div>
      <div>
        <h3 className="text-gray-400 text-sm mb-1">{stat.title}</h3>
        <p className="text-2xl font-bold text-white mb-3">{stat.value}</p>
      </div>
      <div className="h-14 -mx-2 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={stat.sparklineData} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
            <defs>
              <linearGradient id={`areaGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={stat.sparklineColor} stopOpacity={0.4} />
                <stop offset="100%" stopColor={stat.sparklineColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="value" stroke="none" fill={`url(#areaGradient-${index})`} isAnimationActive={true} />
            <Line type="monotone" dataKey="value" stroke={stat.sparklineColor} strokeWidth={2} dot={false} isAnimationActive={true} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  </motion.div>
);

// Kanban Stage Component
const KanbanStage = ({ stage, index }) => {
  const colors = {
    blue: { bg: "from-blue-500/20", border: "border-blue-500/30", glow: "#3b82f6" },
    purple: { bg: "from-purple-500/20", border: "border-purple-500/30", glow: "#8b5cf6" },
    green: { bg: "from-green-500/20", border: "border-green-500/30", glow: "#10b981" },
    emerald: { bg: "from-emerald-500/20", border: "border-emerald-500/30", glow: "#10b981" },
  }[stage.color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg overflow-hidden group hover:scale-[1.02] transition-transform duration-300"
      style={{ boxShadow: `0 0 20px ${colors.glow}20` }}
    >
      <div className={`p-4 border-b border-white/10 bg-gradient-to-r ${colors.bg} to-transparent rounded-t-2xl`}>
        <div className="flex items-center justify-between">
          <h4 className="text-white font-semibold">{stage.title}</h4>
          <span className="text-sm text-gray-400 px-2 py-0.5 rounded-full bg-white/10">{stage.leads.length}</span>
        </div>
      </div>
      <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-thumb]:bg-purple-500/50 [&::-webkit-scrollbar-thumb]:rounded-full">
        {stage.leads.map((lead, leadIdx) => (
          <motion.div
            key={lead.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 + leadIdx * 0.05 }}
            className="bg-white/5 rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group/lead"
          >
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-white font-medium text-sm">{lead.name}</h5>
              <span className={`text-xs px-2 py-1 rounded-full ${
                lead.priority === "High" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"
              }`}>{lead.priority}</span>
            </div>
            <p className="text-gray-400 text-xs flex items-center gap-1"><Users className="w-3 h-3" />{lead.contact}</p>
            <p className="text-blue-400 text-sm font-semibold mt-2">{lead.value}</p>
            <div className="flex items-center justify-end gap-1 mt-2 opacity-0 group-hover/lead:opacity-100 transition-opacity">
              <button className="p-1 hover:bg-white/10 rounded-lg"><Eye className="w-3 h-3 text-gray-400 hover:text-purple-400" /></button>
              <button className="p-1 hover:bg-white/10 rounded-lg"><Edit2 className="w-3 h-3 text-gray-400 hover:text-blue-400" /></button>
              <button className="p-1 hover:bg-white/10 rounded-lg"><MoreVertical className="w-3 h-3 text-gray-400" /></button>
            </div>
          </motion.div>
        ))}
        {stage.leads.length === 0 && <div className="text-center py-8"><p className="text-gray-500 text-sm">No leads in this stage</p></div>}
      </div>
    </motion.div>
  );
};

// Activity Item Component
const ActivityItem = ({ activity, index }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.05 }}
    className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all group"
  >
    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
      <Activity className="w-4 h-4 text-white" />
    </div>
    <div className="flex-1">
      <p className="text-gray-300 text-sm">
        <span className="font-semibold text-white">{activity.user}</span> {activity.action}{" "}
        <span className="font-medium text-blue-400">{activity.target}</span>
      </p>
      <p className="text-gray-500 text-xs mt-1 flex items-center gap-1"><Calendar className="w-3 h-3" />{activity.time}</p>
    </div>
    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded-lg">
      <ChevronRight className="w-4 h-4 text-gray-400" />
    </button>
  </motion.div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("weekly");
  const [selectedSource, setSelectedSource] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const statsCards = [
    { title: "Total Leads", value: "1,245", change: "-3.7%", trend: "down", icon: Users, gradient: "from-blue-500 to-cyan-500",
      sparklineData: [{ value: 850 }, { value: 1240 }, { value: 430 }, { value: 890 }, { value: 1520 }, { value: 610 }, { value: 1245 }],
      sparklineColor: "#3b82f6" },
    { title: "Won Deals", value: "312", change: "+18.3%", trend: "up", icon: Trophy, gradient: "from-green-500 to-emerald-500",
      sparklineData: [{ value: 200 }, { value: 410 }, { value: 250 }, { value: 390 }, { value: 180 }, { value: 510 }, { value: 312 }],
      sparklineColor: "#10b981" },
    { title: "Pending Tasks", value: "28", change: "+32.1%", trend: "up", icon: Clock, gradient: "from-orange-500 to-red-500",
      sparklineData: [{ value: 45 }, { value: 22 }, { value: 58 }, { value: 31 }, { value: 67 }, { value: 19 }, { value: 28 }],
      sparklineColor: "#f59e0b" },
    { title: "Revenue", value: "$48,250", change: "-7.9%", trend: "down", icon: DollarSign, gradient: "from-purple-500 to-pink-500",
      sparklineData: [{ value: 32000 }, { value: 49500 }, { value: 37800 }, { value: 51200 }, { value: 28900 }, { value: 46700 }, { value: 48250 }],
      sparklineColor: "#8b5cf6" },
  ];

  const leadsTrendData = [
    { month: "Jan", leads: 850, revenue: 350.22 }, { month: "Feb", leads: 720, revenue: 298.45 },
    { month: "Mar", leads: 500, revenue: 180.96 }, { month: "Apr", leads: 630, revenue: 220.34 },
    { month: "May", leads: 652, revenue: 250.09 }, { month: "Jun", leads: 480, revenue: 190.67 },
    { month: "Jul", leads: 257, revenue: 150.78 }, { month: "Aug", leads: 590, revenue: 210.23 },
    { month: "Sep", leads: 788, revenue: 325.27 }, { month: "Oct", leads: 620, revenue: 245.89 },
    { month: "Nov", leads: 145, revenue: 135.08 }, { month: "Dec", leads: 380, revenue: 175.45 },
  ];

  const sourceData = [
    { name: "Website", value: 35, color: "#3b82f6", leads: 436 },
    { name: "Referral", value: 25, color: "#10b981", leads: 311 },
    { name: "Social Media", value: 20, color: "#f59e0b", leads: 249 },
    { name: "Email", value: 20, color: "#8b5cf6", leads: 249 },
  ];

  const taskCompletionData = [
    { name: "Completed", value: 75, color: "#10b981" },
    { name: "In Progress", value: 15, color: "#f59e0b" },
    { name: "Pending", value: 10, color: "#ef4444" },
  ];

  const recentActivities = [
    { user: "Rahul Verma", action: "updated lead", target: "TechNova Solutions", time: "2 min ago" },
    { user: "System", action: "completed task", target: "Follow up with Apex", time: "1 hour ago" },
    { user: "Rajiv Patel", action: "added new lead", target: "Global Retail Co.", time: "3 hours ago" },
    { user: "Sales Team", action: "won deal", target: "Precision Tools", time: "5 hours ago" },
    { user: "Priya Singh", action: "scheduled meeting", target: "Bright Future Ltd.", time: "1 day ago" },
  ];

  const kanbanStages = [
    { id: "new", title: "New Leads", color: "blue", leads: [{ id: 1, name: "Apex Industries", contact: "Rohan Mehta", value: "$4,200", priority: "High" }, { id: 5, name: "Stellar Solutions", contact: "Neha Kapoor", value: "$8,500", priority: "Medium" }] },
    { id: "contacted", title: "Contacted", color: "purple", leads: [{ id: 2, name: "TechNova Solutions", contact: "Vikram Singh", value: "$56,500", priority: "High" }, { id: 6, name: "Innovative Labs", contact: "Amit Patel", value: "$12,000", priority: "High" }] },
    { id: "qualified", title: "Qualified", color: "green", leads: [{ id: 3, name: "Precision Tools", contact: "Rajesh Kumar", value: "$12,500", priority: "High" }, { id: 7, name: "Digital Wave", contact: "Sneha Sharma", value: "$7,800", priority: "Medium" }] },
    { id: "won", title: "Won Deals", color: "emerald", leads: [{ id: 4, name: "Global Systems", contact: "Amit Sharma", value: "$45,000", priority: "High" }, { id: 8, name: "Vision Corp", contact: "Rakesh Gupta", value: "$23,400", priority: "High" }] },
  ];

  const filteredTrendData = useMemo(() => {
    if (timeRange === "weekly") return leadsTrendData.slice(-7);
    if (timeRange === "monthly") return leadsTrendData.slice(-4);
    return leadsTrendData;
  }, [timeRange]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  }, []);

  // Working Export Function
  const handleExport = useCallback(() => {
    const exportData = {
      dashboard: {
        stats: statsCards.map(({ title, value, change, trend }) => ({ title, value, change, trend })),
        leadsTrend: filteredTrendData,
        leadSources: sourceData,
        taskCompletion: taskCompletionData,
        recentActivities,
        kanbanStages: kanbanStages.map(stage => ({
          id: stage.id,
          title: stage.title,
          leads: stage.leads
        })),
        exportTimestamp: new Date().toISOString(),
        exportedBy: user?.name || "Unknown User",
      }
    };

    // Create and download JSON file
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `dashboard_export_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.csv`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    // Also log to console for debugging
    console.log("Dashboard exported successfully:", exportData);
  }, [filteredTrendData, user]);

  const handleSourceClick = useCallback((source) => {
    setSelectedSource(selectedSource === source ? null : source);
  }, [selectedSource]);

  return (
    <div className="flex h-screen bg-[#040a18] overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto h-screen ml-64 [&::-webkit-scrollbar]:hidden">
        <div className="p-6">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.name || "User"}!</h1>
              <p className="text-gray-400">Here's what's happening with your business today.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/10">
                {["weekly", "monthly", "yearly"].map(range => (
                  <button key={range} onClick={() => setTimeRange(range)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                      timeRange === range ? "bg-purple-500 text-white" : "text-gray-400 hover:text-white"
                    }`}>{range}</button>
                ))}
              </div>
              <button onClick={handleRefresh} disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-xl text-white font-medium hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50">
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />Refresh
              </button>
              <button onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-xl text-white font-medium hover:shadow-lg transition-all duration-300 hover:scale-105">
                <Download className="w-4 h-4" />Export
              </button>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statsCards.map((stat, idx) => <StatCard key={idx} stat={stat} index={idx} onClick={(title) => console.log("Filter by:", title)} />)}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Leads & Revenue Trend - Using AreaChart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-lg hover:shadow-xl transition-shadow"
              style={{ boxShadow: "0 0 30px #3b82f620" }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold text-lg">Leads & Revenue Trend</h3>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500"></span><span className="text-gray-400 text-xs">Leads</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-purple-500"></span><span className="text-gray-400 text-xs">Revenue (k)</span></div>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredTrendData}>
                    <defs>
                      <linearGradient id="leadsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} /><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="month" stroke="#9ca3af" tick={{ fill: "#9ca3af" }} />
                    <YAxis stroke="#9ca3af" tick={{ fill: "#9ca3af" }} />
                    <Tooltip contentStyle={{ backgroundColor: "#0a0a2a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", backdropFilter: "blur(12px)" }} />
                    <Area type="monotone" dataKey="leads" stroke="#3b82f6" fill="url(#leadsGradient)" strokeWidth={2} />
                    <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fill="url(#revenueGradient)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Leads by Source */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-lg hover:shadow-xl transition-all relative overflow-hidden"
              style={{ boxShadow: "0 0 30px #8b5cf620" }}>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
              <h3 className="text-white font-semibold text-lg mb-6 flex items-center gap-2">
                Leads by Source
                {selectedSource && <button onClick={() => setSelectedSource(null)} className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30">Clear Filter</button>}
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie data={sourceData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ strokeWidth: 0 }} animationDuration={1500}>
                      {sourceData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} stroke="rgba(255,255,255,0.1)" strokeWidth={2}
                          style={{ filter: `drop-shadow(0 0 8px ${entry.color})`, transition: "all 0.3s ease", cursor: "pointer",
                            opacity: selectedSource && selectedSource !== entry.name ? 0.4 : 1 }}
                          onClick={() => handleSourceClick(entry.name)} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#0a0a2a", border: "1px solid rgba(139, 92, 246, 0.3)", borderRadius: "12px", backdropFilter: "blur(12px)" }}
                      formatter={(value, name) => [`${value}% (${sourceData.find(d => d.name === name)?.leads || 0} leads)`, name]} />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-4 pt-4 border-t border-white/10">
                {sourceData.map(source => (
                  <button key={source.name} onClick={() => handleSourceClick(source.name)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-all ${selectedSource === source.name ? "bg-white/10" : "hover:bg-white/5"}`}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: source.color, boxShadow: `0 0 8px ${source.color}` }} />
                    <span className="text-gray-300 text-xs">{source.name}</span><span className="text-gray-500 text-xs">{source.leads}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Kanban Board */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-lg">Pipeline Overview</h3>
              <button className="text-sm text-purple-400 hover:text-purple-300">View All →</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {kanbanStages.map((stage, idx) => <KanbanStage key={stage.id} stage={stage} index={idx} />)}
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task Completion */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-lg hover:shadow-xl transition-all relative overflow-hidden"
              style={{ boxShadow: "0 0 30px #10b98120" }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold text-lg">Task Completion</h3>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /><span className="text-gray-400 text-xs">75% Complete</span></div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={taskCompletionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                    <XAxis dataKey="name" stroke="#9ca3af" axisLine={{ stroke: "rgba(255,255,255,0.1)" }} tickLine={false} />
                    <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: "#0a0a2a", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "12px", backdropFilter: "blur(12px)" }}
                      formatter={(value) => [`${value}%`, "Completion"]} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} animationDuration={1500}>
                      {taskCompletionData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} style={{ filter: `drop-shadow(0 0 8px ${entry.color})` }} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-around mt-4 pt-4 border-t border-white/10">
                <div className="text-center"><p className="text-green-400 text-xl font-bold">75</p><p className="text-gray-500 text-xs">Completed</p></div>
                <div className="text-center"><p className="text-yellow-400 text-xl font-bold">15</p><p className="text-gray-500 text-xs">In Progress</p></div>
                <div className="text-center"><p className="text-red-400 text-xl font-bold">10</p><p className="text-gray-500 text-xs">Pending</p></div>
              </div>
            </motion.div>

            {/* Recent Activities */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-lg hover:shadow-xl transition-shadow"
              style={{ boxShadow: "0 0 30px #f59e0b20" }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold text-lg">Recent Activities</h3>
                <button className="text-xs text-purple-400 hover:text-purple-300">View All</button>
              </div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-thumb]:bg-purple-500/50 [&::-webkit-scrollbar-thumb]:rounded-full">
                {recentActivities.map((activity, idx) => <ActivityItem key={idx} activity={activity} index={idx} />)}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
