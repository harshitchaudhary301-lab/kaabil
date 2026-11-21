// ==============================================================================
// KAABIL (काबिल) — Current Session API Endpoint
// ==============================================================================

import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSessionUser();
    return NextResponse.json({
      isAuthenticated: !!user,
      user: user || null,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { isAuthenticated: false, user: null, error: err.message },
      { status: 500 }
    );
  }
}
