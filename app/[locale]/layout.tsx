import {
  NextIntlClientProvider,
  useMessages,
  useTranslations,
} from "next-intl";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { ClerkProvider, Protect } from "@clerk/nextjs";
import { enUS, deDE, heIL, ruRU } from "@clerk/localizations";
import { ThemeModeScript } from "flowbite-react";
import {
  Flowbite,
  DarkThemeToggle,
  Label,
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarToggle,
} from "flowbite-react";
import { UserButton } from "@clerk/nextjs";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { cn } from "@/lib/utils";
import useTextDirection from "@/lib/hooks";

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
  const clerkLocale: Record<string, typeof enUS> = {
    en: enUS,
    de: deDE,
    re: ruRU,
    he: heIL,
  };
  const t = useTranslations("home");
  const direction = useTextDirection(locale);
  return (
    <ClerkProvider localization={clerkLocale[locale]}>
      <html lang={locale} dir={direction} suppressHydrationWarning>
        <head>
          <ThemeModeScript />
        </head>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <body className={cn("dark:bg-gray-900", inter.className)}>
            <Flowbite>
              <Navbar fluid border>
                <NavbarBrand>
                  <Label className=" text-xl font-semibold text-pink-600 dark:text-pink-600">
                    תותים משק אריאל במדע🍓🍓🍓
                  </Label>
                </NavbarBrand>
                <NavbarToggle />
                <NavbarCollapse>
                  <div className="flex gap-3 items-center">
                    <DarkThemeToggle />
                    <LocaleSwitcher />
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </NavbarCollapse>
              </Navbar>
              <Protect
                role="org:admin"
                fallback={
                  <div className="fixed top-0 left-0 bottom-0 translate-x-1/2 translate-y-1/2 w-1/2">
                    <Label>
                      {t(
                        "You have reached the management site. Please ask for a link to the orders site. Thanks."
                      )}
                    </Label>
                  </div>
                }
              >
                {children}
              </Protect>
            </Flowbite>
          </body>
        </NextIntlClientProvider>
      </html>
    </ClerkProvider>
  );
}
