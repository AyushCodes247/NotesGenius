import { useLayoutEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import gsap from "gsap";

import { useAppDispatch, useAppSelector } from "../../hooks/appHook";
import { clearError } from "../../slices/userSlice";
import { loginUser, type LoginInput } from "../../api/userApi";
import { SuccessToast } from "../ui/StateComponents";
import AuthScene from "../Authentication/AuthScene";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loginSucceeded, setLoginSucceeded] = useState(false);

  const pageRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const visualContentRef = useRef<HTMLDivElement>(null);
  const formPanelRef = useRef<HTMLDivElement>(null);
  const formContentRef = useRef<HTMLDivElement>(null);
  const passwordIconRef = useRef<HTMLButtonElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { loading, error } = useAppSelector((state) => state.user);

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  /*
   * --------------------------------------------------------------------------
   * Page entrance
   * --------------------------------------------------------------------------
   */

  useLayoutEffect(() => {
    const page = pageRef.current;
    const visual = visualRef.current;
    const visualContent = visualContentRef.current;
    const formPanel = formPanelRef.current;
    const formContent = formContentRef.current;

    if (!page || !visual || !visualContent || !formPanel || !formContent) {
      return;
    }

    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const duration = prefersReducedMotion ? 0 : 0.8;

      gsap.set(visual, {
        opacity: 0,
        x: -24,
      });

      gsap.set(visualContent, {
        opacity: 0,
        y: 20,
      });

      gsap.set(formPanel, {
        opacity: 0,
        x: 24,
      });

      gsap.set(formContent, {
        opacity: 0,
        y: 14,
      });

      const timeline = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });

      timeline
        .to(visual, {
          opacity: 1,
          x: 0,
          duration,
        })
        .to(
          visualContent,
          {
            opacity: 1,
            y: 0,
            duration: prefersReducedMotion ? 0 : 0.65,
          },
          "-=0.5",
        )
        .to(
          formPanel,
          {
            opacity: 1,
            x: 0,
            duration,
          },
          "-=0.6",
        )
        .to(
          formContent,
          {
            opacity: 1,
            y: 0,
            duration: prefersReducedMotion ? 0 : 0.6,
          },
          "-=0.5",
        );
    }, page);

    return () => ctx.revert();
  }, []);

  /*
   * --------------------------------------------------------------------------
   * Navigate after successful login
   * --------------------------------------------------------------------------
   */

  useLayoutEffect(() => {
    if (!loginSucceeded) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      navigate("/dashboard", {
        replace: true,
      });
    }, 900);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loginSucceeded, navigate]);

  /*
   * --------------------------------------------------------------------------
   * Submit
   * --------------------------------------------------------------------------
   */

  const onSubmit = async (data: LoginInput) => {
    clearErrors();
    dispatch(clearError());

    setShowSuccess(false);
    setLoginSucceeded(false);

    const normalizedData: LoginInput = {
      email: data.email.trim().toLowerCase(),
      password: data.password,
    };

    try {
      await dispatch(loginUser(normalizedData)).unwrap();

      setShowSuccess(true);
      setLoginSucceeded(true);
    } catch (error: unknown) {
      const message =
        typeof error === "string"
          ? error
          : "Unable to sign in. Please try again.";

      setError("root", {
        message,
      });
    }
  };

  const formError = errors.root?.message ?? error;

  /*
   * --------------------------------------------------------------------------
   * Password visibility
   * --------------------------------------------------------------------------
   */

  const togglePassword = () => {
    setShowPassword((visible) => !visible);

    if (!passwordIconRef.current) {
      return;
    }

    gsap.fromTo(
      passwordIconRef.current,
      {
        scale: 0.85,
        rotate: -8,
      },
      {
        scale: 1,
        rotate: 0,
        duration: 0.3,
        ease: "back.out(2)",
      },
    );
  };

  /*
   * --------------------------------------------------------------------------
   * Submit button hover
   * --------------------------------------------------------------------------
   */

  const handleSubmitEnter = () => {
    if (!submitButtonRef.current || isSubmitting || loading || loginSucceeded) {
      return;
    }

    gsap.to(submitButtonRef.current, {
      y: -2,
      duration: 0.25,
      ease: "power2.out",
    });
  };

  const handleSubmitLeave = () => {
    if (!submitButtonRef.current) {
      return;
    }

    gsap.to(submitButtonRef.current, {
      y: 0,
      duration: 0.25,
      ease: "power2.out",
    });
  };

  const isLoading = isSubmitting || loading;

  return (
    <div
      ref={pageRef}
      className="min-h-screen overflow-hidden bg-[#080808] text-[#F5F5F5]"
    >
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* ---------------------------------------------------------------- */}
        {/* Left visual                                                      */}
        {/* ---------------------------------------------------------------- */}

        <section
          ref={visualRef}
          className="relative hidden min-h-screen overflow-hidden border-r border-white/[0.08] lg:block"
        >
          {/* Reusable fluted glass scene */}
          <AuthScene />

          {/* Dark overlay */}
          <div
            className="pointer-events-none absolute inset-0 bg-[#080808]/55"
            aria-hidden="true"
          />

          {/* Blue ambient light */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 size-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#5B8CFF]/[0.08] blur-[140px]"
            aria-hidden="true"
          />

          <div
            ref={visualContentRef}
            className="relative z-10 flex min-h-screen flex-col justify-between p-10 xl:p-14"
          >
            {/* Brand */}
            <Link
              to="/"
              className="w-fit text-lg font-semibold tracking-[-0.04em] text-white"
            >
              NoteGenius
            </Link>

            {/* Message */}
            <div className="max-w-xl">
              <p className="mb-5 text-xs font-medium uppercase tracking-[0.18em] text-[#7AA3FF]/80">
                AI-powered study workspace
              </p>

              <h1 className="max-w-lg text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-white xl:text-5xl">
                Your knowledge,
                <br />
                waiting for you.
              </h1>

              <p className="mt-6 max-w-md text-sm leading-7 text-white/50">
                Return to your notes, discussions, quizzes, and everything
                you've built inside your learning workspace.
              </p>
            </div>

            {/* Bottom metadata */}
            <div className="flex items-center gap-3 text-xs text-white/35">
              <span>Open Source</span>

              <span
                className="size-1 rounded-full bg-white/20"
                aria-hidden="true"
              />

              <span>Built for Learners</span>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Right form                                                       */}
        {/* ---------------------------------------------------------------- */}

        <section
          ref={formPanelRef}
          className="relative flex min-h-screen items-center justify-center px-6 py-12 sm:px-10 lg:px-12 xl:px-20"
        >
          <div ref={formContentRef} className="w-full max-w-[420px]">
            {/* Mobile brand */}
            <Link
              to="/"
              className="mb-14 block w-fit text-lg font-semibold tracking-[-0.04em] text-white lg:hidden"
            >
              NoteGenius
            </Link>

            {/* Heading */}
            <div className="mb-9">
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-[#7AA3FF]/80">
                Welcome back
              </p>

              <h2 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                Continue learning.
              </h2>

              <p className="mt-3 max-w-sm text-sm leading-6 text-white/40">
                Sign in to your NoteGenius workspace and pick up where you left
                off.
              </p>
            </div>

            {/* Form */}
            <form
              id="fLogin"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-5"
            >
              <fieldset
                disabled={isLoading || loginSucceeded}
                className="min-w-0 space-y-5 disabled:opacity-70"
              >
                <legend className="sr-only">Sign in to NoteGenius</legend>

                {/* Email */}
                <div className="space-y-2">
                  <label
                    htmlFor="le"
                    className="block text-xs font-medium text-white/65"
                  >
                    Email
                  </label>

                  <input
                    {...register("email", {
                      required: "Please provide a valid email address",
                      setValueAs: (value: string) => value.trim().toLowerCase(),
                      maxLength: {
                        value: 254,
                        message: "Email cannot exceed 254 characters",
                      },
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Please provide a valid email address",
                      },
                    })}
                    id="le"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "le-error" : undefined}
                    className={`h-12 w-full rounded-lg border bg-white/[0.035] px-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/20 ${
                      errors.email
                        ? "border-red-400/50 focus:border-red-400/70"
                        : "border-white/[0.1] hover:border-white/[0.18] focus:border-[#5B8CFF]/60 focus:bg-white/[0.045]"
                    }`}
                  />

                  {errors.email && (
                    <p
                      id="le-error"
                      role="alert"
                      className="text-xs text-red-300/75"
                    >
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="lp"
                      className="block text-xs font-medium text-white/65"
                    >
                      Password
                    </label>

                    <Link
                      to="/forgot-password"
                      className="text-xs text-white/30 transition-colors hover:text-[#7AA3FF]"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <div className="relative">
                    <input
                      {...register("password", {
                        required: "Password is required",
                        maxLength: {
                          value: 128,
                          message: "Password cannot exceed 128 characters",
                        },
                      })}
                      id="lp"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Your password"
                      aria-invalid={Boolean(errors.password)}
                      aria-describedby={
                        errors.password ? "lp-error" : undefined
                      }
                      className={`h-12 w-full rounded-lg border bg-white/[0.035] px-4 pr-12 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/20 ${
                        errors.password
                          ? "border-red-400/50 focus:border-red-400/70"
                          : "border-white/[0.1] hover:border-white/[0.18] focus:border-[#5B8CFF]/60 focus:bg-white/[0.045]"
                      }`}
                    />

                    <button
                      ref={passwordIconRef}
                      type="button"
                      onClick={togglePassword}
                      className="absolute inset-y-0 right-3 flex items-center justify-center rounded-md px-1.5 text-white/30 transition-colors hover:text-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B8CFF]/60"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      aria-controls="lp"
                      aria-pressed={showPassword}
                    >
                      {showPassword ? (
                        <EyeOff
                          size={17}
                          strokeWidth={1.7}
                          aria-hidden="true"
                        />
                      ) : (
                        <Eye size={17} strokeWidth={1.7} aria-hidden="true" />
                      )}
                    </button>
                  </div>

                  {errors.password && (
                    <p
                      id="lp-error"
                      role="alert"
                      className="text-xs text-red-300/75"
                    >
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </fieldset>

              {/* Server error */}
              {formError && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-lg border border-red-400/[0.14] bg-red-400/[0.045] px-3.5 py-3 text-sm leading-5 text-red-200/80"
                >
                  <span
                    className="mt-0.5 size-1.5 shrink-0 rounded-full bg-red-300/70"
                    aria-hidden="true"
                  />

                  <span>{formError}</span>
                </div>
              )}

              {/* Submit */}
              <button
                ref={submitButtonRef}
                type="submit"
                disabled={isLoading || loginSucceeded}
                onMouseEnter={handleSubmitEnter}
                onMouseLeave={handleSubmitLeave}
                className="relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-[#5B8CFF] px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#6D9AFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B8CFF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <LoaderCircle
                      aria-hidden="true"
                      size={16}
                      strokeWidth={1.8}
                      className="animate-spin"
                    />
                    Signing in...
                  </>
                ) : loginSucceeded ? (
                  "Signed in successfully"
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            {/* Register */}
            <p className="mt-7 text-center text-sm text-white/30">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-white/65 transition-colors hover:text-[#7AA3FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B8CFF]/60"
              >
                Create an account
              </Link>
            </p>
          </div>
        </section>
      </div>

      <SuccessToast
        visible={showSuccess}
        message="Welcome back. Login successful."
        onClose={() => setShowSuccess(false)}
      />
    </div>
  );
};

export default Login;
