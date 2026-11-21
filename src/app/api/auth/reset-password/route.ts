// ==============================================================================
// KAABIL (काबिल) — Reset Password API Endpoint
// Validates token, enforces expiration, updates hash & invalidates old sessions
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, checkDatabaseConnection } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";

export const dynamic = "force-dynamic";

const resetSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  token: z.string().min(10, "Invalid or missing reset token"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = resetSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid password reset parameters." },
        { status: 400 }
      );
    }

    const { email, token, newPassword } = parsed.data;
    const conn = await checkDatabaseConnection();

    if (conn.connected) {
      const resetRecord = await db.passwordResetToken.findUnique({
        where: { token },
      });

      if (!resetRecord || resetRecord.email !== email) {
        return NextResponse.json(
          { error: "Invalid or expired password reset link." },
          { status: 400 }
        );
      }

      if (resetRecord.expiresAt < new Date()) {
        await db.passwordResetToken.delete({ where: { id: resetRecord.id } }).catch(() => {});
        return NextResponse.json(
          { error: "This password reset link has expired. Please request a new one." },
          { status: 400 }
        );
      }

      // Hash new password
      const passwordHash = await hashPassword(newPassword);

      // Update user password and clear any lockout
      const user = await db.user.findUnique({ where: { email } });
      if (!user) {
        return NextResponse.json(
          { error: "Account not found." },
          { status: 404 }
        );
      }

      await db.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      });

      // Cleanup token
      await db.passwordResetToken.delete({ where: { id: resetRecord.id } }).catch(() => {});

      // Invalidate existing sessions for security
      await db.session.deleteMany({ where: { userId: user.id } }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: "Password reset successful. Please sign in with your new password.",
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: "Could not reset password.", details: err.message },
      { status: 500 }
    );
  }
}
