import { describe, it, expect, beforeEach } from "vitest";
import { OpportunityService } from "@/lib/employer/opportunity-service";
import { IndustryChallengeService } from "@/lib/employer/industry-challenge-service";
import { MatchingEngine } from "@/lib/employer/matching-engine";
import { CandidateDiscoveryService } from "@/lib/employer/candidate-discovery-service";
import { InterviewService } from "@/lib/employer/interview-service";
import { ApplicationService } from "@/lib/employer/application-service";
import { CredentialService } from "@/lib/passport/credential-service";
import { devStore } from "@/lib/dev-store";

describe("Unified Intelligence Loop — End-to-End Cross-Portal Lifecycle (Part F2)", () => {
  beforeEach(() => {
    devStore.reset();
  });

  it("executes the full closed loop: Employer Opportunity -> Challenge -> Passport Evidence -> Explainable Match -> Interview Rubric -> ATS Hire", () => {
    // -------------------------------------------------------------------------
    // STEP 1: Employer Posts Opportunity with Required Skills
    // -------------------------------------------------------------------------
    const opp = OpportunityService.createOpportunity({
      organizationId: "emp-apex-diag",
      title: "Senior Clinical Biochemist",
      industry: "Healthcare & Diagnostics",
      stream: "MEDICAL_PCB",
      department: "Diagnostic Pathology",
      opportunityType: "FULL_TIME",
      workplaceType: "ON_SITE",
      city: "Mumbai",
      state: "Maharashtra",
      description: "Perform advanced diagnostic assays and oversee automated biochemistry analyzers.",
      responsibilities: ["Calibrate analyzers", "Sign off on diagnostic panels"],
      requiredSkills: ["Clinical Biochemistry", "Phlebotomy", "Quality Control"],
      preferredSkills: ["Chromatography"],
      minStage: "UNDERGRADUATE",
      status: "PUBLISHED",
    });

    expect(opp.id).toBeDefined();

    // -------------------------------------------------------------------------
    // STEP 2: Employer Publishes Practical Industry Challenge
    // -------------------------------------------------------------------------
    const challenge = IndustryChallengeService.createChallenge({
      organizationId: "emp-apex-diag",
      title: "Clinical Biochemistry Quality Assurance Challenge",
      category: "PRACTICAL_PROJECT",
      stream: "MEDICAL_PCB",
      difficulty: "ADVANCED",
      description: "Analyze QA anomalies in multi-channel chemistry analyzer calibration curves.",
      problemStatement: "Given 100 control samples, identify drift anomalies and propose remediation.",
      deliverables: ["Quality Control Protocol Report", "Calibration Drift Model"],
      requiredSkills: ["Clinical Biochemistry", "Quality Control"],
      rubricCriteria: [{ criterion: "Accuracy", weight: 50 }, { criterion: "Methodology", weight: 50 }],
      submissionDeadline: "2026-12-31",
      rewardCredentialTitle: "Certified Clinical Biochemistry QA Analyst",
    });

    expect(challenge.id).toBeDefined();

    // -------------------------------------------------------------------------
    // STEP 3: Student Enrolls, Submits Deliverable & Earns Verified Credential
    // -------------------------------------------------------------------------
    const student = {
      id: "sp-loop-student-01",
      name: "Aryan Sharma",
      email: "aryan.sharma@example.com",
      isMinor: false,
      educationStage: "UNDERGRADUATE" as const,
      currentStream: "MEDICAL_PCB" as const,
    };

    IndustryChallengeService.registerParticipant(challenge.id, student);

    const submission = IndustryChallengeService.submitChallengeDeliverable({
      challengeId: challenge.id,
      studentProfile: student,
      submissionUrl: "https://github.com/aryan-sharma/biochem-qa-model",
      summary: "Developed automated anomaly detection model for analyzer drift.",
    });

    const evaluated = IndustryChallengeService.evaluateSubmission({
      submissionId: submission.id,
      organizationId: "emp-apex-diag",
      reviewerName: "Dr. Rohit Verma",
      score: 95,
      feedback: "Exceptional analysis with verified quality control methodology.",
      decision: "APPROVED",
    });

    expect(evaluated.status).toBe("APPROVED");
    expect(evaluated.awardedCredentialId).toBeDefined();

    // Verify credential in passport
    const creds = devStore.getStudentCredentials(student.id);
    expect(creds.length).toBeGreaterThan(0);
    const verifiedCred = creds[0];
    const cryptoCheck = CredentialService.verifyCredential(verifiedCred);
    expect(cryptoCheck.isValid).toBe(true);

    // -------------------------------------------------------------------------
    // STEP 4: Student Opts into Candidate Discovery
    // -------------------------------------------------------------------------
    CandidateDiscoveryService.updateDiscoveryPreference({
      studentProfileId: student.id,
      isMinor: false,
      educationStage: "UNDERGRADUATE",
      optIn: true,
      profileData: {
        name: student.name,
        email: student.email,
        stream: "MEDICAL_PCB",
        careerReadinessIndex: 88,
        verifiedSkills: ["Clinical Biochemistry", "Phlebotomy", "Quality Control"],
        projects: [
          {
            title: challenge.title,
            description: submission.summary,
            url: submission.submissionUrl,
          },
        ],
        qualifications: ["Bachelor of Science (Medical Biochemistry)"],
      },
    });

    // -------------------------------------------------------------------------
    // STEP 5: Explainable Talent Matching Identifies Candidate
    // -------------------------------------------------------------------------
    const matches = MatchingEngine.matchCandidatesForOpportunity({
      opportunityId: opp.id,
      organizationId: "emp-apex-diag",
    });

    const studentMatch = matches.find((m) => m.candidateName === student.name);
    expect(studentMatch).toBeDefined();
    expect(studentMatch!.overallScore).toBeGreaterThanOrEqual(75); // Strong match!
    expect(studentMatch!.mandatoryQualificationsStatus).toBe("SATISFIED");
    expect(studentMatch!.plainLanguageExplanation).toContain("match");

    // -------------------------------------------------------------------------
    // STEP 6: Employer Invites Student & Student Applies
    // -------------------------------------------------------------------------
    const invitation = CandidateDiscoveryService.sendInvitation({
      organizationId: "emp-apex-diag",
      recruiterId: "rec-dr-verma",
      recruiterName: "Dr. Rohit Verma",
      opportunityId: opp.id,
      candidateId: studentMatch!.candidateId,
      note: "Your verified credential in Clinical Biochemistry impressed our team.",
    });

    expect(invitation.status).toBe("PENDING");

    const application = ApplicationService.applyToOpportunity({
      opportunityId: opp.id,
      studentProfile: student,
      coverNote: "I look forward to discussing my verified diagnostic models.",
    });

    expect(application.stage).toBe("APPLIED");

    // Recruiter shortlists
    ApplicationService.updateApplicationStage({
      organizationId: "emp-apex-diag",
      applicationId: application.id,
      stage: "SHORTLISTED",
      recruiterName: "Dr. Rohit Verma",
      recruiterNotes: "Shortlisted based on 95% QA Challenge credential.",
    });

    // -------------------------------------------------------------------------
    // STEP 7: Schedule Interview & Complete 1–5 Structured Rubric Evaluation
    // -------------------------------------------------------------------------
    const interview = InterviewService.scheduleInterview({
      organizationId: "emp-apex-diag",
      applicationId: application.id,
      recruiterId: "rec-dr-verma",
      recruiterName: "Dr. Rohit Verma",
      interviewType: "TECHNICAL",
      scheduledDate: "2026-12-15",
      startTime: "11:00",
      venueOrMeetingLink: "https://meet.google.com/kaabil-final-hire",
    });

    expect(interview.status).toBe("SCHEDULED");

    const finishedInterview = InterviewService.submitInterviewFeedback({
      interviewId: interview.id,
      organizationId: "emp-apex-diag",
      rubricScores: {
        technicalCompetency: 5,
        domainKnowledge: 5,
        problemSolving: 5,
        communication: 4,
      },
      recommendation: "STRONG_YES",
      feedbackNotes: "Candidate demonstrated master-level diagnostic accuracy and strong leadership potential.",
    });

    expect(finishedInterview.status).toBe("COMPLETED");

    // -------------------------------------------------------------------------
    // STEP 8: ATS Status Progression to OFFER_ISSUED and HIRED
    // -------------------------------------------------------------------------
    const offeredApp = ApplicationService.updateApplicationStage({
      organizationId: "emp-apex-diag",
      applicationId: application.id,
      stage: "OFFER_ISSUED",
      recruiterName: "Dr. Rohit Verma",
      recruiterNotes: "Official offer extended for Senior Clinical Biochemist.",
    });

    expect(offeredApp?.stage).toBe("OFFER_ISSUED");

    const hiredApp = ApplicationService.updateApplicationStage({
      organizationId: "emp-apex-diag",
      applicationId: application.id,
      stage: "HIRED",
      recruiterName: "Dr. Rohit Verma",
      recruiterNotes: "Candidate accepted offer and confirmed joining date.",
    });

    expect(hiredApp?.stage).toBe("HIRED");
    expect(hiredApp?.statusHistory.some((h) => h.stage === "HIRED")).toBe(true);
  });
});
