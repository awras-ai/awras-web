import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["en", "ar"],

  // Used when no locale matches
  defaultLocale: "en",

  localeCookie: {
    maxAge: 60 * 60 * 24 * 365, // 1 year
  },
});
