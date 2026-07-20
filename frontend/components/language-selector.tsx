"use client";

import { useLocale, useTranslations } from "next-intl";
import { Globe } from "lucide-react";
import Flag from "react-world-flags";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const languages = [
  { code: "en", labelKey: "english" as const, isoCode: "gb" },
  { code: "ar", labelKey: "arabic" as const, isoCode: "dz" },
];

export function LanguageSelector() {
  const t = useTranslations("Navbar");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (nextLocale: string) => {
    if (
      !routing.locales.includes(nextLocale as (typeof routing.locales)[number])
    ) {
      return;
    }
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label={t("languageAriaLabel")}
        >
          <Globe className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t("language")}</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={locale}
            onValueChange={handleLocaleChange}
          >
            {languages.map(({ code, labelKey, isoCode }) => (
              <DropdownMenuRadioItem key={code} value={code}>
                <span className="inline-block w-5 h-3.5 shrink-0 overflow-hidden rounded-xs [&>img]:w-full [&>img]:h-full [&>img]:object-cover">
                  <Flag code={isoCode} />
                </span>
                {t(labelKey)}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
