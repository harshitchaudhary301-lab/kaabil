import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { devStore } from "@/lib/dev-store";
import { CMSContentItem, CMSContentType, CMSContentStatus } from "@/types/admin";
import { EducationalStream } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || undefined;
    const stream = searchParams.get("stream") || undefined;
    const status = searchParams.get("status") || undefined;

    const items = devStore.getCMSContentItems({ type, stream, status });

    return NextResponse.json({
      success: true,
      items,
      totalCount: items.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load CMS content items." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    const adminId = sessionUser?.id || "admin-super-01";
    const adminName = sessionUser?.name || "Dr. Vikramaditya Sen";

    const body = await req.json();
    const { id, type, title, stream, summary, content, tags, status, targetAudiences } = body;

    if (!type || !title || !content) {
      return NextResponse.json(
        { success: false, error: "type, title, and content are required." },
        { status: 400 }
      );
    }

    const itemId = id || `cms-${type.toLowerCase()}-${Date.now()}`;
    const now = new Date().toISOString();

    const existing = id ? devStore.getCMSContentItem(id) : null;

    const cmsItem: CMSContentItem = {
      id: itemId,
      type: type as CMSContentType,
      title,
      stream: (stream || "INTERDISCIPLINARY") as EducationalStream,
      summary: summary || "",
      content,
      tags: tags || [],
      status: (status || "DRAFT") as CMSContentStatus,
      authorName: existing?.authorName || adminName,
      authorId: existing?.authorId || adminId,
      publishedAt: status === "PUBLISHED" ? (existing?.publishedAt || now) : undefined,
      updatedAt: now,
      version: (existing?.version || 0) + 1,
      targetAudiences: targetAudiences || ["STUDENT", "INSTITUTION", "EMPLOYER"],
    };

    devStore.saveCMSContentItem(cmsItem);

    devStore.saveAdminAuditLog({
      adminId,
      adminName,
      action: existing ? "CMS_CONTENT_UPDATED" : "CMS_CONTENT_CREATED",
      targetType: "CMS_CONTENT",
      targetId: itemId,
      targetName: title,
      details: `Saved content item '${title}' (${type}) with status ${cmsItem.status}.`,
      timestamp: now,
    });

    return NextResponse.json({
      success: true,
      message: `CMS content '${title}' saved successfully.`,
      item: cmsItem,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save CMS item." },
      { status: 500 }
    );
  }
}
