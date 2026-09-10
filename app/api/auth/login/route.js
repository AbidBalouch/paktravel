// app/api/auth/login/route.js
const WP_BASE_URL =
  process.env.NEXT_PUBLIC_WP_API_URL || "http://localhost/travel-pak";
const COOKIE_NAME = process.env.JWT_COOKIE_NAME || "travel_pak_token";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json(
        { success: false, message: "Email and password are required." },
        { status: 400 },
      );
    }

    const authRes = await fetch(
      `${WP_BASE_URL}/wp-json/simple-jwt-login/v1/auth`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      },
    );

    const authData = await authRes.json();

    if (!authRes.ok || !authData.data?.jwt) {
      return Response.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 },
      );
    }

    // Validate call se poora user object milta hai (display_name sameत)
    const validateRes = await fetch(
      `${WP_BASE_URL}/wp-json/simple-jwt-login/v1/auth/validate`,
      {
        headers: { Authorization: `Bearer ${authData.data.jwt}` },
        cache: "no-store",
      },
    );
    const validateData = await validateRes.json();
    const name = validateData.data?.user?.display_name || "";
    const social = validateData.data?.user?.user_url || "";

    const response = Response.json({ success: true, email, name, social });
    response.headers.set(
      "Set-Cookie",
      `${COOKIE_NAME}=${authData.data.jwt}; HttpOnly; Path=/; SameSite=Lax; Max-Age=2592000${
        process.env.NODE_ENV === "production" ? "; Secure" : ""
      }`,
    );
    return response;
  } catch (err) {
    console.error("[api/auth/login] failed:", err.message);
    return Response.json(
      { success: false, message: "Something went wrong." },
      { status: 500 },
    );
  }
}
