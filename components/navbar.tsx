import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg rounded-full max-w-4xl w-[calc(100%-3rem)]">
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
          <Button size="sm" className="rounded-full px-6 bg-black text-white hover:bg-neutral-800 transition-colors">
            Join Waitlist
          </Button>
        </Link>
      </div>
    </nav>
  );
}
