import Link from "next/link";
import { Github, Globe, Instagram } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function Footer() {
  const t = await getTranslations("Footer");
  const year = new Date().getFullYear();

  return (
    <footer className="bg-black text-white border-t border-white/10 py-16 md:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          {/* Left Column */}
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              {t.rich("headline", {
                accent: (chunks) => (
                  <span style={{ color: "#14b8a6" }}>{chunks}</span>
                ),
              })}
            </h2>
            <p className="text-lg text-white/60 font-light leading-relaxed max-w-md">
              {t("body")}
            </p>
          </div>

          {/* Right Column */}
          <div className="flex flex-col md:items-end justify-center gap-8">
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <Link
                href="https://github.com/awras-ai"
                target="_blank"
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:border-[#14b8a6] hover:text-[#14b8a6] transition-colors"
                aria-label={t("socialGithub")}
              >
                <Github className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:border-[#14b8a6] hover:text-[#14b8a6] transition-colors"
                aria-label={t("socialWebsite")}
              >
                <Globe className="h-4 w-4" />
              </Link>
              <Link
                href="https://huggingface.co/awras"
                target="_blank"
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:border-[#14b8a6] hover:text-[#14b8a6] transition-colors"
                aria-label={t("socialHuggingFace")}
              >
                <img src="/hf-logo.svg" alt="" className="h-4 w-4" />
              </Link>
              <Link
                href="https://www.instagram.com/awras.ai/"
                target="_blank"
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:border-[#14b8a6] hover:text-[#14b8a6] transition-colors"
                aria-label={t("socialInstagram")}
              >
                <Instagram className="h-4 w-4" />
              </Link>
            </div>


          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-sm font-bold tracking-tighter">awras</span>
          <p className="text-sm text-white/40 font-light">
            {t("copyright", { year })}
          </p>
        </div>
      </div>
    </footer>
  );
}
