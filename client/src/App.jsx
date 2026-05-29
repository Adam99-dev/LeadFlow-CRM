import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Workspace from "./pages/Workspace";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Employees from "./pages/Employees";
import Tasks from "./pages/Tasks";
import SingleLead from "./pages/SingleLead";
import NotFound from "./components/NotFound";
import { FullPageLoader } from "./components/ui/Loader";
import "./index.css";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <FullPageLoader label="Checking session..." />;
  }

  return isAuthenticated ? children : <Navigate to="/auth" replace />;
};

// Public Route Component (redirects to workspace if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <FullPageLoader label="Checking session..." />;
  }

  return !isAuthenticated ? children : <Navigate to="/workspace" replace />;
};

function App() {
  const { loading } = useAuth();
  const location = useLocation();

  // Define routes where navbar should be hidden
  const hideNavbarRoutes = ["/dashboard/"];
  const [showNavbar, setShowNavbar] = useState(true);

  useEffect(() => {
    // Check if current path matches any route where navbar should be hidden
    const shouldHideNavbar = hideNavbarRoutes.some(
      (route) =>
        location.pathname === route ||
        location.pathname.startsWith("/workspace/") || location.pathname.startsWith("/demo"),
    );
    setShowNavbar(!shouldHideNavbar);
  }, [location.pathname]);

  if (loading) {
    return <FullPageLoader />;
  }

  return (
    <div className="bg-[#040a18] min-h-screen text-white [&::-webkit-scrollbar]:hidden">
      {/* Conditionally render Navbar based on showNavbar state */}
      {showNavbar && <Navbar />}

      <Routes>
        {/* Public Routes - Anyone can access */}
        <Route path="/" element={<Home />} />

        {/* Auth Route - Redirects to workspace if already logged in */}
        <Route
          path="/auth"
          element={
            <PublicRoute>
              <Auth />
            </PublicRoute>
          }
        />
        {/* Protected Routes - Require authentication */}
        <Route
          path="/workspace"
          element={
            <ProtectedRoute>
              <Workspace />
            </ProtectedRoute>
          }
        />

        <Route
          path="/workspace/:id/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workspace/:id/leads"
          element={
            <ProtectedRoute>
              <Leads />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workspace/:workspaceId/leads/:leadId"
          element={
            <ProtectedRoute>
              <SingleLead />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workspace/:id/tasks"
          element={
            <ProtectedRoute>
              <Tasks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workspace/:id/employees"
          element={
            <ProtectedRoute>
              <Employees />
            </ProtectedRoute>
          }
        />
        {/* Catch all - Redirect to home */}
        <Route
          path="*"
          element={<NotFound/>}
        />
      </Routes>
    </div>
  );
}
export default App;

