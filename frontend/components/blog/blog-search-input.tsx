"use client";

import { SearchIcon, XIcon } from "lucide-react";
import { Field } from "@/components/ui/field";
import { useHotkeys } from "react-hotkeys-hook";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useQueryState } from "nuqs";
import { useTranslations } from "next-intl";

export function BlogSearchInput() {
  const [query, setQuery] = useQueryState("q", { defaultValue: "" });
  const t = useTranslations("Blog");
  useHotkeys("esc", () => setQuery(null), { enableOnFormTags: true });

  return (
    <Field className="w-full max-w-sm">
      <InputGroup className="rounded-full border-black/10 bg-white shadow-sm transition-colors focus-within:border-black/20 focus-within:ring-2 focus-within:ring-black/5">
        <InputGroupAddon className="pl-5 pr-0">
          <SearchIcon className="text-black/30" />
        </InputGroupAddon>
        <InputGroupInput
          id="inline-start-input"
          placeholder={t("searchPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-14 text-base placeholder:text-black/30"
        />
        <InputGroupAddon
          align="inline-end"
          className="pr-2.5 data-[disabled=true]:opacity-0 data-[disabled=true]:pointer-events-none"
          data-disabled={!query.length}
        >
          <InputGroupButton
            className="rounded-full border-none"
            size="icon-xs"
            title="Clear"
            aria-label="Clear"
            onClick={() => setQuery(null)}
          >
            <XIcon />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  );
}
