const WP_BASE_URL =
  process.env.NEXT_PUBLIC_WP_API_URL || "http://localhost/travel-pak";

export async function POST(request) {
  const { email } = await request.json();
  if (!email) {
    return Response.json(
      { success: false, message: "Email is required." },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(
      `${WP_BASE_URL}/wp-json/simple-jwt-login/v1/user/reset_password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      },
    );
    const data = await res.json();

    // Security: hamesha same message do, chahe email exist kare ya na kare
    // (taake koi guess na kar sake kaunse emails registered hain)
    return Response.json({
      success: true,
      message:
        "If an account exists with that email, a reset link has been sent.",
    });
  } catch (err) {
    console.error("[api/auth/forgot-password] failed:", err.message);
    return Response.json(
      { success: false, message: "Something went wrong." },
      { status: 500 },
    );
  }
}
