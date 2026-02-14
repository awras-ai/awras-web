import Link from "next/link";
import { Github, Globe, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-black text-white border-t border-black/20 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Left Column - Logo & Description */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-black text-xl">awras</span>
            </div>
            <p className="text-sm text-white/60 font-light">
              An initiative for Algerian AI models.
            </p>
          </div>

          {/* Right Column - Links & Copyright */}
          <div className="flex flex-col items-start md:items-end justify-center">
            <div className="flex items-center gap-2 text-sm text-white/60 mb-2">
              <Link
                href="https://github.com/awras-ai"
                target="_blank"
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                <Github className="h-4 w-4" />
                GitHub
              </Link>
              <span>·</span>
              <Link
                href="#"
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                <Globe className="h-4 w-4" />
                Website
              </Link>
              <span>·</span>
              <Link
                href="https://huggingface.co/awras"
                target="_blank"
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                <img src="/hf-logo.svg" alt="HuggingFace" className="h-4 w-4" />
                HuggingFace
              </Link>
              <span>·</span>
              <Link
                href="https://www.instagram.com/awras.ai/"
                target="_blank"
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                <Instagram className="h-4 w-4" />
                Instagram
              </Link>
            </div>
            <p className="text-sm text-white/60 font-light">
              © {new Date().getFullYear()} Awras. All rights reserved. Built
              for Algeria 🇩🇿
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
