import Link from "next/link";
import { TrendingUp } from "lucide-react";

export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 hover:opacity-90 transition-opacity"
    >
      <TrendingUp className="w-6 h-6 text-primary" />
      <span className="font-bold text-lg">SEO Velocity</span>
    </Link>
  );
}
