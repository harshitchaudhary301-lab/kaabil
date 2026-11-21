import { describe, it, expect, beforeEach } from "vitest";
import { InstitutionService } from "@/lib/institution/institution-service";
import { AcademicService } from "@/lib/institution/academic-service";
import { FacultyService } from "@/lib/institution/faculty-service";
import { StudentService } from "@/lib/institution/student-service";
import { devStore } from "@/lib/dev-store";

describe("KAABIL Multi-Tenant Architecture & Institution Intelligence Tests", () => {
  const testRunId = Date.now().toString(36);
  const instAId = `test-inst-a-${testRunId}`;
  const instBId = `test-inst-b-${testRunId}`;

  beforeEach(() => {
    // Seed two independent test tenants
    devStore.saveInstitution({
      id: instAId,
      name: `Delhi Technological Institute ${testRunId}`,
      slug: `dti-${testRunId}`,
      orgType: "ENGINEERING_COLLEGE",
      verificationStatus: "VERIFIED",
      officialEmail: `admin@dti-${testRunId}.edu`,
      city: "New Delhi",
      state: "Delhi",
      country: "India",
      supportedStreams: ["NON_MEDICAL_PCM"],
      authorizedPersonName: "Dr. A. Verma",
      authorizedPersonDesignation: "Registrar",
      isVerified: true,
      invitationCode: `DTI-${testRunId.substring(0, 4).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    devStore.saveInstitution({
      id: instBId,
      name: `Mumbai Medical College ${testRunId}`,
      slug: `mmc-${testRunId}`,
      orgType: "MEDICAL_COLLEGE",
      verificationStatus: "VERIFIED",
      officialEmail: `dean@mmc-${testRunId}.edu`,
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      supportedStreams: ["MEDICAL_PCB"],
      authorizedPersonName: "Dr. B. Kulkarni",
      authorizedPersonDesignation: "Dean",
      isVerified: true,
      invitationCode: `MMC-${testRunId.substring(0, 4).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  describe("Tenant Isolation Enforcement", () => {
    it("strictly isolates departments between Institution A and Institution B", () => {
      // Create Dept for Inst A
      const deptA = AcademicService.createDepartment({
        institutionId: instAId,
        name: "Dept of Computer Science & Robotics",
        code: `CSE-${testRunId}`,
        stream: "NON_MEDICAL_PCM",
        headOfDepartmentName: "Prof. S. Raman",
      });

      // Create Dept for Inst B
      const deptB = AcademicService.createDepartment({
        institutionId: instBId,
        name: "Dept of General Surgery",
        code: `SURG-${testRunId}`,
        stream: "MEDICAL_PCB",
        headOfDepartmentName: "Prof. N. Deshmukh",
      });

      const deptsA = AcademicService.getDepartments(instAId);
      const deptsB = AcademicService.getDepartments(instBId);

      // Verify Inst A only sees Dept A
      expect(deptsA.some((d) => d.id === deptA.id)).toBe(true);
      expect(deptsA.some((d) => d.id === deptB.id)).toBe(false);

      // Verify Inst B only sees Dept B
      expect(deptsB.some((d) => d.id === deptB.id)).toBe(true);
      expect(deptsB.some((d) => d.id === deptA.id)).toBe(false);
    });

    it("strictly isolates faculty members and role invitations across tenants", () => {
      // Invite staff in Inst A
      const facultyA = FacultyService.inviteStaffMember({
        institutionId: instAId,
        name: "Dr. Sunita Rao",
        email: `sunita@dti-${testRunId}.edu`,
        role: "FACULTY",
        designation: "Assistant Professor",
      });

      // Invite staff in Inst B
      const facultyB = FacultyService.inviteStaffMember({
        institutionId: instBId,
        name: "Dr. Anand Joshi",
        email: `anand@mmc-${testRunId}.edu`,
        role: "CAREER_COUNSELOR",
        designation: "Senior Counselor",
      });

      const staffA = FacultyService.getFacultyMembers(instAId);
      const staffB = FacultyService.getFacultyMembers(instBId);

      expect(staffA.some((f) => f.email === facultyA.email)).toBe(true);
      expect(staffA.some((f) => f.email === facultyB.email)).toBe(false);

      expect(staffB.some((f) => f.email === facultyB.email)).toBe(true);
      expect(staffB.some((f) => f.email === facultyA.email)).toBe(false);
    });

    it("strictly isolates student rosters and enrollments between institutions", () => {
      const studentA = StudentService.enrollStudent({
        institutionId: instAId,
        studentProfileId: `prof-a-${testRunId}`,
        studentName: "Aarav Sharma",
        studentEmail: `aarav.${testRunId}@gmail.com`,
        stream: "NON_MEDICAL_PCM",
        stage: "UNDERGRADUATE",
      });

      const studentB = StudentService.enrollStudent({
        institutionId: instBId,
        studentProfileId: `prof-b-${testRunId}`,
        studentName: "Pooja Hegde",
        studentEmail: `pooja.${testRunId}@gmail.com`,
        stream: "MEDICAL_PCB",
        stage: "UNDERGRADUATE",
      });

      const rosterA = StudentService.getEnrolledStudents(instAId);
      const rosterB = StudentService.getEnrolledStudents(instBId);

      expect(rosterA.some((s) => s.id === studentA.id)).toBe(true);
      expect(rosterA.some((s) => s.id === studentB.id)).toBe(false);

      expect(rosterB.some((s) => s.id === studentB.id)).toBe(true);
      expect(rosterB.some((s) => s.id === studentA.id)).toBe(false);
    });
  });

  describe("Institution Registration & Verification Lifecycle", () => {
    it("creates new institution in SUBMITTED state with unverified status and unique invitation code", async () => {
      const registered = await InstitutionService.registerInstitution({
        name: `National Institute of Design ${testRunId}`,
        orgType: "DESIGN_INSTITUTE",
        officialEmail: `admissions@nid-${testRunId}.edu.in`,
        officialWebsite: `https://nid-${testRunId}.edu.in`,
        registrationNumber: `UGC-DES-${testRunId}`,
        accreditationBody: "AICTE",
        city: "Ahmedabad",
        state: "Gujarat",
        country: "India",
        supportedStreams: ["CREATIVE_DESIGN"],
        authorizedPersonName: "Prof. K. Patel",
        authorizedPersonDesignation: "Director",
      });

      expect(registered.id).toBeDefined();
      expect(registered.verificationStatus).toBe("SUBMITTED");
      expect(registered.isVerified).toBe(false);
      expect(registered.invitationCode).toMatch(/^NAT-[A-F0-9]{6}$/);
    });

    it("progresses institution verification status through admin actions", async () => {
      const registered = await InstitutionService.registerInstitution({
        name: `Kolkata Law Academy ${testRunId}`,
        orgType: "LAW_COLLEGE",
        officialEmail: `dean@kla-${testRunId}.edu`,
        city: "Kolkata",
        state: "West Bengal",
        supportedStreams: ["LAW"],
        authorizedPersonName: "Adv. S. Banerjee",
        authorizedPersonDesignation: "Principal",
      });

      // Admin places under review
      const underReview = await InstitutionService.updateVerificationStatus(
        registered.id,
        "UNDER_REVIEW"
      );
      expect(underReview?.verificationStatus).toBe("UNDER_REVIEW");
      expect(underReview?.isVerified).toBe(false);

      // Admin verifies
      const verified = await InstitutionService.updateVerificationStatus(
        registered.id,
        "VERIFIED"
      );
      expect(verified?.verificationStatus).toBe("VERIFIED");
      expect(verified?.isVerified).toBe(true);
      expect(verified?.verifiedAt).toBeDefined();

      // Admin suspends
      const suspended = await InstitutionService.updateVerificationStatus(
        registered.id,
        "SUSPENDED"
      );
      expect(suspended?.verificationStatus).toBe("SUSPENDED");
      expect(suspended?.isVerified).toBe(false);
    });
  });

  describe("Institution Dashboard Metrics Aggregation", () => {
    it("aggregates accurate cohort statistics, stream breakdown, and health indexes", async () => {
      // Enroll multiple students in Inst A with different streams
      StudentService.enrollStudent({
        institutionId: instAId,
        studentProfileId: `prof-1-${testRunId}`,
        studentName: "Student One",
        studentEmail: `stu1.${testRunId}@dti.edu`,
        stream: "NON_MEDICAL_PCM",
        stage: "UNDERGRADUATE",
      });

      StudentService.enrollStudent({
        institutionId: instAId,
        studentProfileId: `prof-2-${testRunId}`,
        studentName: "Student Two",
        studentEmail: `stu2.${testRunId}@dti.edu`,
        stream: "NON_MEDICAL_PCM",
        stage: "UNDERGRADUATE",
      });

      const stats = await InstitutionService.getDashboardStats(instAId);

      expect(stats).toBeDefined();
      expect(stats!.institution.id).toBe(instAId);
      expect(stats!.metrics.totalStudents).toBeGreaterThanOrEqual(2);
      expect(stats!.streamDistribution).toBeDefined();
      expect(stats!.readinessDistribution).toBeDefined();
      expect(typeof stats!.metrics.avgReadinessIndex).toBe("number");
    });
  });
});
