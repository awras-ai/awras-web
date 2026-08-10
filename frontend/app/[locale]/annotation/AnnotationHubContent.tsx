"use client";

import { useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { BookOpen, Languages, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useKeycloak } from "@/context/KeycloakContext";
import { AnnotationHeader } from "@/components/annotation/AnnotationHeader";
import { useDatasets, usePrimaryDataset } from "@/hooks/useDictionary";
import {
  useTranslationDatasets,
  useTranslationDatasetStats,
} from "@/hooks/useTranslation";

function TranslationDatasetCard({ datasetId }: { datasetId: string }) {
  const t = useTranslations("AnnotationHub");
  const { data: stats } = useTranslationDatasetStats(datasetId);

  const overall = stats?.overall_stats;
  const pct = overall?.completion_percentage ?? 0;
  const completed = overall?.completed_count ?? 0;
  const total = overall?.total_entries ?? 0;
  const name = stats?.dataset.name;
  const source = stats?.dataset.source_language;
  const target = stats?.dataset.target_language;

  return (
    <Link href={`/annotation/translation/${datasetId}`}>
      <Card className="border-black/10 shadow-sm hover:bg-neutral-50 transition-colors duration-200 cursor-pointer group h-full">
        <CardContent className="p-4 md:p-8 flex flex-col gap-4 h-full">
          <div className="flex-1">
            <div className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center bg-black/5 mb-4">
              <Languages className="w-4 h-4 text-black/70" />
            </div>
            <h2 className="text-lg font-semibold tracking-tight mb-1">
              {name ?? t("translationTitle")}
            </h2>
            {source && target && (
              <p className="text-xs font-medium text-black/40 tabular-nums mb-1">
                <span dir="ltr">
                  {source} → {target}
                </span>
              </p>
            )}
            <p className="text-sm text-black/60 leading-relaxed">
              {t("translationDescription")}
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-black/40">
              <span>{t("overallProgress")}</span>
              {total > 0 ? (
                <span>
                  {completed.toLocaleString()} / {total.toLocaleString()}
                </span>
              ) : (
                <span>—</span>
              )}
            </div>
            <Progress value={pct} className="h-1.5 bg-black/5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function AnnotationHubContent() {
  const t = useTranslations("AnnotationHub");
  const locale = useLocale();
  const { initialized, authenticated, keycloak } = useKeycloak();
  const { dataset, stats } = usePrimaryDataset();
  const dictionaryDatasets = useDatasets();
  const translationDatasets = useTranslationDatasets();
  const translationList = translationDatasets.data?.datasets ?? [];

  useEffect(() => {
    if (!initialized) return;
    if (!authenticated) {
      keycloak?.login({
        locale,
        redirectUri: `${window.location.origin}/${locale}/annotation`,
      });
    }
  }, [initialized, authenticated, keycloak, locale]);

  if (!initialized || !authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2
          className="h-8 w-8 animate-spin"
          style={{ color: "#14b8a6" }}
        />
      </div>
    );
  }

  const isLoading =
    dictionaryDatasets.isLoading || translationDatasets.isLoading;
  const hasDictionary = !!dataset;
  const totalCards = (hasDictionary ? 1 : 0) + translationList.length;

  const overall = stats?.overall_stats;
  const pct = overall?.completion_percentage ?? 0;
  const completed = overall?.completed_count ?? 0;
  const total = overall?.total_entries ?? 0;

  const dictionaryHref = dataset?.id
    ? `/annotation/dictionary/${dataset.id}`
    : "/annotation/dictionary";

  return (
    <div className="min-h-screen bg-white">
      <AnnotationHeader />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
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

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2
                className="h-8 w-8 animate-spin"
                style={{ color: "#14b8a6" }}
              />
            </div>
          ) : totalCards === 0 ? (
            <div className="border border-black/10 rounded-xl p-10 text-center bg-black/[0.01]">
              <p className="text-sm text-black/50 leading-relaxed max-w-md mx-auto">
                {t("empty")}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {hasDictionary && (
                <Link href={dictionaryHref}>
                  <Card className="border-black/10 shadow-sm hover:bg-neutral-50 transition-colors duration-200 cursor-pointer group h-full">
                    <CardContent className="p-4 md:p-8 flex flex-col gap-4 h-full">
                      <div className="flex-1">
                        <div className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center bg-black/5 mb-4">
                          <BookOpen className="w-4 h-4 text-black/70" />
                        </div>
                        <h2 className="text-lg font-semibold tracking-tight mb-1">
                          {t("dictionaryTitle")}
                        </h2>
                        <p className="text-sm text-black/60 leading-relaxed">
                          {t("dictionaryDescription")}
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-black/40">
                          <span>{t("overallProgress")}</span>
                          {total > 0 ? (
                            <span>
                              {completed.toLocaleString()} /{" "}
                              {total.toLocaleString()}
                            </span>
                          ) : (
                            <span>—</span>
                          )}
                        </div>
                        <Progress value={pct} className="h-1.5 bg-black/5" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )}

              {translationList.map((ds) => (
                <TranslationDatasetCard
                  key={ds.id}
                  datasetId={ds.id}
                />
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}