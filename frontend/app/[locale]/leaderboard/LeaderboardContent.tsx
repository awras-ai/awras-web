"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowRight, Crown, Loader2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useLeaderboard } from "@/hooks/useLeaderboard";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function LeaderboardContent() {
  const t = useTranslations("Leaderboard");
  const { data, isLoading } = useLeaderboard(15);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2
          className="h-8 w-8 animate-spin"
          style={{ color: "#14b8a6" }}
        />
      </div>
    );
  }

  const entries = data ?? [];

  if (entries.length === 0) {
    return (
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <p className="text-xs font-semibold text-black/40 tracking-widest uppercase mb-3">
          {t("label")}
        </p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-12">
          {t.rich("headline", {
            accent: (chunks) => (
              <span style={{ color: "#14b8a6" }}>{chunks}</span>
            ),
          })}
        </h1>
        <p className="text-sm text-black/40">{t("noData")}</p>

        <div className="mt-16 text-center">
          <Link
            href="/annotation"
            className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white rounded-full font-semibold text-base hover:scale-105 transition-transform"
          >
            {t("cta")}
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-4 text-sm text-black/40">{t("ctaDescription")}</p>
        </div>
      </main>
    );
  }

  const [first, ...rest] = entries;

  return (
    <div>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-xs font-semibold text-black/40 tracking-widest uppercase mb-3">
            {t("label")}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-12">
            {t.rich("headline", {
              accent: (chunks) => (
                <span style={{ color: "#14b8a6" }}>{chunks}</span>
              ),
            })}
          </h1>

          {/* Top contributor - special card */}
          <div
            className={`relative rounded-xl border border-[#14b8a6]/30 bg-[#14b8a6]/[0.03] p-6 mb-4 ${
              first.is_current_user ? "ring-1 ring-black/10" : ""
            }`}
          >
            <div className="flex items-center gap-5">
              <div className="relative">
                <span className="absolute -top-2 -left-2 text-xs font-bold bg-[#14b8a6] text-white rounded-full w-6 h-6 flex items-center justify-center z-10">
                  1
                </span>
                <Crown
                  className="absolute -top-3 -right-1 w-4 h-4 text-[#14b8a6] z-10"
                  fill="currentColor"
                />
                <Avatar size="lg">
                  <AvatarImage
                    src={first.user.picture ?? undefined}
                    alt={first.user.name}
                  />
                  <AvatarFallback>
                    {getInitials(first.user.name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-base font-semibold truncate">
                    {first.user.name}
                  </p>
                  {first.is_current_user && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/5 text-black/40 shrink-0">
                      {t("you")}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-sm font-semibold text-black/50 shrink-0">
                {first.total_count.toLocaleString()} {t("contributions")}
              </span>
            </div>
          </div>

          {/* Remaining contributors - list */}
          {rest.length > 0 && (
            <div className="border border-black/10 rounded-xl overflow-hidden">
              {rest.map((entry, i) => (
                <div
                  key={entry.user.sub}
                  className={`flex items-center gap-4 px-5 py-3.5 ${
                    i > 0 ? "border-t border-black/5" : ""
                  } ${entry.is_current_user ? "bg-black/[0.02]" : ""}`}
                >
                  <span className="text-xs font-mono text-black/30 w-5 text-center shrink-0">
                    {entry.rank}
                  </span>
                  <Avatar>
                    <AvatarImage
                      src={entry.user.picture ?? undefined}
                      alt={entry.user.name}
                    />
                    <AvatarFallback>
                      {getInitials(entry.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">
                        {entry.user.name}
                      </p>
                      {entry.is_current_user && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/5 text-black/40 shrink-0">
                          {t("you")}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-black/60 shrink-0">
                    {entry.total_count.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-16 text-center">
            <Link
              href="/annotation"
              className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white rounded-full font-semibold text-base hover:scale-105 transition-transform"
            >
              {t("cta")}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="mt-4 text-sm text-black/40">{t("ctaDescription")}</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
