import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../../hooks/appHook";
import { LoadingState } from "../ui/StateComponents";

const ProtectedRoute = () => {
  const { user, accessToken, isInitializing } = useAppSelector(
    (state) => state.user,
  );

  const location = useLocation();

  if (isInitializing) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#050505]">
        <LoadingState label="Restoring your session..." />
      </main>
    );
  }

  if (!user || !accessToken) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;