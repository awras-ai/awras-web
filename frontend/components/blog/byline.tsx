import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Algeria uses Western Arabic numerals, unlike ar-EG — matches the ar_DZ
// OpenGraph locale already set in the root layout.
const dateFormatLocale = (locale: string) => (locale === "ar" ? "ar-DZ" : locale);

const formatDate = (date: string, locale: string) =>
  new Intl.DateTimeFormat(dateFormatLocale(locale), {
    day: "numeric",
    month: "short",
  }).format(new Date(date));

const initials = (name: string) =>
  name
    .split(" ")
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

export function Byline({
  author,
  date,
  size,
  locale,
}: {
  author: string;
  date: string;
  size: "sm" | "default";
  locale: string;
}) {
  const small = size === "sm";

  return (
    <div className={`flex items-center ${small ? "gap-2 mt-4" : "gap-3 mt-7"}`}>
      <Avatar size={size}>
        <AvatarFallback>{initials(author)}</AvatarFallback>
      </Avatar>
      <span
        className={
          small
            ? "text-xs font-medium text-neutral-600"
            : "text-sm font-semibold"
        }
      >
        {author}
      </span>
      {!small && <span className="w-1 h-1 rounded-full bg-neutral-300" />}
      <span
        className={
          small ? "text-xs text-neutral-300" : "text-sm text-neutral-400"
        }
      >
        {formatDate(date, locale)}
      </span>
    </div>
  );
}
