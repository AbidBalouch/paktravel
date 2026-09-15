// app/api/auth/status/route.js
// ---------------------------------------------------------------------------
// Login status ab yahan se serve hoti hai — root layout se cookies() read
// karna hata diya gaya hai, kyunke wo deeply-nested dynamic routes (jaise
// /provinces/[province]/[division]/[district]) ke sath "Page changed from
// static to dynamic at runtime" crash de raha tha. Ye route handler khud
// dynamic hai (isse koi masla nahi), aur client-side fetch se call hota hai.
// ---------------------------------------------------------------------------
import { NextResponse } from "next/server";
import { getLoginStatus } from "@/lib/auth";

export async function GET() {
  const status = await getLoginStatus();
  return NextResponse.json(status);
}
