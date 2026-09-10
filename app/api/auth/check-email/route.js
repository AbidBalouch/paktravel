import { checkEmailExists } from "@/lib/api";

export async function POST(request) {
  const { email } = await request.json();
  if (!email) return Response.json({ exists: false });

  try {
    const exists = await checkEmailExists(email);
    return Response.json({ exists });
  } catch (err) {
    console.error("[api/auth/check-email] failed:", err.message);
    return Response.json({ exists: false }); // fail-safe: register form dikha dein
  }
}
