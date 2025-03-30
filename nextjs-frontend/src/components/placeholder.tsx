import { Check } from "lucide-react";
import PremiumText from "./premium-text";

<div className="flex flex-col gap-2">
  <div>
    <PremiumText className="text-2xl" />
  </div>
  <span className="flex gap-1 items-baseline">
    <p className="text-white text-5xl">$5</p>
    <p className="text-neutral-400">/month</p>
  </span>
  <p className="text-neutral-400 flex gap-1 items-center text-sm">
    <Check className="w-5 h-5" />
    Unlimited projects
  </p>
  <p className="text-neutral-400 flex gap-1 items-center text-sm">
    <Check className="w-5 h-5" />
    Cancel anytime
  </p>
</div>;
