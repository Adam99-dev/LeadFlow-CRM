import { useState, useEffect } from "react";
import {
  ChevronDown,
  User,
  LogOut,
  Settings,
  Home,
  LayoutDashboard,
  CreditCard,
  Sparkles,
  Rocket,
  BookOpen,
  DollarSign,
  Mail,
  Menu,
  X,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeHash, setActiveHash] = useState(null);

  useEffect(() => {
    const handleHashChange = () => {
      setActiveHash(window.location.hash);
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate("/auth");
      window.location.reload();
    }
  };

  const isActive = (link) => {
    // For hash links
    if (link.path.startsWith("#")) {
      return activeHash === link.path;
    }

    if (link.path === "/") {
      return location.pathname === "/" && !activeHash;
    }

    // For other routes
    return location.pathname === link.path;
  };

  const handleNavClick = (link) => {
    if (link.path.startsWith("#")) {
      // Handle hash link navigation
      const element = document.querySelector(link.path);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        // Update URL hash without causing page jump
        window.history.pushState(null, null, link.path);
        setActiveHash(link.path);
      }
    } else {
      // Handle regular navigation
      navigate(link.path);
      // Clear any active hash when navigating to a different page
      setActiveHash(null);
    }
  };

  const navLinks = isAuthenticated
    ? [
        { name: "Home", path: "/", icon: Home },
        { name: "Workspace", path: "/workspace", icon: LayoutDashboard },
        { name: "Subscription", path: "", icon: CreditCard },
        { name: "Contact", path: "", icon: Mail },
      ]
    : [
        { name: "Home", path: "/", icon: Home },
        { name: "Features", path: "#features", icon: Sparkles },
        { name: "Solutions", path: "", icon: Rocket },
        {
          name: "Resources",
          path: "",
          icon: BookOpen,
          hasDropdown: true,
        },
        { name: "Pricing", path: "", icon: DollarSign },
        { name: "Contact", path: "", icon: Mail },
      ];

  return (
    <nav className="flex items-center justify-between px-4 md:px-8 py-4 md:py-5 bg-transparent backdrop-blur-lg fixed w-full z-50">
      {/* Logo */}
      <button
        onClick={() => {
          navigate("/");
          setActiveHash(null);
          // Remove hash from URL
          window.history.pushState(null, null, "/");
        }}
        className="cursor-pointer hover:scale-105 transition-transform duration-300"
      >
        <div className="flex items-center gap-3">
          <img
            src="/LeadFlow.png"
            alt="LeadFlow"
            className="w-auto h-10 md:h-16"
          />
        </div>
      </button>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm">
        {navLinks.map((link) => (
          <button
            key={link.name}
            onClick={() => handleNavClick(link)}
            className={`group flex items-center gap-2 px-2 py-1 rounded-lg transition-all duration-300 ${
              isActive(link)
                ? "text-violet-400"
                : "text-white hover:text-violet-400 hover:bg-white/5"
            }`}
          >
            <link.icon className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span>{link.name}</span>
          </button>
        ))}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3 md:gap-4">
        {!isAuthenticated ? (
          <>
            <button
              onClick={() => navigate("/auth")}
              className="hidden md:block text-white hover:text-violet-400 transition-colors px-3 py-2"
            >
              Log in
            </button>
            <button
              onClick={() => navigate("/auth")}
              className="bg-gradient-to-r from-blue-400 to-violet-600 hover:from-blue-600 hover:to-violet-800 px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-violet-500/25"
            >
              Get Started
            </button>
          </>
        ) : (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center shadow-lg">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-white text-sm font-medium">
                  {user?.name?.split(" ")[0] || user?.name}
                </p>
                <p className="text-gray-400 text-xs">{user?.email}</p>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showDropdown ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-[#0a0f2a]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
                    <p className="text-white font-semibold">{user?.name}</p>
                    <p className="text-gray-400 text-sm truncate">
                      {user?.email}
                    </p>
                  </div>
                  <div className="py-2">
                    {[
                      { name: "Profile", path: "/profile", icon: User },
                      { name: "Settings", path: "/settings", icon: Settings },
                    ].map((item) => (
                      <button
                        key={item.name}
                        onClick={() => {
                          setShowDropdown(false);
                          navigate(item.path);
                          setActiveHash(null);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 transition-all duration-200 ${
                          location.pathname === item.path
                            ? "text-violet-400 bg-white/10"
                            : "text-gray-300 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.name}
                      </button>
                    ))}
                    <hr className="my-2 border-white/10" />
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 transition-all duration-200 hover:translate-x-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-all"
          aria-label="Menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 mx-4 bg-[#0a0f2a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 md:hidden overflow-hidden animate-in slide-in-from-top-2 duration-200">
            <div className="py-2">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => {
                    handleNavClick(link);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 ${
                    isActive(link)
                      ? "text-violet-400 bg-white/10"
                      : "text-white hover:bg-white/5"
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  <span>{link.name}</span>
                  {link.hasDropdown && (
                    <ChevronDown className="w-3 h-3 ml-auto" />
                  )}
                </button>
              ))}
              {!isAuthenticated && (
                <button
                  onClick={() => {
                    navigate("/auth");
                    setIsMobileMenuOpen(false);
                    setActiveHash(null);
                  }}
                  className="w-full text-left px-4 py-3 text-white hover:bg-white/5 transition-colors"
                >
                  Log in
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
