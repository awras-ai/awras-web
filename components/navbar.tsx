import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/50 backdrop-blur-md border-b border-neutral-200/50">
      <div className="flex items-center gap-2">
        <Link href="/" className="text-xl font-bold tracking-tighter">
          Awras
        </Link>
      </div>
      <div className="flex items-center gap-6">
        <Link
          href="#vision"
          className="text-sm font-medium hover:text-neutral-600 transition-colors"
        >
          Vision
        </Link>
        <Link href="#waitlist">
          <Button size="sm" className="rounded-full px-6">
            Join Waitlist
          </Button>
        </Link>
      </div>
    </nav>
  );
}
