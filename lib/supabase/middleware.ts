import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Χρήση getSession() αντί για getUser(): το getUser() κάνει fetch στο Supabase Auth
  // και όταν το fetch αποτύχει (δίκτυο, timeout) επιστρέφει χωρίς user και πετάει στο login.
  // Το getSession() διαβάζει από cookie χωρίς απαραίτητα δικτυακό request.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (
    !session &&
    request.nextUrl.pathname.startsWith("/app")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (
    session &&
    (request.nextUrl.pathname === "/login")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/app";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
