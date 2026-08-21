import { FileText } from "lucide-react";

interface LogoProps {
  size?: "sm" | "lg";
  className?: string;
}

const sizeConfig = {
  sm: {
    wrapper: "size-8",
    badge: "size-3.5",
    icon: "size-5",
  },
  lg: {
    wrapper: "size-12",
    badge: "size-5",
    icon: "size-7",
  },
};

function Logo({ size = "sm", className = "" }: LogoProps) {
  const config = sizeConfig[size];

  return (
    <div
      className={`relative flex items-center justify-center ${config.wrapper} ${className}`}
    >
      <div
        className={`absolute bottom-0 right-0 rotate-12 rounded-md bg-primary/30 ${config.badge}`}
      />

      <FileText
        className={`relative text-primary ${config.icon}`}
        strokeWidth={2}
      />
    </div>
  );
}

export default Logo;
