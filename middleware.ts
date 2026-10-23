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

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"]
};
