// ==============================================================================
// KAABIL (काबिल) — Forgot Password API Endpoint
// Generates secure expiring tokens; transparently reports unconfigured SMTP
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { db, checkDatabaseConnection } from "@/lib/db";
import { devStore } from "@/lib/dev-store";
import { checkRateLimit } from "@/lib/auth/rate-limiter";

export const dynamic = "force-dynamic";

const forgotSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase().trim(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = forgotSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please provide a valid registered email address." },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Rate limit password recovery to prevent spam
    const rateLimit = checkRateLimit(`forgot:${email}`, 3, 900);
    if (!rateLimit.isAllowed) {
      return NextResponse.json(
        {
          error: `Too many password reset requests. Please wait ${rateLimit.resetInSeconds} seconds.`,
        },
        { status: 429 }
      );
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    const conn = await checkDatabaseConnection();
    let userExists = false;

    if (conn.connected) {
      const user = await db.user.findUnique({ where: { email } });
      if (user) {
        userExists = true;
        // Upsert or create reset token
        await db.passwordResetToken.deleteMany({ where: { email } }).catch(() => {});
        await db.passwordResetToken.create({
          data: {
            email,
            token,
            expiresAt,
          },
        });
      }
    } else {
      const offlineUser = devStore.getUserByEmail(email);
      if (offlineUser) {
        userExists = true;
        devStore.saveResetToken(token, email, expiresAt);
      }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${appUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    // Notice: Never pretend an email was sent if SMTP is not configured.
    return NextResponse.json({
      success: true,
      emailSent: false, // Explicitly false since external SMTP is unconfigured
      message: userExists
        ? "Password reset token generated. SMTP email delivery is unconfigured in development. Use the secure reset link below."
        : "If this email is registered in our ecosystem, password reset instructions have been generated.",
      resetUrl: userExists ? resetUrl : null,
      token: userExists ? token : null,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: "Failed to process password reset request.", details: err.message },
      { status: 500 }
    );
  }
}
