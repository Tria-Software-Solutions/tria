import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get locale from cookie or Accept-Language header
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  const acceptLanguage = request.headers.get('accept-language');
  
  let locale = 'en'; // default
  
  // Check cookie first
  if (cookieLocale && ['en', 'es'].includes(cookieLocale)) {
    locale = cookieLocale;
  } else if (acceptLanguage) {
    // Parse Accept-Language header
    const preferredLocale = acceptLanguage
      .split(',')[0]
      .split('-')[0]
      .toLowerCase();
    
    if (['en', 'es'].includes(preferredLocale)) {
      locale = preferredLocale;
    }
  }
  
  // Set locale cookie if not present or different
  if (!cookieLocale || cookieLocale !== locale) {
    const response = NextResponse.next();
    response.cookies.set('NEXT_LOCALE', locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
