import Link from "next/link";

type ButtonProps = {
  children: React.ReactNode;
  href: string;
  variant?: "primary" | "ghost";
  className?: string;
};

const sharedClasses =
  "inline-flex items-center justify-center px-6 py-3.5 text-[12px] font-medium uppercase tracking-[0.12em] transition-colors duration-200";

const variantClasses = {
  primary: "bg-rose-profond text-white hover:bg-sauge-fonce",
  ghost: "border border-white/70 text-white hover:bg-white/10",
};

export default function Button({
  children,
  href,
  variant = "primary",
  className,
}: ButtonProps) {
  return (
    <Link
      href={href}
      className={`${sharedClasses} ${variantClasses[variant]} ${className ?? ""}`}
    >
      {children}
    </Link>
  );
}
