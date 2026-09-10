// app/api/auth/register/route.js
// ---------------------------------------------------------------------------
// Simple JWT Login ke /users endpoint ko proxy karta hai — Auth Code
// (.env.local mein, kabhi client ko expose nahi hota) automatically attach
// karta hai. Register hone ke baad turant login bhi kar deta hai (JWT
// httpOnly cookie mein set), taake user ko dobara login na karna pade.
// ---------------------------------------------------------------------------

const WP_BASE_URL =
  process.env.NEXT_PUBLIC_WP_API_URL || "http://localhost/travel-pak";
const COOKIE_NAME = process.env.JWT_COOKIE_NAME || "travel_pak_token";

export async function POST(request) {
  try {
    const { email, password, name, social } = await request.json();

    if (!email || !password) {
      return Response.json(
        { success: false, message: "Email and password are required." },
        { status: 400 },
      );
    }

    if (!name || !name.trim()) {
      return Response.json(
        { success: false, message: "Name is required." },
        { status: 400 },
      );
    }

    // 1. Naya user register karein
    const registerRes = await fetch(
      `${WP_BASE_URL}/wp-json/simple-jwt-login/v1/users`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          display_name: name.trim(),
          user_url: social?.trim() || "",
          AUTH_KEY: process.env.SIMPLE_JWT_REGISTER_AUTH_CODE,
        }),
      },
    );

    const registerData = await registerRes.json();

    console.log(
      "[api/auth/register] WP response:",
      registerRes.status,
      JSON.stringify(registerData),
    );

    if (!registerRes.ok || registerData.success === false) {
      return Response.json(
        {
          success: false,
          message: registerData.message || "Registration failed.",
        },
        { status: registerRes.status },
      );
    }

    // 2. Register hone ke baad turant login — JWT lene ke liye
    const authRes = await fetch(
      `${WP_BASE_URL}/wp-json/simple-jwt-login/v1/auth`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      },
    );

    const authData = await authRes.json();

    console.log(
      "[api/auth/register] auto-login response:",
      authRes.status,
      JSON.stringify(authData),
    );

    if (!authRes.ok || !authData.data?.jwt) {
      return Response.json(
        {
          success: false,
          message: "Registered, but auto-login failed. Please log in manually.",
        },
        { status: 500 },
      );
    }

    const response = Response.json({
      success: true,
      email,
      name: name.trim(),
      social: social?.trim() || "",
    });
    response2Body: {
    } // (ignore — just showing where to add name to response)
    response.headers.set(
      "Set-Cookie",
      `${COOKIE_NAME}=${authData.data.jwt}; HttpOnly; Path=/; SameSite=Lax; Max-Age=2592000${
        process.env.NODE_ENV === "production" ? "; Secure" : ""
      }`,
    );
    return response;
  } catch (err) {
    console.error("[api/auth/register] failed:", err.message);
    return Response.json(
      { success: false, message: "Something went wrong." },
      { status: 500 },
    );
  }
}
