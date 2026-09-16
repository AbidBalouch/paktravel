// app/api/testimonials/route.js
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------

const WP_BASE_URL =
  process.env.NEXT_PUBLIC_WP_API_URL || "http://localhost/travel-pak";

function getAuthHeader() {
  const user = process.env.WP_APP_USER;
  const pass = process.env.WP_APP_PASSWORD;
  const token = Buffer.from(`${user}:${pass}`).toString("base64");
  return `Basic ${token}`;
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

export async function POST(request) {
  try {
    const formData = await request.formData();

    const name = formData.get("name")?.toString().trim();
    const designation = formData.get("designation")?.toString().trim() || "";
    const ratingRaw = formData.get("rating")?.toString();
    const rating = Number(ratingRaw);
    const image = formData.get("image"); // File | null — optional

    // Required-field validation (client-side already checked, lekin never
    // trust client alone)
    if (!name) {
      return Response.json(
        { success: false, message: "Please enter your name." },
        { status: 400 },
      );
    }
    if (!rating || rating < 1 || rating > 5) {
      return Response.json(
        { success: false, message: "Please select a star rating." },
        { status: 400 },
      );
    }

    // 1. Photo upload — sirf agar di gayi ho (Contribute ke ulat, yahan
    // required nahi hai)
    let mediaId = null;
    if (image && typeof image.arrayBuffer === "function" && image.size > 0) {
      mediaId = await uploadMedia(image);
    }

    // 2. Testimonial post create karein — "pending" status
    const postBody = {
      title: name,
      status: "pending",
      acf: {
        designation,
        star_rating: rating,
      },
    };
    if (mediaId) postBody.featured_media = mediaId;

    const postRes = await fetch(`${WP_BASE_URL}/wp-json/wp/v2/testimonial`, {
      method: "POST",
      headers: {
        Authorization: getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postBody),
    });

    if (!postRes.ok) {
      const errText = await postRes.text();
      throw new Error(
        `Post creation failed: ${postRes.status} — ${errText.slice(0, 300)}`,
      );
    }

    const post = await postRes.json();

    return Response.json({
      success: true,
      postId: post.id,
      message: "Thank you! Your review has been submitted and is awaiting approval.",
    });
  } catch (err) {
    console.error("[api/testimonials] Submission failed:", err.message);
    return Response.json(
      {
        success: false,
        message: "Something went wrong while submitting. Please try again.",
      },
      { status: 500 },
    );
  }
}
