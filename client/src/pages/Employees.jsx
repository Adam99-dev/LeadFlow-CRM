import { useState, useMemo } from "react";
import { Search, User, Mail } from "lucide-react";
import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar";
import { PageLoader } from "../components/ui/Loader";
import { useWorkspace } from "../context/WorkspaceContext";

const Employees = () => {
  const { employees, loading } = useWorkspace();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter employees based on search
  const filteredEmployees = useMemo(() => {
    if (!employees || employees.length === 0) return [];

    if (!searchTerm) return employees;

    return employees.filter((emp) => {
      const name = emp.user?.name || emp.name || "";
      const email = emp.user?.email || emp.email || "";
      const role = emp.user?.role || emp.role || "";

      return (
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [employees, searchTerm]);

  // Helper function to get employee details
  const getEmployeeDetails = (emp) => {
    return {
      id: emp.id || emp.user?.id,
      name: emp.user?.name || emp.name || "Unknown",
      email: emp.user?.email || emp.email || "",
      role: emp.role || "MEMBER",
      joinDate: emp.user?.createdAt.split("T")[0] || emp.createdAt || "N/A",
    };
  };

  return (
    <div className="flex h-screen bg-[#040a18] overflow-hidden">
      <Sidebar />

      <div className="flex-1 overflow-y-auto h-screen ml-64">
        <div className="p-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-white mb-2">Employees</h1>
            <p className="text-gray-400">View all team members</p>
          </motion.div>

          {/* Search Bar */}
          <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-2xl border border-white/10 p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all"
              />
            </div>
            <div className="mt-3 text-sm text-gray-400">
              {loading
                ? "Loading employees..."
                : `Found ${filteredEmployees.length} employee${filteredEmployees.length !== 1 ? "s" : ""}`}
            </div>
          </div>

          {/* Loading State */}
          {loading && <PageLoader label="Loading team members..." />}

          {/* Employee Cards */}
          {!loading && filteredEmployees.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEmployees.map((employee, idx) => {
                const details = getEmployeeDetails(employee);
                return (
                  <motion.div
                    key={details.id || idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-2xl border border-white/10 p-5 hover:scale-[1.02] transition-transform duration-300"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold">
                        {details.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg">
                          {details.name}
                        </h3>
                        <p className="text-purple-400 text-sm">
                          {details.role}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm break-all">
                          {details.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {details.joinDate !== "N/A" && (
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            Joined: {details.joinDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredEmployees.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <User className="w-16 h-16 text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {employees?.length === 0
                  ? "No employees found"
                  : "No matching employees"}
              </h3>
              <p className="text-gray-400">
                {employees?.length === 0
                  ? "No team members have been added yet"
                  : "Try adjusting your search terms"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Employees;
