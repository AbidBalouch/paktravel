// app/api/auth/forgot-password/route.js
// ---------------------------------------------------------------------------
// Simple JWT Login plugin ka built-in "Reset Password" feature use karta
// hai. Isse pehle WordPress admin mein JWT Login → Reset Password tab se
// feature enable + "Reset Password URL" set karna zaroori hai
// (https://yourdomain.com/reset-password) — warna email ka link kaam
// nahi karega.
// ---------------------------------------------------------------------------

const WP_BASE_URL =
  process.env.NEXT_PUBLIC_WP_API_URL || "http://localhost/travel-pak";

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return Response.json(
        { success: false, message: "Please enter your email." },
        { status: 400 },
      );
    }

    const res = await fetch(
      `${WP_BASE_URL}/wp-json/simple-jwt-login/v1/user/reset_password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      },
    );

    const data = await res.json();

    // Note: Simple JWT Login apni "success" key khud return karta hai.
    // Hum aage bhi security ke liye hamesha generic "sent" wala message
    // dikhate hain (chahe email registered ho ya na ho) — taake koi ye
    // pata na laga sake ke kaunsa email account exist karta hai.
    if (!res.ok || data.success === false) {
      console.error("[api/auth/forgot-password] WP response:", res.status, JSON.stringify(data));
    }

    return Response.json({
      success: true,
      message: "If an account exists with that email, a reset link has been sent.",
    });
  } catch (err) {
    console.error("[api/auth/forgot-password] failed:", err.message);
    return Response.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
