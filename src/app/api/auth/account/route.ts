// ==============================================================================
// KAABIL (काबिल) — Account Settings & Deletion API Endpoint
// Enables password updates, privacy preferences, and full DPDP account deletion
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { db, checkDatabaseConnection } from "@/lib/db";
import { requireAuth } from "@/lib/auth/rbac";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { destroySession, SESSION_COOKIE_NAME } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

const deleteAccountSchema = z.object({
  passwordConfirmation: z.string().min(1, "Password confirmation required to delete account"),
});

/**
 * PATCH /api/auth/account — Change password / account settings
 */
export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const parsed = updatePasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = parsed.data;
    const conn = await checkDatabaseConnection();

    if (conn.connected) {
      const dbUser = await db.user.findUnique({ where: { id: user.id } });
      if (!dbUser || !dbUser.passwordHash) {
        return NextResponse.json(
          { error: "User account not found or has no password configured." },
          { status: 404 }
        );
      }

      const isValid = await verifyPassword(currentPassword, dbUser.passwordHash);
      if (!isValid) {
        return NextResponse.json(
          { error: "Current password is incorrect." },
          { status: 401 }
        );
      }

      const newHash = await hashPassword(newPassword);
      await db.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Failed to update account." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/account — Permanent DPDP account deletion
 */
export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const parsed = deleteAccountSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Password confirmation is required to delete your account." },
        { status: 400 }
      );
    }

    const { passwordConfirmation } = parsed.data;
    const conn = await checkDatabaseConnection();

    if (conn.connected) {
      const dbUser = await db.user.findUnique({ where: { id: user.id } });
      if (!dbUser || !dbUser.passwordHash) {
        return NextResponse.json({ error: "User not found." }, { status: 404 });
      }

      const isMatch = await verifyPassword(passwordConfirmation, dbUser.passwordHash);
      if (!isMatch) {
        return NextResponse.json(
          { error: "Incorrect password. Account deletion aborted." },
          { status: 401 }
        );
      }

      // Cascade deletion of User (automatically deletes StudentProfile, UserSkill, Sessions via schema cascades)
      await db.user.delete({ where: { id: user.id } });
    }

    // Clear session cookie
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (token) {
      await destroySession(token);
    }

    const response = NextResponse.json({
      success: true,
      message: "Account and associated personal data permanently deleted per DPDP guidelines.",
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: "",
      httpOnly: true,
      path: "/",
      expires: new Date(0),
      maxAge: 0,
    });

    return response;
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Failed to delete account." },
      { status: 500 }
    );
  }
}
