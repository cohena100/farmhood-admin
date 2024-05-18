import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["en", "de", "ru", "he"],
  defaultLocale: "he",
});

export const config = {
  matcher: ["/", "/(en|de|ru|he)/:path*"],
};
