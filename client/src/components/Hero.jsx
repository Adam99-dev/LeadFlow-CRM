import {
  Star,
  UsersRound,
  ChartSpline,
  Workflow,
  Lock,
  LocateFixed,
  Play,
  MoveRight,
  BadgePlus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#040a18] pt-20 overflow-hidden relative mb-10 [&::-webkit-scrollbar]:hidden">
      {/* Background Glows */}
      <div className="absolute bottom-10 right-16 w-[250px] h-[175px] bg-blue-700 rounded-full blur-3xl opacity-30" />

      <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-12 items-center pt-16">
        {/* Left Content */}
        <div className="space-y-8">
          <div className="inline-flex items-center bg-purple-900/30 text-purple-400 text-sm font-medium px-6 py-2 rounded-full border border-purple-800">
            <Star
              className="text-yellow-600 w-4 h-4 mr-3 animate-pulse"
              fill="gold"
            />
            <span>All-in-One CRM & Workflow Platform</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold leading-tight">
            Manage Leads,
            <br />
            Teams &<br />
            <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              Manufacturing
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-600 to-violet-700 bg-clip-text text-transparent">
              Workflows
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-lg">
            The modern CRM to streamline your leads, empower your team and track
            every step of your manufacturing journey.
          </p>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-3">
              <UsersRound className="w-5 h-5" /> Lead Management
            </div>
            <div className="flex items-center gap-3">
              <UsersRound className="w-5 h-5" /> Team Collaboration
            </div>
            <div className="flex items-center gap-3">
              <ChartSpline className="w-5 h-5" /> Analytics & Reports
            </div>
            <div className="flex items-center gap-3">
              <Workflow className="w-5 h-5" /> Workflow Automation
            </div>
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5" /> Secure & Scalable
            </div>
            <div className="flex items-center gap-3">
              <LocateFixed className="w-5 h-5" /> Real-time Tracking
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/auth")}
              className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 px-8 py-4 rounded-xl font-semibold text-lg flex items-center gap-2 transition-all"
            >
              Get Started <MoveRight className="w-4 h-4" />
            </button>
            <button className="ml-25 border border-white/30 hover:bg-white/10 px-8 py-4 rounded-xl font-medium flex items-center gap-2 transition-all">
              <Play className="w-4 h-4" /> Live Demo
            </button>
          </div>

          {/* Trust Bar */}
          <div className="flex items-center gap-4 pt-6">
            <div className="flex -space-x-3">
              {[
                "https://img.magnific.com/free-photo/closeup-young-female-professional-making-eye-contact-against-colored-background_662251-651.jpg?semt=ais_hybrid&w=740&q=80",
                "https://img.magnific.com/free-photo/smiling-businessman-face-portrait-wearing-suit_53876-148135.jpg?semt=ais_hybrid&w=740&q=80",
                "https://img.freepik.com/free-photo/business-finance-employment-female-successful-entrepreneurs-concept-smiling-professional-female-office-manager-ceo-e-commerce-company-looking-pleased-camera-white-background_1258-59171.jpg?semt=ais_hybrid&w=740&q=80",
                "https://img.magnific.com/free-photo/happy-businessman-smiling-camera_1163-4660.jpg?semt=ais_hybrid&w=740&q=80",
              ].map((idx, i) => (
                <img
                  key={idx}
                  src={i}
                  className="object-cover w-8 h-8 rounded-full border-2 border-black bg-gradient-to-br from-purple-400 to-pink-400"
                />
              ))}
              <div className="flex justify-center items-center w-8 h-8 rounded-full border-2 border-black bg-gradient-to-br from-purple-400 to-pink-400">
                <BadgePlus className="w-8 h-8" />
              </div>
            </div>
            <p className="text-gray-400">
              Trusted by{" "}
              <span className="text-white font-semibold">2,000+</span> teams
              worldwide
            </p>
          </div>
        </div>

        {/* Dashboard Image Container - Enlarged */}
        <div className="flex justify-center items-center relative p-2">
          {/* Dashboard Container */}
          <div className="tilted-dashboard relative z-10 rounded-3xl overflow-hidden shadow-2xl scale-105 max-w-6xl">
            <img
              src="./Dashboard.png"
              alt="LeadFlow Dashboard"
              className="object-cover rounded-3xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
