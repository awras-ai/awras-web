import Link from "next/link";
import { Github, Twitter, Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-black text-white border-t border-black/20 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 bg-white rounded-xl flex items-center justify-center">
                <span className="font-black text-black text-sm">A</span>
              </div>
              <span className="font-black text-xl">Awras</span>
            </div>
            <p className="text-sm text-white/60 font-light">
              Building the future of AI for Algerian dialect.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4 uppercase tracking-wide">
              Connect
            </h4>
            <div className="flex items-center gap-6">
              {/* <Link */}
              {/*   href="#" */}
              {/*   className="text-white/60 hover:text-white transition-colors" */}
              {/* > */}
              {/*   <span className="sr-only">Twitter</span> */}
              {/*   <Twitter className="h-5 w-5" /> */}
              {/* </Link> */}
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

          <div className="text-right md:text-left">
            <p className="text-sm text-white/60 font-light">
              © {new Date().getFullYear()} Awras Project. Built for Algeria 🇩🇿
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8">
          <p className="text-xs text-white/40 font-light text-center">
            Preserving the Algerian dialect through AI innovation
          </p>
        </div>
      </div>
    </footer>
  );
}
