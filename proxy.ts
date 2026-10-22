import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname

  // 1. Salta tutto per admin (usa password interna, non Supabase Auth)
  if (path.startsWith('/admin')) {
    return NextResponse.next()
  }

  // 2. Salta tutto per le API (gestiscono l'auth da sole)
  if (path.startsWith('/api')) {
    return NextResponse.next()
  }

  const protectedPaths = ['/dashboard', '/onboarding']
  const authPaths = ['/login', '/signup']

  const isProtected = protectedPaths.some((p) => path.startsWith(p))
  const isAuthPath = authPaths.some((p) => path.startsWith(p))

  // 3. Se la rotta non è né protetta né di autenticazione, non sprecare risorse
  if (!isProtected && !isAuthPath) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', path)
    return NextResponse.redirect(url)
  }

  if (isAuthPath && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|admin|sitemap\\.xml|robots\\.txt|manifest|.*\\\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
