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
    <Field className="max-w-sm">
      <InputGroup>
        <InputGroupInput
          id="inline-start-input"
          placeholder={t("searchPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <InputGroupAddon>
          <SearchIcon className="text-muted-foreground" />
        </InputGroupAddon>

        <InputGroupButton
          className="rounded-sm border-none"
          size="icon-xs"
          title="Clear"
          aria-label="Clear"
          onClick={() => setQuery(null)}
        >
          <XIcon />
        </InputGroupButton>
      </InputGroup>
    </Field>
  );
}
