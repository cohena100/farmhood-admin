import {
  NextIntlClientProvider,
  useMessages,
  useTranslations,
} from "next-intl";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { ThemeModeScript } from "flowbite-react";
import {
  Flowbite,
  DarkThemeToggle,
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarToggle,
} from "flowbite-react";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { cn } from "@/lib/utils";
import { getLangDir } from "rtl-detect";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | Farmhood Admin",
    default: "Farmhood Admin",
  },
  description: "From the farm to the neighborhood admin.",
};

interface RootLayoutParams {
  readonly children: React.ReactNode;
  readonly params: { locale: string };
}

export default function RootLayout({
  children,
  params: { locale },
}: RootLayoutParams) {
  const messages = useMessages();
  const t = useTranslations("home");
  const direction = getLangDir(locale);
  return (
    <html lang={locale} dir={direction} suppressHydrationWarning>
      <head>
        <ThemeModeScript />
      </head>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <body className={cn("dark:bg-gray-900", inter.className)}>
          <Flowbite>
            <Navbar fluid border>
              <NavbarBrand as={Link} href="/">
                <span className="text-xl font-semibold text-pink-600 dark:text-pink-600">
                  משק אביהו🍓🥒🫐🍅
                </span>
              </NavbarBrand>
              <NavbarToggle />
              <NavbarCollapse>
                <div className="flex items-center gap-3">
                  <DarkThemeToggle />
                  <LocaleSwitcher />
                </div>
              </NavbarCollapse>
            </Navbar>
            {children}
          </Flowbite>
        </body>
      </NextIntlClientProvider>
    </html>
  );
}
