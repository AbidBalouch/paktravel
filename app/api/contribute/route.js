// app/api/contribute/route.js
// ---------------------------------------------------------------------------
// Server-side API route — Community Contribution form ka submission handler.
// WP_APP_USER/WP_APP_PASSWORD (.env.local, kabhi client ko expose nahi hota)
// se authenticate ho kar: (1) photos WP Media Library mein upload karta hai,
// (2) naya Attraction post "pending" status mein create karta hai.
// ---------------------------------------------------------------------------

import { cookies } from "next/headers";

const WP_BASE_URL =
  process.env.NEXT_PUBLIC_WP_API_URL || "http://localhost/travel-pak";
const COOKIE_NAME = process.env.JWT_COOKIE_NAME || "travel_pak_token";

function getAuthHeader() {
  const user = process.env.WP_APP_USER;
  const pass = process.env.WP_APP_PASSWORD;
  const token = Buffer.from(`${user}:${pass}`).toString("base64");
  return `Basic ${token}`;
}

/** Request bhejne wale ka JWT verify karta hai — login-required enforce karta hai. */
async function verifyCustomerSession() {
  const token = cookies().get(COOKIE_NAME)?.value;
  // if (!token) return null;
  if (!token) {
    console.log("[api/contribute] No cookie found:", COOKIE_NAME);
    return null;
  }

  try {
    const res = await fetch(
      `${WP_BASE_URL}/wp-json/simple-jwt-login/v1/auth/validate`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      },
    );
    const data = await res.json();
    console.log(
      "[api/contribute] validate response:",
      res.status,
      JSON.stringify(data),
    );
    if (!res.ok || !data.success) return null;
    return {
      email: data.data?.user?.user_email || null,
      name: data.data?.user?.display_name || null,
      social: data.data?.user?.user_url || null,
    };
  } catch {
    console.log("[api/contribute] validate error:", err.message);
    return null;
  }
}

/** Ek file WP Media Library mein upload karta hai, media ID return karta hai. */
async function uploadMedia(file) {
  const buffer = Buffer.from(await file.arrayBuffer());

  const res = await fetch(`${WP_BASE_URL}/wp-json/wp/v2/media`, {
    method: "POST",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Disposition": `attachment; filename="${file.name}"`,
      "Content-Type": file.type || "application/octet-stream",
    },
    body: buffer,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(
      `Media upload failed for ${file.name}: ${res.status} — ${errText.slice(0, 200)}`,
    );
  }

  const data = await res.json();
  return data.id;
}

/** JSON-encoded string array ko repeater rows mein convert karta hai. */
function toRepeaterRows(jsonString, subFieldKey) {
  try {
    const arr = JSON.parse(jsonString || "[]");
    return arr
      .filter((v) => typeof v === "string" && v.trim())
      .map((v) => ({ [subFieldKey]: v.trim() }));
  } catch {
    return [];
  }
}

/** How to Reach ke liye — {mode, detail} objects ko WP sub-field names mein map karta hai. */
function toHowToReachRows(jsonString) {
  try {
    const arr = JSON.parse(jsonString || "[]");
    return arr
      .filter((row) => row && (row.mode?.trim() || row.detail?.trim()))
      .map((row) => ({
        transport_mode: (row.mode || "").trim(),
        transport_detail: (row.detail || "").trim(),
      }));
  } catch {
    return [];
  }
}

export async function POST(request) {
  try {
    const customer = await verifyCustomerSession();
    if (!customer) {
      return Response.json(
        { success: false, message: "Please log in before submitting." },
        { status: 401 },
      );
    }
    const formData = await request.formData();

    const placeName = formData.get("placeName")?.toString().trim();
    const categoryId = formData.get("categoryId")?.toString();
    const tagline = formData.get("tagline")?.toString().trim();
    const specialRecognition = formData
      .get("specialRecognition")
      ?.toString()
      .trim();
    const destinationTermId = formData.get("destinationTermId")?.toString();
    const description = formData.get("description")?.toString().trim();
    // Email kabhi form se nahi liya jata — hamesha verified session se aata hai,
    // taake koi customer login kar ke bhi kisi aur ka email spoof na kar sake.
    const yourName = customer.name;
    const yourEmail = customer.email;
    const socialLink = customer.social || "";

    // Required-field validation (server-side — client-side already checked,
    // lekin never trust client alone)
    if (
      !placeName ||
      !categoryId ||
      !destinationTermId ||
      !yourName ||
      !yourEmail
    ) {
      return Response.json(
        { success: false, message: "Missing required fields." },
        { status: 400 },
      );
    }

    // 1. Photos upload — sequential, taake WP media endpoint pe ek saath
    // bohat sari parallel requests na jayein.
    const photoFiles = formData.getAll("photos");
    const mediaIds = [];
    for (const file of photoFiles) {
      if (file && typeof file.arrayBuffer === "function") {
        const id = await uploadMedia(file);
        mediaIds.push(id);
      }
    }

    if (mediaIds.length === 0) {
      return Response.json(
        { success: false, message: "At least one photo is required." },
        { status: 400 },
      );
    }

    // 2. ACF payload banayein
    const acfPayload = {
      hero_badge: specialRecognition || "",
      hero_gallery: mediaIds,
      what_to_do: toRepeaterRows(formData.get("whatToDo"), "point"),
      what_to_buy: toRepeaterRows(formData.get("whatToBuy"), "item"),
      best_season_to_visit: toRepeaterRows(
        formData.get("bestSeason"),
        "season_point",
      ),
      policies_and_info: toRepeaterRows(
        formData.get("policies"),
        "policy_point",
      ),
      health_and_safety: toRepeaterRows(
        formData.get("healthSafety"),
        "safety_point",
      ),
      how_to_reach: toHowToReachRows(formData.get("howToReach")),
      // Text Area field hai (repeater nahi) — array ko newline se join kar rahe hain
      photography_tips: (() => {
        try {
          return JSON.parse(formData.get("additionalTips") || "[]").join("\n");
        } catch {
          return "";
        }
      })(),
      submitter_name: yourName,
      submitter_email: yourEmail,
      submitter_social: socialLink || "",
    };

    // 3. Post create karein — "pending" status, taxonomies, ACF, meta sab ek saath
    const postRes = await fetch(`${WP_BASE_URL}/wp-json/wp/v2/attraction`, {
      method: "POST",
      headers: {
        Authorization: getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: placeName,
        excerpt: tagline || "",
        content: description || "",
        status: "pending",
        "attraction-type": [Number(categoryId)],
        destination: [Number(destinationTermId)],
        featured_media: mediaIds[0], // pehli photo ko featured image bana dete hain
        acf: acfPayload,
      }),
    });

    if (!postRes.ok) {
      const errText = await postRes.text();
      throw new Error(
        `Post creation failed: ${postRes.status} — ${errText.slice(0, 300)}`,
      );
    }

    const post = await postRes.json();

    return Response.json({ success: true, postId: post.id });
  } catch (err) {
    console.error("[api/contribute] Submission failed:", err.message);
    return Response.json(
      {
        success: false,
        message: "Something went wrong while submitting. Please try again.",
      },
      { status: 500 },
    );
  }
}
