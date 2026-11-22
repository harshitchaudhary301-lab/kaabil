// ==============================================================================
// KAABIL (काबिल) — Test Suite: Step 3.1 My Career Profile & View Separation
// Validates View vs Edit separation, assessed vs self-reported skill distinction,
// automatic saving, DPDP Act minor privacy enforcement, and data preservation.
// ==============================================================================

import { describe, it, expect, beforeEach } from "vitest";
import { ProfileService, STAGE_LABELS, STREAM_LABELS } from "@/lib/student/profile-service";
import { devStore } from "@/lib/dev-store";
import { GET, PATCH } from "@/app/api/student/profile/route";
import { NextRequest } from "next/server";

describe("Step 3.1 — My Career Profile Elevation & View Separation", () => {
  beforeEach(() => {
    // Reset devStore to pristine initial state
    devStore.reset();
  });

  describe("1. Profile Retrieval & View Data Model", () => {
    it("retrieves complete student profile view model with human-friendly labels", async () => {
      const profile = await ProfileService.getStudentProfile("demo.student@kaabil.in");

      expect(profile).not.toBeNull();
      expect(profile?.name).toBe("Aryan Sharma");
      expect(profile?.email).toBe("demo.student@kaabil.in");
      expect(profile?.academic.stage).toBe("UNDERGRADUATE");
      expect(profile?.academic.stageLabel).toBe(STAGE_LABELS["UNDERGRADUATE"]);
      expect(profile?.academic.stream).toBe("NON_MEDICAL_PCM");
      expect(profile?.academic.streamLabel).toBe(STREAM_LABELS["NON_MEDICAL_PCM"]);
      expect(profile?.academic.institutionName).toContain("Delhi");
      expect(profile?.targetCareer?.title).toBeDefined();
      expect(profile?.careerReadinessIndex).toBe(79);
    });

    it("strictly separates assessed skills from self-reported skills", async () => {
      const profile = await ProfileService.getStudentProfile("demo.student@kaabil.in");

      expect(profile).not.toBeNull();
      expect(profile?.skills).toBeDefined();
      expect(profile?.skills.assessed).toBeInstanceOf(Array);
      expect(profile?.skills.selfReported).toBeInstanceOf(Array);

      // Verify Assessed Skills Contract
      expect(profile?.skills.assessed.length).toBeGreaterThan(0);
      for (const skill of profile!.skills.assessed) {
        expect(skill.isVerified).toBe(true);
        expect(typeof skill.scorePercentage).toBe("number");
        expect(skill.scorePercentage).toBeGreaterThan(0);
        expect(skill.verifiedAt).toBeDefined();
        expect(skill.assessmentTitle).toBeDefined();
      }

      // Verify Self-Reported Skills Contract
      expect(profile?.skills.selfReported.length).toBeGreaterThan(0);
      for (const skill of profile!.skills.selfReported) {
        expect(skill.isVerified).toBe(false);
        expect(skill.name).toBeDefined();
        expect(skill.proficiency).toBeDefined();
      }

      // Verify total count equals sum of components
      expect(profile!.skills.totalCount).toBe(
        profile!.skills.assessedCount + profile!.skills.selfReportedCount
      );
    });

    it("preserves authentic assessment history and verification records", async () => {
      const profile = await ProfileService.getStudentProfile("demo.student@kaabil.in");

      expect(profile?.assessmentHistory).toBeInstanceOf(Array);
      expect(profile?.assessmentHistory.length).toBeGreaterThan(0);
      expect(profile?.assessmentHistory[0]).toMatchObject({
        title: expect.any(String),
        score: expect.any(Number),
        passed: true,
      });
    });
  });

  describe("2. Profile Editing & Automatic Saving", () => {
    it("updates personal bio, academic details, and location automatically", async () => {
      const updated = await ProfileService.updateStudentProfile("demo.student@kaabil.in", {
        bio: "Specializing in autonomous aerial drones and edge computer vision.",
        city: "Bengaluru",
        state: "Karnataka",
        grade: "9.4 CGPA",
        graduationYear: 2027,
      });

      expect(updated.bio).toBe("Specializing in autonomous aerial drones and edge computer vision.");
      expect(updated.location.city).toBe("Bengaluru");
      expect(updated.location.state).toBe("Karnataka");
      expect(updated.academic.grade).toBe("9.4 CGPA");
      expect(updated.academic.graduationYear).toBe(2027);

      // Verify re-fetch persistence
      const reloaded = await ProfileService.getStudentProfile("demo.student@kaabil.in");
      expect(reloaded?.bio).toBe("Specializing in autonomous aerial drones and edge computer vision.");
      expect(reloaded?.location.city).toBe("Bengaluru");
    });

    it("allows adding and modifying self-reported skills without touching assessed skills", async () => {
      const initial = await ProfileService.getStudentProfile("demo.student@kaabil.in");
      const initialAssessedCount = initial!.skills.assessedCount;
      const initialAssessedNames = initial!.skills.assessed.map((s) => s.name.toLowerCase());

      const updated = await ProfileService.updateStudentProfile("demo.student@kaabil.in", {
        selfReportedSkills: [
          { name: "Rust", proficiency: "BEGINNER" },
          { name: "TensorFlow", proficiency: "INTERMEDIATE" },
          { name: "Docker", proficiency: "BEGINNER" },
        ],
      });

      // Self-reported skills updated
      const selfNames = updated.skills.selfReported.map((s) => s.name);
      expect(selfNames).toContain("Rust");
      expect(selfNames).toContain("TensorFlow");
      expect(selfNames).toContain("Docker");

      // Critical Integrity Rule: Assessed skills must remain untouched!
      expect(updated.skills.assessedCount).toBe(initialAssessedCount);
      for (const name of initialAssessedNames) {
        expect(
          updated.skills.assessed.some((s) => s.name.toLowerCase() === name)
        ).toBe(true);
      }
    });

    it("updates target career and career goals with authentic catalog metadata", async () => {
      const updated = await ProfileService.updateStudentProfile("demo.student@kaabil.in", {
        targetCareerSlug: "mechanical-robotics-engineer",
        targetYear: 2028,
        careerGoalNotes: "Focusing on quadruped robot locomotion and embedded hardware control.",
      });

      expect(updated.targetCareer?.slug).toBe("mechanical-robotics-engineer");
      expect(updated.targetCareer?.title).toContain("Robotics");
      expect(updated.targetCareer?.targetYear).toBe(2028);
      expect(updated.targetCareer?.notes).toContain("quadruped robot locomotion");
    });

    it("updates interests cleanly", async () => {
      const newInterests = ["Robotics Kinematics", "Quantum Computing", "Deep Learning"];
      const updated = await ProfileService.updateStudentProfile("demo.student@kaabil.in", {
        interests: newInterests,
      });

      expect(updated.interests).toEqual(expect.arrayContaining(newInterests));
    });
  });

  describe("3. DPDP Act Minor Shield & Privacy Access Controls", () => {
    it("strictly blocks recruiter view for school students and minors", async () => {
      // fresh.student@kaabil.in is a Class 12 student (minor under DPDP Act)
      const minorProfile = await ProfileService.getStudentProfile("fresh.student@kaabil.in");
      expect(minorProfile?.isMinor).toBe(true);
      expect(minorProfile?.privacy.isMinorShieldActive).toBe(true);
      expect(minorProfile?.privacy.allowRecruiterView).toBe(false);

      // Attempt to enable recruiter view on minor profile
      const updatedMinor = await ProfileService.updateStudentProfile("fresh.student@kaabil.in", {
        allowRecruiterView: true,
      });

      // Must remain locked to false per DPDP Act Rule 3.1
      expect(updatedMinor.privacy.allowRecruiterView).toBe(false);
      expect(updatedMinor.privacy.isMinorShieldActive).toBe(true);
    });

    it("allows adult undergraduate students to manage recruiter visibility consent", async () => {
      const adultProfile = await ProfileService.getStudentProfile("demo.student@kaabil.in");
      expect(adultProfile?.isMinor).toBe(false);

      // Adult turns on recruiter view
      const updated = await ProfileService.updateStudentProfile("demo.student@kaabil.in", {
        allowRecruiterView: true,
      });
      expect(updated.privacy.allowRecruiterView).toBe(true);

      // Adult turns off recruiter view
      const turnedOff = await ProfileService.updateStudentProfile("demo.student@kaabil.in", {
        allowRecruiterView: false,
      });
      expect(turnedOff.privacy.allowRecruiterView).toBe(false);
    });
  });

  describe("4. Route Handlers: GET and PATCH /api/student/profile", () => {
    it("handles GET /api/student/profile returning valid profile payload", async () => {
      const req = new NextRequest("http://localhost:3000/api/student/profile");
      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.profile).toBeDefined();
      expect(json.profile.skills.assessed).toBeInstanceOf(Array);
      expect(json.profile.skills.selfReported).toBeInstanceOf(Array);
    });

    it("handles PATCH /api/student/profile with valid partial update payload", async () => {
      const req = new NextRequest("http://localhost:3000/api/student/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: "Hyderabad",
          state: "Telangana",
          bio: "Robotics and AI researcher passionate about autonomous field rovers.",
          selfReportedSkills: [
            { name: "C++", proficiency: "INTERMEDIATE" },
            { name: "Linux", proficiency: "PROFICIENT" },
          ],
        }),
      });

      const res = await PATCH(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.profile.location.city).toBe("Hyderabad");
      expect(json.profile.bio).toContain("Robotics and AI researcher");
    });

    it("rejects PATCH /api/student/profile with invalid stage with HTTP 400", async () => {
      const req = new NextRequest("http://localhost:3000/api/student/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          educationStage: "INVALID_STAGE_NAME",
        }),
      });

      const res = await PATCH(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toBe("Invalid profile data.");
    });
  });

  describe("5. Profile Changes Persistence after Refresh, Logout, and Login", () => {
    it("persists updates across simulated page reload and session lifecycle", async () => {
      const studentEmail = "demo.student@kaabil.in";

      // 1. Initial State
      const initialProfile = await ProfileService.getStudentProfile(studentEmail);
      expect(initialProfile).not.toBeNull();

      // 2. Perform Profile Update
      const updatedBio = "Autonomous systems and field robotics researcher with deep edge-AI expertise.";
      const updatedCity = "Pune";
      const updatedState = "Maharashtra";
      const updatedGradYear = 2028;
      const updatedSkills = [
        { name: "Embedded C", proficiency: "PROFICIENT" as const },
        { name: "ROS 2", proficiency: "INTERMEDIATE" as const },
        { name: "PyTorch", proficiency: "BEGINNER" as const },
      ];
      const updatedInterests = ["Autonomous Vehicles", "Swarm Robotics", "Sensor Fusion"];

      await ProfileService.updateStudentProfile(studentEmail, {
        bio: updatedBio,
        city: updatedCity,
        state: updatedState,
        graduationYear: updatedGradYear,
        selfReportedSkills: updatedSkills,
        interests: updatedInterests,
      });

      // 3. Simulate Page Refresh (direct fresh fetch from data layer)
      const afterRefresh = await ProfileService.getStudentProfile(studentEmail);
      expect(afterRefresh?.bio).toBe(updatedBio);
      expect(afterRefresh?.location.city).toBe(updatedCity);
      expect(afterRefresh?.location.state).toBe(updatedState);
      expect(afterRefresh?.academic.graduationYear).toBe(updatedGradYear);
      expect(afterRefresh?.interests).toEqual(expect.arrayContaining(updatedInterests));
      expect(
        afterRefresh?.skills.selfReported.map((s) => s.name)
      ).toEqual(expect.arrayContaining(["Embedded C", "ROS 2", "PyTorch"]));

      // 4. Simulate Logout and Login
      // A fresh session look-up fetches the user by email/id from devStore/DB
      const freshUser = devStore.getUserByEmail(studentEmail);
      expect(freshUser).not.toBeNull();
      const profileAfterRelogin = await ProfileService.getStudentProfile(freshUser!.email);

      expect(profileAfterRelogin?.bio).toBe(updatedBio);
      expect(profileAfterRelogin?.location.city).toBe(updatedCity);
      expect(profileAfterRelogin?.academic.graduationYear).toBe(updatedGradYear);
      expect(profileAfterRelogin?.interests).toEqual(expect.arrayContaining(updatedInterests));
      expect(profileAfterRelogin?.skills.selfReportedCount).toBe(3);
    });
  });

  describe("6. Cross-Student Boundary & Authorization Isolation", () => {
    it("ensures student profiles are strictly isolated by session identifier", async () => {
      const studentAEmail = "demo.student@kaabil.in";
      const studentBEmail = "fresh.student@kaabil.in";

      const profileA = await ProfileService.getStudentProfile(studentAEmail);
      const profileB = await ProfileService.getStudentProfile(studentBEmail);

      expect(profileA).not.toBeNull();
      expect(profileB).not.toBeNull();
      expect(profileA?.id).not.toBe(profileB?.id);
      expect(profileA?.email).not.toBe(profileB?.email);
      expect(profileA?.academic.stage).toBe("UNDERGRADUATE");
      expect(profileB?.academic.stage).toBe("CLASS_12");

      // Modifying Student A does NOT affect Student B
      await ProfileService.updateStudentProfile(studentAEmail, {
        bio: "Updated Bio for Student A only.",
        city: "Chandigarh",
      });

      const profileAReloaded = await ProfileService.getStudentProfile(studentAEmail);
      const profileBReloaded = await ProfileService.getStudentProfile(studentBEmail);

      expect(profileAReloaded?.bio).toBe("Updated Bio for Student A only.");
      expect(profileAReloaded?.location.city).toBe("Chandigarh");

      // Student B must remain completely unaffected
      expect(profileBReloaded?.bio).not.toBe("Updated Bio for Student A only.");
      expect(profileBReloaded?.location.city).not.toBe("Chandigarh");
    });

    it("ignores foreign user IDs in update payload to prevent privilege escalation or spoofing", async () => {
      // The update schema does not allow passing target userId or profileId
      const maliciousPayload = {
        userId: "foreign-victim-user-id",
        studentProfileId: "foreign-victim-profile-id",
        bio: "Attempted cross-user exploit payload",
      };

      const req = new NextRequest("http://localhost:3000/api/student/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(maliciousPayload),
      });

      const res = await PATCH(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      // Confirms update was applied ONLY to the session user (demo student)
      expect(json.profile.email).toBe("demo.student@kaabil.in");
      expect(json.profile.id).not.toBe("foreign-victim-profile-id");
      expect(json.profile.userId).not.toBe("foreign-victim-user-id");
    });
  });

  describe("7. Skill Provenance & Representation Accuracy", () => {
    it("accurately categorizes self-reported, platform-assessed, and external credentials", async () => {
      const profile = await ProfileService.getStudentProfile("demo.student@kaabil.in");
      expect(profile).not.toBeNull();

      // Assessed skills: Must have verification status, score, timestamp, and challenge/assessment title
      const assessed = profile!.skills.assessed;
      expect(assessed.length).toBeGreaterThan(0);
      for (const skill of assessed) {
        expect(skill.isVerified).toBe(true);
        expect(skill.scorePercentage).toBeGreaterThanOrEqual(50);
        expect(["AUTOMATED_ASSESSMENT", "PRACTICAL_CHALLENGE", "EXTERNAL_CREDENTIAL"]).toContain(
          skill.evidenceType
        );
        expect(skill.verifiedAt).toBeTruthy();
        expect(skill.assessmentTitle).toBeTruthy();
        expect(skill.issuerOrVerifier).toBeTruthy();
      }

      // Self-reported skills: Must be unverified, with a valid proficiency level
      const selfReported = profile!.skills.selfReported;
      expect(selfReported.length).toBeGreaterThan(0);
      for (const skill of selfReported) {
        expect(skill.isVerified).toBe(false);
        expect(["NOVICE", "BEGINNER", "INTERMEDIATE", "PROFICIENT", "EXPERT"]).toContain(
          skill.proficiency
        );
      }
    });

    it("prevents self-reported updates from overriding or altering verified skills", async () => {
      const before = await ProfileService.getStudentProfile("demo.student@kaabil.in");
      const verifiedSkill = before!.skills.assessed[0];

      // Try to submit a self-reported skill with the same name as an assessed skill with novice proficiency
      await ProfileService.updateStudentProfile("demo.student@kaabil.in", {
        selfReportedSkills: [
          { name: verifiedSkill.name, proficiency: "BEGINNER" },
          { name: "NewSkillX", proficiency: "INTERMEDIATE" },
        ],
      });

      const after = await ProfileService.getStudentProfile("demo.student@kaabil.in");
      const stillVerified = after!.skills.assessed.find(
        (s) => s.name.toLowerCase() === verifiedSkill.name.toLowerCase()
      );

      // The verified skill must still be verified with its authentic score
      expect(stillVerified).toBeDefined();
      expect(stillVerified?.isVerified).toBe(true);
      expect(stillVerified?.scorePercentage).toBe(verifiedSkill.scorePercentage);

      // And it should not duplicate into self-reported skills
      const duplicateInSelf = after!.skills.selfReported.find(
        (s) => s.name.toLowerCase() === verifiedSkill.name.toLowerCase()
      );
      expect(duplicateInSelf).toBeUndefined();
    });
  });
});
