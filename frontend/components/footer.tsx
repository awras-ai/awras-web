import Link from "next/link";
import { Github, Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-black text-white border-t border-black/20 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Logo & Description */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 bg-white rounded-xl flex items-center justify-center">
                <span className="font-black text-black text-sm">A</span>
              </div>
              <span className="font-black text-xl">Awras</span>
            </div>
            <p className="text-sm text-white/60 font-light">
              An open-source initiative for Algerian AI models.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold text-sm mb-4 uppercase tracking-wide">
              Navigate
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-white/60 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="#vision" className="text-sm text-white/60 hover:text-white transition-colors">
                  Vision
                </Link>
              </li>
              <li>
                <Link href="#process" className="text-sm text-white/60 hover:text-white transition-colors">
                  Process
                </Link>
              </li>
              <li>
                <Link href="#faq" className="text-sm text-white/60 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-sm mb-4 uppercase tracking-wide">
              Resources
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="https://github.com/awras-ai" className="text-sm text-white/60 hover:text-white transition-colors">
                  GitHub
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-white/60 hover:text-white transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-white/60 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-semibold text-sm mb-4 uppercase tracking-wide">
              Connect
            </h4>
            <div className="flex items-center gap-6">
              <Link
                href="https://github.com/awras-ai"
                className="text-white/60 hover:text-white transition-colors"
              >
                <span className="sr-only">GitHub</span>
                <Github className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-white/60 hover:text-white transition-colors"
              >
                <span className="sr-only">Website</span>
                <Globe className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8">
          <p className="text-xs text-white/40 font-light text-center">
            © {new Date().getFullYear()} Awras. All rights reserved. Built for Algeria 🇩🇿
          </p>
        </div>
      </div>
    </footer>
  );
}
