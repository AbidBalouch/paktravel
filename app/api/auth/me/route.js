// app/api/auth/me/route.js
// ---------------------------------------------------------------------------
// Current login status check karta hai — httpOnly cookie ko WP ke
// /auth/validate se verify karta hai (sirf cookie ka "exist karna" kaafi
// nahi, expired/tampered token bhi ho sakta hai).
// ---------------------------------------------------------------------------
import { cookies } from "next/headers";

const WP_BASE_URL =
  process.env.NEXT_PUBLIC_WP_API_URL || "http://localhost/travel-pak";
const COOKIE_NAME = process.env.JWT_COOKIE_NAME || "travel_pak_token";

export async function GET() {
  const token = cookies().get(COOKIE_NAME)?.value;

  if (!token) {
    return Response.json({ loggedIn: false });
  }

  try {
    const res = await fetch(
      `${WP_BASE_URL}/wp-json/simple-jwt-login/v1/auth/validate`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      },
    );
    const data = await res.json();

    if (!res.ok || !data.success) {
      return Response.json({ loggedIn: false });
    }

    return Response.json({
      loggedIn: true,
      email: data.data?.user?.user_email || null,
    });
  } catch (err) {
    console.error("[api/auth/me] validate failed:", err.message);
    return Response.json({ loggedIn: false });
  }
}
