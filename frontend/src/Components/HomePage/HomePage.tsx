import { useCallback, useEffect, useState } from "react";

import Navbar from "./NavBar";
import Hero from "./Hero";
import HowItWorks from "./HowItWorks";
import Features from "./Features";
import About from "./About";
import Footer from "./Footer";
import HomeLoader from "./HomeLoader";

import { preloadHomeAssets } from "../../utils/preloadHomeAssets";

const Home = () => {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showLoader, setShowLoader] = useState(true);

  const handleLoaderComplete = useCallback(() => {
    setShowLoader(false);
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadHome = async () => {
      await preloadHomeAssets((value) => {
        if (!mounted) {
          return;
        }

        setProgress(value);
      });

      if (mounted) {
        setIsLoaded(true);
      }
    };

    loadHome();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#080808] text-[#F5F5F5]">
      {showLoader && (
        <HomeLoader
          progress={progress}
          isComplete={isLoaded}
          onComplete={handleLoaderComplete}
        />
      )}

      <Navbar />

      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <About />
      </main>

      <Footer />
    </div>
  );
};

export default Home;
