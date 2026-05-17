import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

/**
 * Nettoie tous les cookies de session Supabase (`sb-*`) du navigateur.
 *
 * Utilisé quand le refresh token est orphelin (compte supprimé, session
 * révoquée, basculement entre projets Supabase) afin d'éviter les logs
 * d'erreur "Invalid Refresh Token" en boucle côté client.
 */
function clearSupabaseCookies(request: NextRequest, response: NextResponse): void {
  for (const cookie of request.cookies.getAll()) {
    if (cookie.name.startsWith("sb-")) {
      response.cookies.set({
        name: cookie.name,
        value: "",
        maxAge: 0,
        path: "/"
      });
    }
  }
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });

  // getUser() peut lever en cas de refresh token orphelin (ex: compte supprimé).
  // On capture proprement pour éviter le bruit en console et nettoyer la session.
  let user: Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"] = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    user = data.user;
    if (error) {
      const code = (error as { code?: string }).code;
      const message = error.message?.toLowerCase() ?? "";
      const isInvalidRefresh =
        code === "refresh_token_not_found" ||
        code === "session_not_found" ||
        message.includes("refresh token") ||
        message.includes("session");
      if (isInvalidRefresh) {
        clearSupabaseCookies(request, response);
      }
    }
  } catch {
    clearSupabaseCookies(request, response);
    user = null;
  }

  const pathname = request.nextUrl.pathname;
  // /reset-password est volontairement exclu de isAuthRoute : un utilisateur authentifié
  // via le lien de récupération doit pouvoir y accéder pour définir son nouveau mot de passe.
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/forgot-password");
  const isProtectedRoute =
    pathname.startsWith("/categories") ||
    pathname.startsWith("/vehicules") ||
    pathname.startsWith("/vehicule") ||
    pathname.startsWith("/parametres");

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/categories";
    return NextResponse.redirect(url);
  }

  return response;
}
