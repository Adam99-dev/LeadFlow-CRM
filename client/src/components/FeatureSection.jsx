
const FeaturesSection = () => {
  return (
    <div className="bg-[#040a18] py-15 px-6 relative overflow-hidden" id="features">
      {/* FEATURES SECTION */}
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block mt-20 bg-purple-900/30 text-purple-400 text-sm font-medium px-6 py-2 rounded-full border border-purple-800">
            FEATURES
          </span>
          <h2 className="text-5xl md:text-6xl font-bold text-white mt-6 leading-tight">
            Everything you need to grow
            <br />
            your{" "}
            <span className="bg-gradient-to-r from-violet-600 to-violet-700 bg-clip-text text-transparent">
              business
            </span>
          </h2>
        </div>

        {/* Feature Cards - Using Map */}
        <div className="">
          <div className="bg-[#040a18]"></div>
        </div>

        {/* DASHBOARD PREVIEW SECTION */}
        <div className="mt-28 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-900/30 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-2 border border-purple-800">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  <span className="inline-block  text-purple-400 text-sm font-medium p-0.5 rounded-full  ">
                    DASHBOARD PREVIEW
                  </span>
                </div>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
                Get a complete overview
                <br />
                of your <span className="text-purple-500">business</span>
              </h2>

              <p className="text-gray-400 text-lg mb-8">
                Track your leads, tasks, team performance and revenue – all in
                one beautiful dashboard.
              </p>

              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-gray-300">
                  <span className="text-purple-500 mt-1">✔</span>
                  Real-time metrics and analytics
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <span className="text-purple-500 mt-1">✔</span>
                  Interactive charts and reports
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <span className="text-purple-500 mt-1">✔</span>
                  Customizable dashboards
                </li>
              </ul>
            </div>

            {/* Right Side - Dashboard Mockup */}
            <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="./Dashboard.png"
                className="w-full h-full border-0"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;
