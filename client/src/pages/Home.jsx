import Hero from "../components/Hero";
import FeatureSection from "../components/FeatureSection";
import Footer from "../components/Footer";
import "../index.css";

const Home = () => {
  return (
    <div className="bg-[#040a18] min-h-screen text-white [&::-webkit-scrollbar]:hidden">

        <Hero />

      <div id="features">
        <FeatureSection />
      </div>
      <Footer />
    </div>
  );
};

export default Home;
