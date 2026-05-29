import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, CircleChevronLeft, User } from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const result = await login(email, password, rememberMe);
        
        if (result.success) {
          toast.success("Login successful! Redirecting...");
          setTimeout(() => {
            navigate("/workspace");
          }, 1500);
        } else {
          setError(result.error);
        }
      } else {
        const result = await register(name, email, password);
        
        if (result.success) {
          toast.success("Account created successfully! Please login.");
          setIsLogin(true);
          setName("");
          setPassword("");
          setEmail("");
        } else {
          setError(result.error);
        }
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      console.error("Auth error:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setEmail("");
    setPassword("");
    setName("");
    setError("");
  };

  return (
    <div className="min-h-screen flex bg-[#040a18] overflow-hidden">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <div className="relative w-[35%] hidden lg:block">
        <img
          className="absolute inset-0 w-full h-full object-cover"
          src="./Login.png"
          alt="background"
        />
      </div>

      <div className="w-full lg:w-[65%] flex items-center justify-center p-6 lg:p-12 bg-[#040a18] mt-7">
        <div className="w-full max-w-lg">
          <div className="rounded-3xl p-10 lg:p-12 shadow-2xl border border-white/10 bg-black/60 backdrop-blur-xl mt-10 relative">
            
            <button
              onClick={() => window.history.back()}
              className="text-white hover:text-violet-400 transition-colors absolute left-8 top-8 flex items-center gap-2 text-sm"
            >
              <CircleChevronLeft className="w-5 h-5" />
              Back
            </button>

            <h2 className="text-3xl font-bold text-white text-center mb-2 mt-8">
              {isLogin ? "Sign in to your account" : "Create your account"}
            </h2>
            <p className="text-blue-300 text-center mb-8">
              {isLogin 
                ? "Enter your credentials to access your workspace" 
                : "Join us and start managing your business"}
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div>
                  <label className="text-sm text-blue-200 mb-1.5 block">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-3.5 text-blue-400">
                      <User size={20} />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-blue-400 focus:outline-none focus:border-blue-500 transition-colors"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm text-blue-200 mb-1.5 block">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-3.5 text-blue-400">
                    <Mail size={20} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-blue-400 focus:outline-none focus:border-blue-500 transition-colors"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-blue-200 mb-1.5 block">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-3.5 text-blue-400">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-12 text-white placeholder:text-blue-400 focus:outline-none focus:border-blue-500 transition-colors"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {isLogin && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-blue-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 accent-blue-600"
                      disabled={loading}
                    />
                    Remember me
                  </label>
                  <a
                    href="#"
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl font-semibold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 text-white shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {isLogin ? "Signing in..." : "Creating Account..."}
                  </div>
                ) : (
                  <>{isLogin ? "Sign in →" : "Create Account →"}</>
                )}
              </button>
            </form>

            <div className="my-8 flex items-center gap-4">
              <div className="h-px bg-white/10 flex-1"></div>
              <span className="text-xs text-blue-400 font-medium">
                OR CONTINUE WITH
              </span>
              <div className="h-px bg-white/10 flex-1"></div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {["Google", "Microsoft", "Apple"].map((provider) => (
                <button
                  key={provider}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10 transition-all text-white"
                  onClick={() => {
                    toast.info(`${provider} login coming soon`);
                  }}
                >
                  {provider === "Google" && (
                    <img src="https://www.google.com/favicon.ico" alt="" className="w-5 h-5" />
                  )}
                  {provider === "Microsoft" && (
                    <img src="https://mailmeteor.com/logos/assets/PNG/Microsoft_Logo_512px.png" alt="" className="w-5 h-5" />
                  )}
                  {provider === "Apple" && (
                    <img src="https://cdn.freebiesupply.com/logos/thumbs/2x/apple-logo.png" alt="" className="w-5 h-5 object-cover" />
                  )}
                  <span className="text-sm">{provider}</span>
                </button>
              ))}
            </div>

            <p className="text-center mt-8 text-blue-300">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={toggleMode}
                className="text-blue-400 hover:text-blue-300 font-medium underline-offset-4 hover:underline"
                type="button"
              >
                {isLogin ? "Create account" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
