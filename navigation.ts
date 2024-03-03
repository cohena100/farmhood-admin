import { createSharedPathnamesNavigation } from "next-intl/navigation";

export const locales = ["en", "de", "ru", "he"];

export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation({ locales });
