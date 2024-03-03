import { authMiddleware } from "@clerk/nextjs";
import createMiddleware from "next-intl/middleware";
import { locales } from "./navigation";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: "he",
});

export default authMiddleware({
  beforeAuth(request) {
    return intlMiddleware(request);
  },
  publicRoutes: [],
  // debug: true,
});

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/(api|trpc)(.*)",
    "/(en|de|ru|he)/:path*",
  ],
};
