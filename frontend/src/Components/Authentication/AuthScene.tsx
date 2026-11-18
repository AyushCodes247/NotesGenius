import { lazy, Suspense } from "react";

import authTexture from "../../assets/login.jpg";

const FlutedScene = lazy(() => import("../HomePage/Three/FlutedGlass"));

const AuthScene = () => {
  return (
    <Suspense fallback={null}>
      <FlutedScene
        texture={authTexture}
        segments={72}
        rotation={0.12}
        overlayOpacity={22}
      />
    </Suspense>
  );
};

export default AuthScene;
