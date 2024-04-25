import { authMiddleware } from "@clerk/nextjs";
import createMiddleware from "next-intl/middleware";

const intlMiddleware = createMiddleware({
  locales: ["en", "de", "ru", "he"],
  defaultLocale: "he",
});

export default authMiddleware({
  beforeAuth(request) {
    return intlMiddleware(request);
  },
  publicRoutes: ["/:locale", "/:locale/orders"],
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
