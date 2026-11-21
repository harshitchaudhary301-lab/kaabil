import { describe, it, expect, beforeEach } from "vitest";
import { ApplicationService } from "@/lib/employer/application-service";
import { OpportunityService } from "@/lib/employer/opportunity-service";
import { devStore } from "@/lib/dev-store";
import { JobOpportunityRecord } from "@/types/employer";

describe("Candidate Applications & Applicant Tracking System (ATS)", () => {
  const orgId = "emp-hosp-03";
  let publishedOpp: JobOpportunityRecord;

  beforeEach(() => {
    // 1. Setup verified healthcare employer
    devStore.saveEmployerOrganization({
      id: orgId,
      name: "Max Healthcare Care Services",
      slug: "max-healthcare",
      industry: "Healthcare",
      sector: "Private",
      supportedStreams: ["MEDICAL_PCB"],
      officialEmail: "careers@maxhealthcare.in",
      registrationNumber: "U85100DL2001PLC111222",
      size: "1000+",
      city: "New Delhi",
      state: "Delhi",
      country: "India",
      description: "Premier super-specialty hospital network.",
      verificationStatus: "VERIFIED",
      verifiedAt: new Date().toISOString(),
      authorizedPersonName: "Dr. Ananya Sen",
      authorizedPersonDesignation: "Head HR",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 2. Setup published medical opportunity
    publishedOpp = OpportunityService.createOpportunity(orgId, {
      title: "Clinical Biochemistry Specialist",
      stream: "MEDICAL_PCB",
      department: "Pathology & Diagnostics",
      opportunityType: "FULL_TIME",
      workplaceType: "ON_SITE",
      city: "New Delhi",
      state: "Delhi",
      country: "India",
      description: "Perform automated clinical biochemistry assays and validate electrolyte profiles.",
      responsibilities: ["Operate automated blood analyzers.", "Report critical lab values."],
      requiredSkills: ["Biochemistry Assays", "Laboratory Safety"],
      preferredSkills: ["Quality Control Validation"],
      competencyRequirements: [
        {
          skillName: "Biochemistry Assays",
          category: "CLINICAL",
          importance: "MANDATORY",
          minProficiency: "INTERMEDIATE",
          acceptableEvidence: ["PLATFORM_ASSESSMENT"],
        },
        {
          skillName: "Laboratory Safety",
          category: "REGULATORY",
          importance: "MANDATORY",
          minProficiency: "INTERMEDIATE",
          acceptableEvidence: ["PLATFORM_ASSESSMENT"],
        },
      ],
      minStage: "UNDERGRADUATE",
      requiredQualifications: ["B.Sc / M.Sc Medical Biochemistry"],
      experienceYearsMin: 0,
      compensation: { isDisclosed: true, minSalary: 5.5, maxSalary: 7.5, currency: "INR" },
      deadline: "2026-12-31",
      availablePositions: 2,
      status: "PUBLISHED",
    });
  });

  it("should evaluate candidate eligibility with explainable match breakdown", () => {
    const adultStudent = {
      id: "sp-adult-mbbs-01",
      name: "Rohit Verma",
      email: "rohit.verma@example.in",
      educationStage: "UNDERGRADUATE" as const,
      currentStream: "MEDICAL_PCB" as const,
      isMinor: false,
      readinessIndex: 82,
      verifiedSkills: ["Biochemistry Assays", "Laboratory Safety", "Pathology"],
    };

    const evaluation = ApplicationService.evaluateCandidateEligibility(publishedOpp, adultStudent);
    expect(evaluation.isEligible).toBe(true);
    expect(evaluation.matchScore).toBeGreaterThanOrEqual(80);
    expect(evaluation.missingRequirements.length).toBe(0);
  });

  it("should evaluate candidate with partial skills and provide explainable gaps", () => {
    const developingStudent = {
      id: "sp-adult-developing-02",
      name: "Sneha Rao",
      email: "sneha.rao@example.in",
      educationStage: "UNDERGRADUATE" as const,
      currentStream: "MEDICAL_PCB" as const,
      isMinor: false,
      readinessIndex: 45,
      verifiedSkills: ["Biochemistry Assays"], // missing Laboratory Safety
    };

    const evaluation = ApplicationService.evaluateCandidateEligibility(publishedOpp, developingStudent);
    expect(evaluation.matchScore).toBeLessThan(80);
    expect(evaluation.missingRequirements.some((r) => r.includes("Laboratory Safety"))).toBe(true);
  });

  it("should strictly block minor students (<18 / Class 8-10) per DPDP Act 2023", () => {
    // 1. Explicitly minor student
    const minorStudent = {
      id: "sp-minor-class9-01",
      name: "Aman Gupta",
      email: "aman.minor@school.edu",
      educationStage: "CLASS_9" as const,
      currentStream: "MEDICAL_PCB" as const,
      isMinor: true, // DPDP minor flag
      readinessIndex: 70,
      verifiedSkills: ["Biochemistry Assays"],
    };

    expect(() => {
      ApplicationService.applyToOpportunity({
        opportunityId: publishedOpp.id,
        studentProfile: minorStudent,
        coverNote: "I want to apply for clinical biochemistry.",
      });
    }).toThrow(/(minor.*DPDP Act|DPDP Act.*minor)/i);

    // 2. Class 10 student (statutory minor)
    const class10Student = {
      id: "sp-class10-student",
      name: "Pooja Child",
      email: "pooja.c@school.edu",
      educationStage: "CLASS_10" as const,
      currentStream: "MEDICAL_PCB" as const,
      readinessIndex: 75,
      verifiedSkills: ["Biochemistry Assays"],
    };

    expect(() => {
      ApplicationService.applyToOpportunity({
        opportunityId: publishedOpp.id,
        studentProfile: class10Student,
      });
    }).toThrow(/(minor.*DPDP Act|DPDP Act.*minor)/i);
  });

  it("should successfully submit adult student application and disallow duplicates", () => {
    const adultStudent = {
      id: "sp-adult-applicant-05",
      name: "Vikram Malhotra",
      email: "vikram.m@domain.in",
      educationStage: "POSTGRADUATE" as const,
      currentStream: "MEDICAL_PCB" as const,
      isMinor: false,
      readinessIndex: 88,
      verifiedSkills: ["Biochemistry Assays", "Laboratory Safety"],
    };

    const app = ApplicationService.applyToOpportunity({
      opportunityId: publishedOpp.id,
      studentProfile: adultStudent,
      coverNote: "Enthusiastic to contribute to clinical biochemistry assays.",
    });

    expect(app.id).toBeDefined();
    expect(app.stage).toBe("APPLIED");
    expect(app.opportunityTitle).toBe(publishedOpp.title);
    expect(app.matchScore).toBeGreaterThanOrEqual(70);
    expect(app.statusHistory.length).toBe(1);

    // Second application to same opportunity must be blocked
    expect(() => {
      ApplicationService.applyToOpportunity({
        opportunityId: publishedOpp.id,
        studentProfile: adultStudent,
      });
    }).toThrow(/already applied/i);
  });

  it("should allow adult student to withdraw submitted application", () => {
    const adultStudent = {
      id: "sp-withdraw-student-06",
      name: "Kavita Reddy",
      email: "kavita.r@domain.in",
      educationStage: "UNDERGRADUATE" as const,
      currentStream: "MEDICAL_PCB" as const,
      isMinor: false,
      readinessIndex: 76,
      verifiedSkills: ["Biochemistry Assays", "Laboratory Safety"],
    };

    const app = ApplicationService.applyToOpportunity({
      opportunityId: publishedOpp.id,
      studentProfile: adultStudent,
    });

    expect(app.stage).toBe("APPLIED");

    const withdrawn = ApplicationService.withdrawApplication(app.id, adultStudent.id);
    expect(withdrawn).not.toBeNull();
    expect(withdrawn!.stage).toBe("WITHDRAWN");

    // Check status history logged withdrawal
    expect(withdrawn!.statusHistory.some((h) => h.stage === "WITHDRAWN")).toBe(true);
  });

  it("should progress application through ATS stages with recruiter notes and human review record", () => {
    const adultStudent = {
      id: "sp-hire-track-07",
      name: "Amitabh Sen",
      email: "amitabh.s@domain.in",
      educationStage: "UNDERGRADUATE" as const,
      currentStream: "MEDICAL_PCB" as const,
      isMinor: false,
      readinessIndex: 85,
      verifiedSkills: ["Biochemistry Assays", "Laboratory Safety"],
    };

    const app = ApplicationService.applyToOpportunity({
      opportunityId: publishedOpp.id,
      studentProfile: adultStudent,
    });

    // 1. Move to UNDER_REVIEW
    const reviewed = ApplicationService.updateApplicationStage({
      applicationId: app.id,
      organizationId: orgId,
      newStage: "UNDER_REVIEW",
      updatedBy: "Recruiter Pooja",
      recruiterNotes: "Verified clinical credential in digital passport.",
    });
    expect(reviewed.stage).toBe("UNDER_REVIEW");
    expect(reviewed.recruiterNotes).toContain("Verified clinical credential");

    // 2. Move to SHORTLISTED
    const shortlisted = ApplicationService.updateApplicationStage({
      applicationId: app.id,
      organizationId: orgId,
      newStage: "SHORTLISTED",
      updatedBy: "Dr. Ananya Sen",
    });
    expect(shortlisted.stage).toBe("SHORTLISTED");

    // 3. Move to INTERVIEW_SCHEDULED
    const interview = ApplicationService.updateApplicationStage({
      applicationId: app.id,
      organizationId: orgId,
      newStage: "INTERVIEW_SCHEDULED",
      updatedBy: "Recruiter Pooja",
      interviewSlot: "2026-12-05 10:00 AM IST",
    });
    expect(interview.stage).toBe("INTERVIEW_SCHEDULED");

    // 4. Move to OFFER_ISSUED
    const offer = ApplicationService.updateApplicationStage({
      applicationId: app.id,
      organizationId: orgId,
      newStage: "OFFER_ISSUED",
      updatedBy: "Dr. Ananya Sen",
      offerDetails: "CTC: 6.8 LPA + Medical Benefits",
    });
    expect(offer.stage).toBe("OFFER_ISSUED");

    // 5. Final Stage: HIRED
    const hired = ApplicationService.updateApplicationStage({
      applicationId: app.id,
      organizationId: orgId,
      newStage: "HIRED",
      updatedBy: "Dr. Ananya Sen",
      recruiterNotes: "Offer accepted by candidate. Joining Jan 2027.",
    });
    expect(hired.stage).toBe("HIRED");
    expect(hired.statusHistory.length).toBe(6); // Applied + 5 transitions
  });
});
