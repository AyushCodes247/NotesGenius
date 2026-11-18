import { lazy, Suspense } from "react";

const FlutedScene = lazy(() => import("./FlutedGlass"));

const HeroScene = () => {
  return (
    <Suspense fallback={null}>
      <FlutedScene />
    </Suspense>
  );
};

export default HeroScene;
