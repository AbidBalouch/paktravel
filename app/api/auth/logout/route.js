const COOKIE_NAME = process.env.JWT_COOKIE_NAME || "travel_pak_token";
const LOGIN_HINT_COOKIE = "tp_logged_in";

export async function POST() {
  const response = Response.json({ success: true });

  response.headers.append(
    "Set-Cookie",
    `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0`,
  );

  response.headers.append(
    "Set-Cookie",
    `${LOGIN_HINT_COOKIE}=; Path=/; Max-Age=0`,
  );

  return response;
}
