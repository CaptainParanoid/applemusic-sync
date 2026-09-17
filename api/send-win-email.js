// ---------------------------------------------------------------------------
// Vercel-style serverless API route (Node runtime).
//
// Deployed at /api/send-win-email once this site is on Vercel. Receives the
// POST sent by src/api/sendWinEmail.js when Claudia wins the minigame, and
// is responsible for actually sending the "you did it!" email that reveals
// the hidden gift URL (the /gift route on this site).
//
// TODO(Tina):
//   1. Pick an email provider (Resend and SendGrid are both easy) and add
//      its API key as a Vercel environment variable, e.g. RESEND_API_KEY.
//   2. Fill in the real recipient email address(es) below.
//   3. Fill in GIFT_URL below (the deployed site's /gift-login URL) so the
//      email can link straight to the gift reveal gate.
//   4. Uncomment / adapt the provider call in `sendEmail()`.
//
// No real secrets are committed here — everything provider-specific reads
// from environment variables that only exist in your Vercel project.
// ---------------------------------------------------------------------------

// TODO(Tina): replace with the real recipient(s), e.g. ["tina@example.com"].
const NOTIFY_EMAILS = ["TODO@example.com"];

// TODO(Tina): replace with the deployed site's real gift URL.
const GIFT_URL = "https://TODO-your-deployed-site.vercel.app/gift-login";

async function sendEmail({ to, subject, body }) {
  // --- Example using Resend (https://resend.com) --------------------------
  // const { Resend } = await import("resend");
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: "Claudia Surprise <surprise@yourdomain.com>",
  //   to,
  //   subject,
  //   text: body,
  // });

  // --- Example using SendGrid (https://sendgrid.com) -----------------------
  // const sgMail = (await import("@sendgrid/mail")).default;
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  // await sgMail.send({
  //   to,
  //   from: "surprise@yourdomain.com",
  //   subject,
  //   text: body,
  // });

  // For now (no provider configured yet) just log so this route is easy to
  // test end-to-end before an email provider is wired in.
  console.log("[send-win-email] would send email:", { to, subject, body });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { score, timestamp } = req.body || {};

    await sendEmail({
      to: NOTIFY_EMAILS,
      subject: "🎉 Claudia won the game!",
      body:
        `Claudia just caught enough cheese doodles to win the minigame ` +
        `(score: ${score ?? "?"}, at ${timestamp ?? "unknown time"}).\n\n` +
        `Gift reveal link: ${GIFT_URL}`,
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("[send-win-email] error", err);
    res.status(500).json({ ok: false, error: "Failed to send email" });
  }
}
