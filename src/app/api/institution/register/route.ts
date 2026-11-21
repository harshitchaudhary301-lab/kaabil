import { NextRequest, NextResponse } from "next/server";
import { InstitutionService } from "@/lib/institution/institution-service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name || !body.officialEmail || !body.city || !body.state) {
      return NextResponse.json(
        { success: false, error: "Name, official email, city, and state are required." },
        { status: 400 }
      );
    }

    const institution = await InstitutionService.registerInstitution({
      name: body.name,
      orgType: body.orgType || "COLLEGE_UNIVERSITY",
      officialEmail: body.officialEmail,
      officialWebsite: body.officialWebsite,
      registrationNumber: body.registrationNumber,
      accreditationBody: body.accreditationBody,
      city: body.city,
      state: body.state,
      country: body.country || "India",
      supportedStreams: body.supportedStreams || ["NON_MEDICAL_PCM"],
      authorizedPersonName: body.authorizedPersonName || "Administrator",
      authorizedPersonDesignation: body.authorizedPersonDesignation || "Registrar",
    });

    return NextResponse.json({ success: true, institution });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to register institution." },
      { status: 500 }
    );
  }
}
