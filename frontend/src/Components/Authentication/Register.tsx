import { useLayoutEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import gsap from "gsap";

import { registerUser } from "../../api/userApi";
import { useAppDispatch, useAppSelector } from "../../hooks/appHook";
import { clearError } from "../../slices/userSlice";
import { SuccessToast } from "../ui/StateComponents";
import AuthScene from "../Authentication/AuthScene";

type RegisterFormData = {
  username: string;
  email: string;
  password: string;
  userhandle: string;
};

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [registerSucceeded, setRegisterSucceeded] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { loading, error } = useAppSelector((state) => state.user);

  const pageRef = useRef<HTMLElement>(null);
  const visualRef = useRef<HTMLElement>(null);
  const visualContentRef = useRef<HTMLDivElement>(null);
  const formPanelRef = useRef<HTMLElement>(null);
  const formContentRef = useRef<HTMLDivElement>(null);
  const passwordIconRef = useRef<HTMLButtonElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    mode: "onBlur",
    defaultValues: {
      username: "",
      email: "",
      password: "",
      userhandle: "",
    },
  });

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
      gsap.set(visual, {
        opacity: 0,
        scale: 1.015,
      });

      gsap.set(visualContent, {
        opacity: 0,
        y: 20,
      });

      gsap.set(formPanel, {
        opacity: 0,
        x: 20,
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
          scale: 1,
          duration: 1,
        })
        .to(
          visualContent,
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
          },
          "-=0.65",
        )
        .to(
          formPanel,
          {
            opacity: 1,
            x: 0,
            duration: 0.75,
          },
          "-=0.65",
        )
        .to(
          formContent,
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
          },
          "-=0.5",
        );
    }, page);

    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    const button = passwordIconRef.current;

    if (!button) return;

    gsap.to(button, {
      rotate: showPassword ? 8 : 0,
      duration: 0.25,
      ease: "power2.out",
    });
  }, [showPassword]);

  useLayoutEffect(() => {
    const button = submitButtonRef.current;

    if (!button) return;

    const ctx = gsap.context(() => {
      const enter = () => {
        if (isBusyRef.current) return;

        gsap.to(button, {
          y: -2,
          duration: 0.2,
          ease: "power2.out",
        });
      };

      const leave = () => {
        gsap.to(button, {
          y: 0,
          duration: 0.2,
          ease: "power2.out",
        });
      };

      button.addEventListener("mouseenter", enter);
      button.addEventListener("mouseleave", leave);

      return () => {
        button.removeEventListener("mouseenter", enter);
        button.removeEventListener("mouseleave", leave);
      };
    });

    return () => ctx.revert();
  }, []);

  const isBusyRef = useRef(false);

  const onSubmit = async (data: RegisterFormData) => {
    dispatch(clearError());
    clearErrors();

    const normalizedData: RegisterFormData = {
      username: data.username.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
      userhandle: data.userhandle.trim().replace(/^@/, "").toLowerCase(),
    };

    try {
      isBusyRef.current = true;

      await dispatch(registerUser(normalizedData)).unwrap();

      setRegisterSucceeded(true);

      window.setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 900);
    } catch (error: unknown) {
      const message =
        typeof error === "string"
          ? error
          : "Registration failed. Please try again.";

      setError("root", {
        type: "server",
        message,
      });

      isBusyRef.current = false;
    }
  };

  const isBusy = isSubmitting || loading || registerSucceeded;
  const formError = errors.root?.message ?? error;

  return (
    <main
      ref={pageRef}
      className="min-h-screen bg-[#080808] font-inter text-[#F5F5F5]"
    >
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Visual side */}
        <section
          ref={visualRef}
          className="relative hidden min-h-screen overflow-hidden border-r border-white/[0.08] lg:block"
        >
          <AuthScene />

          <div
            className="pointer-events-none absolute inset-0 bg-[#080808]/55"
            aria-hidden="true"
          />

          <div
            className="pointer-events-none absolute left-1/2 top-1/2 size-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#5B8CFF]/[0.08] blur-[140px]"
            aria-hidden="true"
          />

          <div
            ref={visualContentRef}
            className="relative z-10 flex min-h-screen flex-col justify-between p-10 xl:p-14"
          >
            <div>
              <Link
                to="/"
                className="inline-flex items-center gap-3 text-lg font-semibold tracking-tight text-white"
              >
                NoteGenius
              </Link>
            </div>

            <div className="max-w-lg">
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.22em] text-white/40">
                Build your learning workspace
              </p>

              <h2 className="max-w-md text-4xl font-semibold leading-[1.08] tracking-[-0.03em] text-white xl:text-5xl">
                Start learning smarter.
              </h2>

              <p className="mt-5 max-w-md text-sm leading-7 text-white/55 xl:text-base">
                Turn your study material into structured knowledge, useful
                discussions, and focused practice — all in one workspace.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs text-white/35">
              <span className="size-1.5 rounded-full bg-[#5B8CFF]" />
              Open source. Built for learners.
            </div>
          </div>
        </section>

        {/* Form side */}
        <section
          ref={formPanelRef}
          className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12 xl:px-16"
        >
          <div ref={formContentRef} className="w-full max-w-[420px]">
            <header className="mb-8">
              <Link
                to="/"
                className="mb-8 inline-flex items-center gap-3 text-lg font-semibold tracking-tight text-white lg:hidden"
              >
                <span className="flex size-9 items-center justify-center rounded-lg border border-white/[0.12] bg-white/[0.06]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="size-5"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14M5 6h14M5 18h8" />
                  </svg>
                </span>
                NoteGenius
              </Link>

              <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-[#5B8CFF]">
                Get started
              </p>

              <h1 className="text-3xl font-semibold tracking-[-0.025em] text-white sm:text-[34px]">
                Start learning smarter.
              </h1>

              <p className="mt-3 text-sm leading-6 text-white/45 sm:text-[15px]">
                Create your NoteGenius workspace and turn your study material
                into knowledge.
              </p>
            </header>

            {registerSucceeded && (
              <SuccessToast
                message="Account created successfully!"
                visible={true}
              />
            )}

            {formError && !registerSucceeded && (
              <div
                role="alert"
                className="mb-5 rounded-lg border border-red-400/15 bg-red-400/[0.06] px-4 py-3 text-sm text-red-300"
              >
                {formError}
              </div>
            )}

            <form
              id="fRegister"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-5"
            >
              <fieldset
                disabled={isBusy}
                className="min-w-0 space-y-5 disabled:opacity-70"
              >
                <legend className="sr-only">
                  Create your NoteGenius account
                </legend>

                {/* Username */}
                <div className="space-y-2">
                  <label
                    htmlFor="rUsername"
                    className="block text-sm font-medium text-white/75"
                  >
                    Username
                  </label>

                  <input
                    {...register("username", {
                      required: "Username is required",
                      setValueAs: (value: string) => value.trim(),
                      minLength: {
                        value: 3,
                        message: "Username must contain at least 3 characters",
                      },
                      maxLength: {
                        value: 30,
                        message: "Username cannot exceed 30 characters",
                      },
                      pattern: {
                        value: /^[a-zA-Z0-9]+(?:_[a-zA-Z0-9]+)*$/,
                        message:
                          "Username can contain only letters, numbers, and single underscores.",
                      },
                    })}
                    id="rUsername"
                    type="text"
                    autoComplete="username"
                    placeholder="Choose a username"
                    aria-invalid={Boolean(errors.username)}
                    aria-describedby={
                      errors.username ? "rUsernameError" : undefined
                    }
                    className={`h-12 w-full rounded-lg border bg-white/[0.035] px-4 text-sm text-white outline-none transition placeholder:text-white/20 hover:border-white/[0.18] focus:bg-white/[0.05] focus:ring-4 focus:ring-[#5B8CFF]/[0.08] ${
                      errors.username
                        ? "border-red-400/60 focus:border-red-400"
                        : "border-white/[0.10] focus:border-[#5B8CFF]/70"
                    }`}
                  />

                  {errors.username && (
                    <p
                      id="rUsernameError"
                      className="text-xs text-red-300"
                      role="alert"
                    >
                      {errors.username.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label
                    htmlFor="rEmail"
                    className="block text-sm font-medium text-white/75"
                  >
                    Email
                  </label>

                  <input
                    {...register("email", {
                      required: "Email is required",
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
                    id="rEmail"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "rEmailError" : undefined}
                    className={`h-12 w-full rounded-lg border bg-white/[0.035] px-4 text-sm text-white outline-none transition placeholder:text-white/20 hover:border-white/[0.18] focus:bg-white/[0.05] focus:ring-4 focus:ring-[#5B8CFF]/[0.08] ${
                      errors.email
                        ? "border-red-400/60 focus:border-red-400"
                        : "border-white/[0.10] focus:border-[#5B8CFF]/70"
                    }`}
                  />

                  {errors.email && (
                    <p
                      id="rEmailError"
                      className="text-xs text-red-300"
                      role="alert"
                    >
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Userhandle */}
                <div className="space-y-2">
                  <label
                    htmlFor="rUserhandle"
                    className="block text-sm font-medium text-white/75"
                  >
                    Userhandle
                  </label>

                  <input
                    {...register("userhandle", {
                      required: "Userhandle is required",
                      setValueAs: (value: string) =>
                        value.trim().replace(/^@/, "").toLowerCase(),
                      minLength: {
                        value: 3,
                        message:
                          "Userhandle must contain at least 3 characters",
                      },
                      maxLength: {
                        value: 30,
                        message: "Userhandle cannot exceed 30 characters",
                      },
                      pattern: {
                        value: /^[a-z0-9]+(?:_[a-z0-9]+)*$/,
                        message:
                          "Userhandle can contain only lowercase letters, numbers, and single underscores.",
                      },
                    })}
                    id="rUserhandle"
                    type="text"
                    autoComplete="username"
                    placeholder="@your_handle"
                    aria-invalid={Boolean(errors.userhandle)}
                    aria-describedby={
                      errors.userhandle ? "rUserhandleError" : undefined
                    }
                    className={`h-12 w-full rounded-lg border bg-white/[0.035] px-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:bg-white/[0.05] focus:ring-4 focus:ring-[#5B8CFF]/[0.08] ${
                      errors.userhandle
                        ? "border-red-400/60 focus:border-red-400"
                        : "border-white/[0.10] focus:border-[#5B8CFF]/70"
                    }`}
                  />

                  <p className="text-xs text-white/30">
                    Used when sharing notes with other learners.
                  </p>

                  {errors.userhandle && (
                    <p
                      id="rUserhandleError"
                      className="text-xs text-red-300"
                      role="alert"
                    >
                      {errors.userhandle.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label
                    htmlFor="rPassword"
                    className="block text-sm font-medium text-white/75"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <input
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 8,
                          message:
                            "Password must contain at least 8 characters",
                        },
                        maxLength: {
                          value: 128,
                          message: "Password cannot exceed 128 characters",
                        },
                        validate: {
                          lowercase: (value) =>
                            /[a-z]/.test(value) ||
                            "Password must contain at least one lowercase letter",
                          uppercase: (value) =>
                            /[A-Z]/.test(value) ||
                            "Password must contain at least one uppercase letter",
                          number: (value) =>
                            /[0-9]/.test(value) ||
                            "Password must contain at least one number",
                          special: (value) =>
                            /[^A-Za-z0-9\s]/.test(value) ||
                            "Password must contain at least one special character",
                          noWhitespace: (value) =>
                            /^\S+$/.test(value) ||
                            "Password cannot contain whitespace",
                        },
                      })}
                      id="rPassword"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Create a password"
                      aria-invalid={Boolean(errors.password)}
                      aria-describedby={
                        errors.password ? "rPasswordError" : undefined
                      }
                      className={`h-12 w-full rounded-lg border bg-white/[0.035] px-4 pr-12 text-sm text-white outline-none transition placeholder:text-white/20 hover:border-white/[0.18] focus:bg-white/[0.05] focus:ring-4 focus:ring-[#5B8CFF]/[0.08] ${
                        errors.password
                          ? "border-red-400/60 focus:border-red-400"
                          : "border-white/[0.10] focus:border-[#5B8CFF]/70"
                      }`}
                    />

                    <button
                      ref={passwordIconRef}
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      className="absolute inset-y-0 right-3 flex items-center justify-center text-white/35 transition hover:text-white focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B8CFF]/50"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      aria-controls="rPassword"
                      aria-pressed={showPassword}
                    >
                      {showPassword ? (
                        <EyeOff size={18} aria-hidden="true" />
                      ) : (
                        <Eye size={18} aria-hidden="true" />
                      )}
                    </button>
                  </div>

                  {errors.password && (
                    <p
                      id="rPasswordError"
                      className="text-xs text-red-300"
                      role="alert"
                    >
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </fieldset>

              <button
                ref={submitButtonRef}
                type="submit"
                disabled={isBusy}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#5B8CFF] px-4 text-sm font-semibold text-white shadow-lg shadow-[#5B8CFF]/10 transition hover:bg-[#7AA3FF] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#5B8CFF]/20 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isBusy && !registerSucceeded && (
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                    aria-hidden="true"
                  />
                )}

                {registerSucceeded
                  ? "Account created!"
                  : isBusy
                    ? "Creating account..."
                    : "Create account"}
              </button>
            </form>

            <footer className="mt-7 text-center text-sm text-white/35">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-white/70 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B8CFF]/50"
              >
                Sign in
              </Link>
            </footer>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Register;
