// lib/auth.js
// ---------------------------------------------------------------------------
// Server-side login status check — httpOnly cookie ko WP se verify karta
// hai. Ye logic pehle Contribute/My-Contributions pages mein alag-alag
// likhi hui thi, ab ek hi jagah se reuse hoti hai.
// ---------------------------------------------------------------------------
import { cookies } from "next/headers";

const WP_BASE_URL =
  process.env.NEXT_PUBLIC_WP_API_URL || "http://localhost/travel-pak";
const COOKIE_NAME = process.env.JWT_COOKIE_NAME || "travel_pak_token";

export async function getLoginStatus() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return { loggedIn: false, email: null, name: null, social: null };

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
      return { loggedIn: false, email: null, name: null, social: null };
    }
    // Custom profile (phone + socials) alag call se aata hai
    let profile = {
      phone: "",
      facebook: "",
      instagram: "",
      youtube: "",
      tiktok: "",
    };
    try {
      const profileRes = await fetch(
        `${WP_BASE_URL}/wp-json/travel-pakistan/v1/profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        },
      );
      if (profileRes.ok) profile = await profileRes.json();
    } catch {
      // profile fetch fail ho to bhi login status khud invalid nahi hona chahiye
    }

    return {
      loggedIn: true,
      email: data.data?.user?.user_email || null,
      name: data.data?.user?.display_name || null,
      ...profile,
    };
  } catch {
    return { loggedIn: false, email: null, name: null, social: null };
  }
}
