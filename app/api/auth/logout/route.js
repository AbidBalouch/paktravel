const COOKIE_NAME = process.env.JWT_COOKIE_NAME || "travel_pak_token";

export async function POST() {
  const response = Response.json({ success: true });
  response.headers.set(
    "Set-Cookie",
    `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0`,
  );
  return response;
}
