import FlutedScene from "../HomePage/Three/FlutedGlass";

import authTexture from "../../assets/login.jpg";

const AuthScene = () => {
  return (
    <FlutedScene
      texture={authTexture}
      segments={72}
      rotation={0.12}
      overlayOpacity={22}
    />
  );
};

export default AuthScene;