import { useEffect, type ReactNode } from "react";
import { useAppDispatch } from "../../hooks/appHook";
import { refreshSession } from "../../api/userApi";

interface AuthInitializerProps {
  children: ReactNode;
}

const AuthInitializer = ({ children }: AuthInitializerProps) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    void dispatch(refreshSession());
  }, [dispatch]);

  return <>{children}</>;
};

export default AuthInitializer;