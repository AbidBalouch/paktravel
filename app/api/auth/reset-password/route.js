// app/api/auth/reset-password/route.js
// ---------------------------------------------------------------------------
// Simple JWT Login ke reset_password endpoint ko "code" ke sath call karta
// hai (jo email ke link se aata hai) — isse naya password set ho jata hai.
// ---------------------------------------------------------------------------

const WP_BASE_URL =
  process.env.NEXT_PUBLIC_WP_API_URL || "http://localhost/travel-pak";

export async function POST(request) {
  try {
    const { code, email, password } = await request.json();

    if (!code || !email || !password) {
      return Response.json(
        { success: false, message: "Missing required information." },
        { status: 400 },
      );
    }

    const res = await fetch(
      `${WP_BASE_URL}/wp-json/simple-jwt-login/v1/user/reset_password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, email, new_password: password }),
      },
    );

    const data = await res.json();

    if (!res.ok || data.success === false) {
      return Response.json(
        {
          success: false,
          message: data.message || "This reset link is invalid or has expired.",
        },
        { status: 400 },
      );
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("[api/auth/reset-password] failed:", err.message);
    return Response.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
