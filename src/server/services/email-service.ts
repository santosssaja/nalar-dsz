import nodemailer from "nodemailer";

export interface SendVerificationEmailOptions {
  toEmail: string;
  verificationUrl: string;
  displayName?: string;
  mode?: "login" | "register";
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  devVerificationUrl?: string;
  error?: string;
}

export async function sendVerificationEmail({
  toEmail,
  verificationUrl,
  displayName,
  mode = "login",
}: SendVerificationEmailOptions): Promise<SendEmailResult> {
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);
  const smtpSecure = process.env.SMTP_SECURE !== "false" && smtpPort === 465;
  const smtpFrom =
    process.env.SMTP_FROM || (smtpUser ? `Nalar <${smtpUser}>` : "Nalar <no-reply@nalar.id>");

  const greeting = displayName ? `Halo ${displayName},` : "Halo Pelajar Nalar,";
  const actionText =
    mode === "register" ? "Selesaikan Pendaftaran & Masuk" : "Masuk ke Akun Nalar";
  const headingText =
    mode === "register"
      ? "Verifikasi Pendaftaran Akun Nalar"
      : "Tautan Masuk Sekali Klik (Magic Link)";

  const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headingText}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
    .card { max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .logo { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; background: #0284c7; color: #ffffff; border-radius: 10px; font-weight: bold; font-size: 20px; margin-bottom: 20px; }
    h1 { font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 12px; }
    p { font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 16px 0; }
    .btn-container { margin: 28px 0; text-align: center; }
    .btn { display: inline-block; background-color: #0284c7; color: #ffffff !important; font-size: 14px; font-weight: 600; text-decoration: none; padding: 14px 28px; border-radius: 10px; box-shadow: 0 2px 4px rgba(2, 132, 199, 0.2); }
    .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; line-height: 1.5; }
    .fallback-url { word-break: break-all; color: #0284c7; font-size: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">N</div>
    <h1>${headingText}</h1>
    <p>${greeting}</p>
    <p>Kami menerima permintaan untuk ${
      mode === "register" ? "mendaftarkan akun baru" : "masuk ke akun"
    } Nalar menggunakan alamat email ini. Klik tombol di bawah untuk memverifikasi dan langsung masuk:</p>
    
    <div class="btn-container">
      <a href="${verificationUrl}" class="btn" target="_blank">${actionText} →</a>
    </div>

    <p>Tautan ini berlaku selama <strong>15 menit</strong> dan hanya dapat digunakan satu kali.</p>
    <p>Jika kamu tidak meminta email ini, kamu dapat mengabaikannya dengan aman.</p>

    <div class="footer">
      <p>Jika tombol di atas tidak berfungsi, salin dan buka tautan berikut di perambanmu:</p>
      <p><a href="${verificationUrl}" class="fallback-url">${verificationUrl}</a></p>
      <p style="margin-top: 16px;">© ${new Date().getFullYear()} Nalar — Platform Pembelajaran STEM Berpusat pada Pemahaman.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const textContent = `
${headingText}
${greeting}

Kami menerima permintaan untuk ${
    mode === "register" ? "mendaftarkan akun baru" : "masuk ke akun"
  } Nalar.
Klik atau buka tautan di bawah ini untuk memverifikasi dan langsung masuk:

${verificationUrl}

Tautan ini berlaku selama 15 menit dan hanya dapat digunakan satu kali.
Jika kamu tidak meminta email ini, abaikan pesan ini.

© ${new Date().getFullYear()} Nalar
  `.trim();

  // If SMTP user and password are provided, send via nodemailer Gmail SMTP
  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const info = await transporter.sendMail({
        from: smtpFrom,
        to: toEmail,
        subject: `[Nalar] ${headingText}`,
        text: textContent,
        html: htmlContent,
      });

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("[SMTP ERROR] Gagal mengirim email via Gmail SMTP:", errorMessage);
      // Fallback for development if SMTP fails
      return {
        success: true,
        devVerificationUrl: verificationUrl,
        error: `SMTP gagal dikirim (${errorMessage}). Gunakan tautan verifikasi langsung.`,
      };
    }
  }

  // Development / Test mode without configured SMTP credentials
  console.info(
    `\n================ [NALAR EMAIL SERVICE (DEV/TEST)] ================\n` +
      `Tujuan: ${toEmail}\n` +
      `Subjek: [Nalar] ${headingText}\n` +
      `Tautan Verifikasi Sekali Klik:\n${verificationUrl}\n` +
      `==================================================================\n`
  );

  return {
    success: true,
    devVerificationUrl: verificationUrl,
  };
}
