"use client";

import { useTranslations } from "next-intl";

interface TranslationEntryFormFieldsProps {
  translation: string;
  onTranslationChange: (value: string) => void;
}

export function TranslationEntryFormFields({
  translation,
  onTranslationChange,
}: TranslationEntryFormFieldsProps) {
  const t = useTranslations("TranslationEntryFormFields");

  return (
    <div>
      <p className="text-xs font-semibold text-black/40 tracking-widest uppercase mb-2">
        {t("translation")}
      </p>
      <textarea
        value={translation}
        onChange={(e) => onTranslationChange(e.target.value)}
        dir="rtl"
        rows={3}
        placeholder={t("translationPlaceholder")}
        className="w-full rounded-md border border-black/10 bg-transparent px-3 py-2.5 text-base text-black/80 leading-relaxed text-right resize-none outline-none transition-colors placeholder:text-black/25 focus:border-[#14b8a6] focus:ring-2 focus:ring-[#14b8a6]/20"
      />
    </div>
  );
}
