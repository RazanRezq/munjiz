import { BackgroundLines } from "@/components/ui/background-lines";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <BackgroundLines
      className="min-h-screen flex items-center justify-center overflow-hidden"
      svgOptions={{ duration: 12 }}
    >
      {/* Animated gradient orbs for depth and color */}
      <div className="absolute inset-0 z-0">
        {/* Primary purple orb - top left */}
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl animate-pulse"
          style={{
            background:
              "radial-gradient(circle, oklch(0.6393 0.1662 283.415 / 0.25) 0%, transparent 70%)",
            animationDuration: "8s",
          }}
        />

        {/* Teal orb - bottom right */}
        <div
          className="absolute -bottom-32 -right-32 w-md h-112 rounded-full blur-3xl animate-pulse"
          style={{
            background:
              "radial-gradient(circle, oklch(0.8067 0.1417 182.18 / 0.19) 0%, transparent 70%)",
            animationDuration: "10s",
            animationDelay: "1s",
          }}
        />

        {/* Gold accent orb - top right */}
        <div
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-3xl animate-pulse"
          style={{
            background:
              "radial-gradient(circle, oklch(0.8094 0.1499 76.4155 / 0.15) 0%, transparent 70%)",
            animationDuration: "9s",
            animationDelay: "2s",
          }}
        />

        {/* Secondary purple orb - bottom left */}
        <div
          className="absolute bottom-20 left-20 w-72 h-72 rounded-full blur-3xl animate-pulse"
          style={{
            background:
              "radial-gradient(circle, oklch(0.6393 0.1662 283.415 / 0.19) 0%, transparent 70%)",
            animationDuration: "11s",
            animationDelay: "3s",
          }}
        />
      </div>

      {/* Subtle dot grid pattern overlay */}
      <div
        className="absolute inset-0 z-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle, oklch(0.6393 0.1662 283.415) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Radial vignette overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `radial-gradient(circle at 50% 50%, transparent 0%, hsl(var(--background) / 0.4) 100%)`,
        }}
      />

      {/* Content container with glassmorphism */}
      <div className="relative z-10 w-full max-w-md px-4">{children}</div>
    </BackgroundLines>
  );
};

export default AuthLayout;
