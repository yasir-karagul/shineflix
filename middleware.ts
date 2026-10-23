import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const requestedLanguage = request.nextUrl.searchParams.get("lang");
  if (requestedLanguage === "en" || requestedLanguage === "ar") {
    const url = request.nextUrl.clone();
    url.searchParams.delete("lang");
    const response = NextResponse.redirect(url);
    response.cookies.set("shineflix_locale", requestedLanguage, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
      httpOnly: false
    });
    return response;
  }

  const redirectMode = process.env.REDIRECT_SITE_MODE === "true";
  const mainSiteConfigured = Boolean(process.env.NEXT_PUBLIC_MAIN_SITE_URL?.trim());
  const path = request.nextUrl.pathname;
  const allowedRedirectPaths = ["/", "/redirect"];
  if (redirectMode && mainSiteConfigured && !allowedRedirectPaths.includes(path)) {
    const lang = request.cookies.get("shineflix_locale")?.value === "ar" ? "ar" : "en";
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    url.searchParams.set("lang", lang);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"]
};
