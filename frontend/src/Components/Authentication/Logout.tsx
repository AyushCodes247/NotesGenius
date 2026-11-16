import { useLayoutEffect, useRef, useState } from "react";
import { LogOut, LoaderCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import gsap from "gsap";

import api from "../../api/api";
import { useAppDispatch, useAppSelector } from "../../hooks/appHook";
import { logout, setError } from "../../slices/userSlice";

const Logout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const accessToken = useAppSelector((state) => state.user.accessToken);

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const button = buttonRef.current;
    const icon = iconRef.current;

    if (!button || !icon) return;

    const handleEnter = () => {
      if (isLoggingOut) return;

      gsap.to(button, {
        y: -1,
        duration: 0.2,
        ease: "power2.out",
      });

      gsap.to(icon, {
        x: 2,
        duration: 0.2,
        ease: "power2.out",
      });
    };

    const handleLeave = () => {
      gsap.to(button, {
        y: 0,
        duration: 0.2,
        ease: "power2.out",
      });

      gsap.to(icon, {
        x: 0,
        duration: 0.2,
        ease: "power2.out",
      });
    };

    button.addEventListener("mouseenter", handleEnter);
    button.addEventListener("mouseleave", handleLeave);

    return () => {
      button.removeEventListener("mouseenter", handleEnter);
      button.removeEventListener("mouseleave", handleLeave);
    };
  }, [isLoggingOut]);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    setLogoutError(null);

    try {
      await api.post(
        "/users/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      dispatch(logout());

      navigate("/", {
        replace: true,
      });
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ??
          "Unable to log out. Please try again.")
        : "Something went wrong. Please try again.";

      setLogoutError(message);
      dispatch(setError(message));
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        aria-label="Log out"
        className="
          group
          inline-flex
          h-10
          items-center
          justify-center
          gap-2
          rounded-lg
          border
          border-red-400/[0.14]
          bg-red-400/[0.035]
          px-4
          text-sm
          font-medium
          text-red-300/75
          outline-none
          transition-colors
          duration-200
          hover:border-red-400/[0.28]
          hover:bg-red-400/[0.07]
          hover:text-red-300
          focus-visible:ring-2
          focus-visible:ring-red-400/30
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        <span
          ref={iconRef}
          className="flex items-center justify-center"
          aria-hidden="true"
        >
          {isLoggingOut ? (
            <LoaderCircle size={17} className="animate-spin" />
          ) : (
            <LogOut
              size={17}
              strokeWidth={1.8}
              className="transition-transform duration-200"
            />
          )}
        </span>

        <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
      </button>

      {logoutError && (
        <p
          role="alert"
          className="max-w-[240px] text-xs leading-5 text-red-300/70"
        >
          {logoutError}
        </p>
      )}
    </div>
  );
};

export default Logout;
