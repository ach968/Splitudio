import { twMerge } from "tailwind-merge";

export default function PremiumText({ className }: { className?: string }) {
  return (
    <span
      className={twMerge(
        "premium-gradient text-transparent bg-clip-text premium-background",
        className
      )}
    >
      Premium
    </span>
  );
}
