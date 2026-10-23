// Newsletter subscribe — server-side proxy to WP CF7 "Newsletter" form (467).
// Pehle band browser se seedha WP ko call karta tha NEXT_PUBLIC_WP_URL se;
// wo variable Vercel par set nahi, is liye request "undefined/wp-json..."
// par ja kar gir jati thi aur user ko generic error milta tha. Baqi forms
// (testimonials waghera) ki tarah ab ye server se jata hai.
const WP_BASE_URL =
  process.env.NEXT_PUBLIC_WP_API_URL || "https://paktravel.hammanitechdemos.com";

const CF7_FORM_ID = 467;

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
      return Response.json(
        { status: "validation_failed", message: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const formData = new FormData();
    formData.append("your-email", email);
    formData.append("_wpcf7", String(CF7_FORM_ID));
    formData.append("_wpcf7_version", "5.9");
    formData.append("_wpcf7_locale", "en_US");
    formData.append("_wpcf7_unit_tag", `wpcf7-f${CF7_FORM_ID}-p0-o1`);
    formData.append("_wpcf7_container_post", "0");

    const res = await fetch(
      `${WP_BASE_URL}/wp-json/contact-form-7/v1/contact-forms/${CF7_FORM_ID}/feedback`,
      { method: "POST", body: formData, signal: AbortSignal.timeout(20000) },
    );
    const data = await res.json();
    return Response.json(data);
  } catch {
    return Response.json(
      { status: "error", message: "Unable to subscribe right now. Please try again later." },
      { status: 502 },
    );
  }
}
