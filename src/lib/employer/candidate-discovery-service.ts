// ==============================================================================
// KAABIL (काबिल) — Passive Candidate Discovery & Consent Service
// Candidate-controlled visibility with explicit adult opt-in.
// Verified employer access only. Strictly shields minors (<18 or Class 8-10).
// Compliant with DPDP Act 2023.
// ==============================================================================

import crypto from "crypto";
import { devStore } from "@/lib/dev-store";
import {
  CandidateDiscoveryProfile,
  RecruitmentInvitationRecord,
} from "@/types/employer";
import { EducationalStream, EducationStage } from "@/types";

export class CandidateDiscoveryService {
  /**
   * Searches discoverable adult candidates with skill & stream filters.
   * Strictly enforces verified employer status and adult discovery opt-in.
   */
  public static searchCandidates(params: {
    organizationId: string;
    stream?: string;
    stage?: string;
    minCRI?: number;
    search?: string;
    minCoverage?: number;
  }): CandidateDiscoveryProfile[] {
    const org = devStore.getEmployerOrganization(params.organizationId);
    if (!org || org.verificationStatus !== "VERIFIED") {
      throw new Error(
        "Unauthorized discovery: Only verified employer organizations can search candidate discovery profiles."
      );
    }

    const profiles = devStore.getCandidateDiscoveryProfiles({
      stream: params.stream,
      stage: params.stage,
      minCRI: params.minCRI,
      search: params.search,
    });

    // Hard secondary safeguard: Under-18 accounts must never be returned
    return profiles.filter((p: CandidateDiscoveryProfile) => !p.isMinor && p.discoveryOptIn);
  }

  /**
   * Retrieves an employer-facing candidate profile with verified evidence.
   */
  public static getCandidateProfile(params: {
    organizationId: string;
    candidateId: string;
  }): {
    candidate: CandidateDiscoveryProfile;
    verifiedCredentials: any[];
  } {
    const org = devStore.getEmployerOrganization(params.organizationId);
    if (!org || org.verificationStatus !== "VERIFIED") {
      throw new Error(
        "Unauthorized access: Only verified employers may inspect candidate discovery profiles."
      );
    }

    const candidate = devStore.getCandidateDiscoveryProfile(params.candidateId);
    if (!candidate || candidate.isMinor || !candidate.discoveryOptIn) {
      throw new Error("Candidate profile not found or candidate has not authorized discovery.");
    }

    // Retrieve verified credentials from student's Digital Skill Passport
    const passportCredentials = devStore.getStudentCredentials
      ? devStore.getStudentCredentials(candidate.studentProfileId)
      : [];

    return {
      candidate,
      verifiedCredentials: passportCredentials,
    };
  }

  /**
   * Updates student's recruitment discovery visibility.
   * Strictly blocks minors (<18 or Class 8–10) per DPDP Act 2023.
   */
  public static updateDiscoveryPreference(params: {
    studentProfileId: string;
    isMinor: boolean;
    educationStage: EducationStage;
    optIn: boolean;
    profileData?: Partial<CandidateDiscoveryProfile>;
  }): boolean {
    if (params.isMinor || ["CLASS_8", "CLASS_9", "CLASS_10"].includes(params.educationStage)) {
      throw new Error(
        "Statutory Privacy Restriction: Under-18 students are legally restricted from employer recruitment discovery under the DPDP Act (2023)."
      );
    }

    if (!params.optIn) {
      // Immediate consent withdrawal: drop from discovery index
      devStore.deleteCandidateDiscoveryProfile(params.studentProfileId);
      return false;
    }

    // Ensure candidate discovery profile exists and is updated
    const existing = devStore.getCandidateDiscoveryProfile(params.studentProfileId) || {};
    const updated: CandidateDiscoveryProfile = {
      ...existing,
      ...params.profileData,
      id: existing.id || `disc-${crypto.randomUUID()}`,
      studentProfileId: params.studentProfileId,
      name: params.profileData?.name || existing.name || "Student Candidate",
      email: params.profileData?.email || existing.email || "student@kaabil.in",
      stream: params.profileData?.stream || existing.stream || "NON_MEDICAL_PCM",
      stage: params.educationStage,
      isMinor: false,
      discoveryOptIn: true,
      careerReadinessIndex: params.profileData?.careerReadinessIndex || existing.careerReadinessIndex || 75,
      verifiedSkills: params.profileData?.verifiedSkills || existing.verifiedSkills || [],
      selfReportedSkills: params.profileData?.selfReportedSkills || existing.selfReportedSkills || [],
      projects: params.profileData?.projects || existing.projects || [],
      qualifications: params.profileData?.qualifications || existing.qualifications || [],
      lastActiveAt: new Date().toISOString(),
    };

    devStore.saveCandidateDiscoveryProfile(updated);
    return true;
  }

  /**
   * Sends an authorized recruitment invitation to an opted-in adult candidate.
   */
  public static sendInvitation(params: {
    organizationId: string;
    recruiterId: string;
    recruiterName: string;
    opportunityId: string;
    candidateId: string;
    note?: string;
  }): RecruitmentInvitationRecord {
    const org = devStore.getEmployerOrganization(params.organizationId);
    if (!org || org.verificationStatus !== "VERIFIED") {
      throw new Error(
        "Unauthorized invitation: Only verified employers may send candidate recruitment invitations."
      );
    }

    const opp = devStore.getJobOpportunity(params.opportunityId);
    if (!opp || opp.status !== "PUBLISHED") {
      throw new Error("Opportunity not found or not published.");
    }

    const candidate = devStore.getCandidateDiscoveryProfile(params.candidateId);
    if (!candidate || candidate.isMinor || !candidate.discoveryOptIn) {
      throw new Error("Candidate is not available for discovery invitations.");
    }

    const existingInvites = devStore.getRecruitmentInvitations(params.organizationId);
    const alreadyInvited = existingInvites.some(
      (inv: any) =>
        inv.opportunityId === params.opportunityId &&
        inv.candidateId === candidate.studentProfileId &&
        inv.status === "PENDING"
    );
    if (alreadyInvited) {
      throw new Error("An active invitation has already been sent to this candidate for this role.");
    }

    const invitation: RecruitmentInvitationRecord = {
      id: `inv-${crypto.randomUUID()}`,
      organizationId: org.id,
      organizationName: org.name,
      opportunityId: opp.id,
      opportunityTitle: opp.title,
      candidateId: candidate.studentProfileId,
      candidateEmail: candidate.email,
      candidateName: candidate.name,
      recruiterId: params.recruiterId,
      recruiterName: params.recruiterName,
      invitationNote: params.note,
      status: "PENDING",
      sentAt: new Date().toISOString(),
    };

    return devStore.saveRecruitmentInvitation(invitation);
  }

  /**
   * Responds to an invitation (accept or decline).
   */
  public static respondToInvitation(params: {
    invitationId: string;
    candidateEmail: string;
    accept: boolean;
  }): RecruitmentInvitationRecord {
    const invitations = devStore.getRecruitmentInvitations(undefined, params.candidateEmail);
    const invite = invitations.find((i: any) => i.id === params.invitationId);
    if (!invite) {
      throw new Error("Invitation not found.");
    }

    invite.status = params.accept ? "ACCEPTED" : "DECLINED";
    invite.respondedAt = new Date().toISOString();

    return devStore.saveRecruitmentInvitation(invite);
  }
}
