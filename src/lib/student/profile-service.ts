// ==============================================================================
// KAABIL (काबिल) — Student Career Profile Service
// View & Edit separation, demonstrated skills (assessed vs self-reported)
// DPDP Act Minor Shield & deterministic integrity
// ==============================================================================

import { prisma, checkDatabaseConnection } from "@/lib/db";
import { devStore } from "@/lib/dev-store";
import { isMinorStage } from "@/lib/auth/rbac";
import { getCareerBySlug } from "@/data/careersData";
import {
  StudentProfileViewData,
  UpdateStudentProfileInput,
  AssessedSkill,
  SelfReportedSkill,
  SkillProficiencyLevel,
  TargetCareerGoal,
  STAGE_LABELS,
  STREAM_LABELS,
} from "@/types/profile";
import { EducationStage, EducationalStream } from "@/types";

export { STAGE_LABELS, STREAM_LABELS };

export class ProfileService {
  /**
   * Retrieves complete, personalized profile view data for a student.
   * Resolves from PostgreSQL Prisma database with transparent devStore fallback.
   */
  public static async getStudentProfile(
    userIdOrEmail: string
  ): Promise<StudentProfileViewData | null> {
    try {
      const conn = await checkDatabaseConnection();
      if (conn.connected) {
        let dbUser: any = null;
        try {
          dbUser = await prisma.user.findFirst({
            where: {
              OR: [{ id: userIdOrEmail }, { email: userIdOrEmail }],
            },
            include: {
              studentProfile: {
                include: {
                  educationalHistory: true,
                  interests: true,
                  careerGoals: { include: { careerPath: true } },
                  userSkills: { include: { skill: true } },
                  skillEvidences: true,
                  privacyPreference: true,
                  assessmentAttempts: {
                    include: { assessment: true, result: true },
                    orderBy: { completedAt: "desc" },
                    take: 5,
                  },
                },
              },
            },
          });
        } catch {
          // Prisma query error fallback
        }

        if (dbUser && dbUser.studentProfile) {
          return this.mapPrismaToProfileView(dbUser, dbUser.studentProfile);
        }
      }

      // 2. DevStore fallback
      return this.getProfileFromDevStore(userIdOrEmail);
    } catch (err) {
      console.error("[ProfileService.getStudentProfile] Error:", err);
      return this.getProfileFromDevStore(userIdOrEmail);
    }
  }

  /**
   * Updates student profile fields (view vs edit separation).
   * Automatically saves changes while strictly preserving verified/assessed skills and attempts.
   */
  public static async updateStudentProfile(
    userIdOrEmail: string,
    input: UpdateStudentProfileInput
  ): Promise<StudentProfileViewData> {
    const conn = await checkDatabaseConnection();
    if (conn.connected) {
      try {
        const dbUser = await prisma.user.findFirst({
          where: { OR: [{ id: userIdOrEmail }, { email: userIdOrEmail }] },
          include: { studentProfile: true },
        });

        if (dbUser && dbUser.studentProfile) {
          const profileId = dbUser.studentProfile.id;
          const isMinor =
            dbUser.isMinor ||
            (input.educationStage
              ? isMinorStage(input.educationStage)
              : isMinorStage(dbUser.studentProfile.educationStage));

          await prisma.$transaction(async (tx) => {
            // Update User name
            if (input.name) {
              await tx.user.update({
                where: { id: dbUser.id },
                data: { name: input.name },
              });
            }

            // Update StudentProfile core fields
            await tx.studentProfile.update({
              where: { id: profileId },
              data: {
                educationStage: input.educationStage as any,
                currentStream: input.currentStream as any,
                institutionName: input.institutionName,
                graduationYear: input.graduationYear,
                city: input.city,
                state: input.state,
                languagePreference: input.languagePreference,
              },
            });

            // Update Privacy Preference (enforcing minor lock)
            if (
              input.isProfilePublic !== undefined ||
              input.allowRecruiterView !== undefined
            ) {
              await tx.privacyPreference.upsert({
                where: { studentProfileId: profileId },
                update: {
                  isProfilePublic: input.isProfilePublic ?? false,
                  allowRecruiterView: isMinor
                    ? false
                    : (input.allowRecruiterView ?? false),
                },
                create: {
                  studentProfileId: profileId,
                  isProfilePublic: input.isProfilePublic ?? false,
                  allowRecruiterView: isMinor
                    ? false
                    : (input.allowRecruiterView ?? false),
                },
              });
            }

            // Update Interests
            if (input.interests && Array.isArray(input.interests)) {
              await tx.studentInterest.deleteMany({
                where: { studentProfileId: profileId },
              });
              for (const item of input.interests) {
                await tx.studentInterest.create({
                  data: {
                    studentProfileId: profileId,
                    interestName: item,
                    category: "EXPLORATORY",
                  },
                });
              }
            }

            // Update Career Goal
            if (input.targetCareerSlug) {
              const career = await tx.careerPath.findUnique({
                where: { slug: input.targetCareerSlug },
              });
              if (career) {
                await tx.careerGoal.upsert({
                  where: {
                    studentProfileId_careerPathId: {
                      studentProfileId: profileId,
                      careerPathId: career.id,
                    },
                  },
                  update: {
                    targetYear: input.targetYear || null,
                    notes: input.careerGoalNotes || null,
                  },
                  create: {
                    studentProfileId: profileId,
                    careerPathId: career.id,
                    priorityRank: 1,
                    targetYear: input.targetYear || null,
                    notes: input.careerGoalNotes || null,
                  },
                });
              }
            }

            // Update Self-Reported Skills (strictly leave assessed/verified untouched!)
            if (input.selfReportedSkills && Array.isArray(input.selfReportedSkills)) {
              const existingSkills = await tx.userSkill.findMany({
                where: { studentProfileId: profileId },
                include: { skill: true },
              });
              const verifiedSkillNames = new Set(
                existingSkills
                  .filter((s) => s.isVerified)
                  .map((s) => s.skill.name.toLowerCase())
              );

              const unverifiedSkillIds = existingSkills
                .filter((s) => !s.isVerified)
                .map((s) => s.id);

              if (unverifiedSkillIds.length > 0) {
                await tx.userSkill.deleteMany({
                  where: { id: { in: unverifiedSkillIds } },
                });
              }

              const defaultCat = await tx.skillCategory.findFirst();
              const categoryId = defaultCat?.id || "default-cat";

              for (const sk of input.selfReportedSkills) {
                if (verifiedSkillNames.has(sk.name.toLowerCase())) continue;

                const slug = sk.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
                let skillRecord = await tx.skill.findUnique({
                  where: { name: sk.name },
                });
                if (!skillRecord && defaultCat) {
                  skillRecord = await tx.skill.create({
                    data: {
                      categoryId,
                      name: sk.name,
                      canonicalSlug: slug,
                      isTechnical: true,
                    },
                  });
                }

                if (skillRecord) {
                  await tx.userSkill.create({
                    data: {
                      studentProfileId: profileId,
                      skillId: skillRecord.id,
                      proficiencyLevel: sk.proficiency as any,
                      isVerified: false,
                      scorePercentage: 0,
                    },
                  });
                }
              }
            }
          });

          const updated = await this.getStudentProfile(userIdOrEmail);
          if (updated) return updated;
        }
      } catch {
        // Fallback to devStore
      }
    }

    // 2. DevStore update
    return this.updateDevStoreProfile(userIdOrEmail, input);
  }

  // ============================================================================
  // DEVSTORE HELPERS (OFFLINE / DEV MODE)
  // ============================================================================

  private static getProfileFromDevStore(
    userIdOrEmail: string
  ): StudentProfileViewData {
    let profile: any = devStore.getProfile(userIdOrEmail);
    let user: any = null;

    if (profile) {
      if (profile.userId) {
        user = devStore.getUser(profile.userId);
      }
      if (!user && profile.user) {
        user = profile.user;
      }
      if (!user && profile.email) {
        user = devStore.getUserByEmail(profile.email);
      }
    }

    if (!user) {
      user = devStore.getUserByEmail(userIdOrEmail);
    }
    if (!user) {
      user = devStore.getUser(userIdOrEmail);
    }
    // Default to demo student if not found
    if (!user && !profile) {
      user = devStore.getUserByEmail("demo.student@kaabil.in");
    }

    const email = user?.email || profile?.user?.email || "demo.student@kaabil.in";
    const name = user?.name || profile?.name || "Aryan Sharma";
    const userId = user?.id || profile?.userId || "demo-student-id";

    // Locate profile in devStore: strictly check user.studentProfile.id first
    if (!profile) {
      if (user?.studentProfile?.id) {
        profile = devStore.getProfile(user.studentProfile.id);
      }
      if (!profile) {
        profile = devStore.getProfileByEmail(email);
      }
      if (!profile) {
        profile = devStore.getProfile("demo-profile-id");
      }
      if (!profile) {
        profile = devStore.getProfileByUserId(userId);
      }
    }

    const profileId = profile?.id || "demo-profile-id";
    const isMinor =
      user?.isMinor ||
      (profile?.educationStage
        ? isMinorStage(profile.educationStage)
        : false);

    // Get verified evidences / credentials
    const evidences = devStore.getSkillEvidences(profileId) || [];

    // Separate Assessed vs Self-Reported Skills
    const assessedSkills: AssessedSkill[] = [];
    const selfReportedSkills: SelfReportedSkill[] = [];
    const seenAssessed = new Set<string>();

    // 1. Evidences mapped to assessed
    for (const ev of evidences) {
      if (ev.isVerified || ev.verificationStatus === "VERIFIED") {
        const lowerName = ev.skillName.toLowerCase();
        if (!seenAssessed.has(lowerName)) {
          seenAssessed.add(lowerName);
          assessedSkills.push({
            name: ev.skillName,
            proficiency:
              ev.scorePercentage >= 85
                ? "PROFICIENT"
                : ev.scorePercentage >= 70
                ? "INTERMEDIATE"
                : "BEGINNER",
            scorePercentage: ev.scorePercentage || 80,
            verifiedAt: ev.verifiedAt || new Date().toISOString(),
            evidenceType: ev.evidenceType || "AUTOMATED_ASSESSMENT",
            assessmentTitle:
              ev.title || `${ev.skillName} Diagnostic Checkpoint`,
            issuerOrVerifier:
              ev.issuerOrVerifier ||
              (ev.evidenceType === "EXTERNAL_CREDENTIAL"
                ? "External Certification Board"
                : "KAABIL Assessment Hub"),
            isVerified: true,
          });
        }
      }
    }

    // 1b. External Credentials mapped to assessed
    const creds = devStore.getCredentials(profileId) || [];
    for (const cr of creds) {
      const skillName =
        cr.skillName ||
        cr.title?.replace(/Certified | Case Analyst| Benchmark/gi, "").trim() ||
        cr.title;
      const lower = skillName.toLowerCase();
      if (!seenAssessed.has(lower)) {
        seenAssessed.add(lower);
        assessedSkills.push({
          name: skillName,
          proficiency: "PROFICIENT",
          scorePercentage: cr.scorePercentage || 90,
          verifiedAt: cr.issuedAt || cr.issueDate || new Date().toISOString(),
          evidenceType: "EXTERNAL_CREDENTIAL",
          assessmentTitle: cr.title,
          issuerOrVerifier:
            cr.issuerName || cr.issuer || "External Certification Board",
          isVerified: true,
        });
      }
    }

    // 2. Profile userSkills
    const profileSkills = profile?.userSkills || [
      {
        skill: { name: "Python", category: "TECHNICAL" },
        isVerified: true,
        scorePercentage: 88,
        verifiedAt: "2026-10-15T00:00:00.000Z",
      },
      {
        skill: { name: "Calculus", category: "TECHNICAL" },
        isVerified: true,
        scorePercentage: 92,
        verifiedAt: "2026-10-18T00:00:00.000Z",
      },
      {
        skill: { name: "Robotics Control", category: "TECHNICAL" },
        isVerified: true,
        scorePercentage: 85,
        verifiedAt: "2026-11-01T00:00:00.000Z",
      },
      {
        skill: { name: "C++", category: "TECHNICAL" },
        proficiencyLevel: "INTERMEDIATE",
        isVerified: false,
      },
      {
        skill: { name: "ROS 2", category: "TECHNICAL" },
        proficiencyLevel: "INTERMEDIATE",
        isVerified: false,
      },
      {
        skill: { name: "OpenCV", category: "TECHNICAL" },
        proficiencyLevel: "BEGINNER",
        isVerified: false,
      },
    ];

    for (const s of profileSkills) {
      const skillName = s.skill?.name || s.name;
      if (!skillName) continue;
      const lower = skillName.toLowerCase();

      if (s.isVerified && !seenAssessed.has(lower)) {
        seenAssessed.add(lower);
        assessedSkills.push({
          name: skillName,
          proficiency: s.proficiencyLevel || "PROFICIENT",
          scorePercentage: s.scorePercentage || 85,
          verifiedAt: s.verifiedAt || new Date().toISOString(),
          evidenceType: "PRACTICAL_CHALLENGE",
          assessmentTitle: `${skillName} Practical Benchmark`,
          issuerOrVerifier: "KAABIL Practical Challenge Hub",
          isVerified: true,
        });
      } else if (!s.isVerified && !seenAssessed.has(lower)) {
        selfReportedSkills.push({
          name: skillName,
          proficiency: s.proficiencyLevel || "INTERMEDIATE",
          isVerified: false,
        });
      }
    }

    // Format target career
    const targetGoal = profile?.careerGoals?.[0];
    let targetCareer: TargetCareerGoal | null = null;
    if (targetGoal) {
      const slug =
        targetGoal.careerPath?.slug ||
        targetGoal.targetRoleSlug ||
        targetGoal.slug ||
        "ai-systems-engineer";
      const meta = getCareerBySlug(slug);
      const title =
        meta?.title ||
        targetGoal.careerPath?.title ||
        targetGoal.targetRoleTitle ||
        targetGoal.title ||
        slug
          .split("-")
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");

      targetCareer = {
        slug,
        title,
        stream: meta?.stream || profile?.currentStream || "NON_MEDICAL_PCM",
        regulatoryBody:
          meta?.regulatoryBody ||
          targetGoal.careerPath?.regulatoryBody ||
          "AICTE",
        targetYear: targetGoal.targetYear || 2027,
        priorityRank: targetGoal.priorityRank || 1,
        notes:
          targetGoal.notes ||
          "Focused on autonomous robotics and applied machine learning.",
      };
    } else {
      const fallbackCareer = getCareerBySlug("ai-systems-engineer");
      if (fallbackCareer) {
        targetCareer = {
          slug: fallbackCareer.slug,
          title: fallbackCareer.title,
          stream: fallbackCareer.stream,
          regulatoryBody: fallbackCareer.regulatoryBody,
          targetYear: 2027,
          priorityRank: 1,
          notes: "Aspiring to build real-world AI and autonomous control systems.",
        };
      }
    }

    // Format interests
    const rawInterests = profile?.interests || [
      { domain: "Artificial Intelligence" },
      { domain: "Robotics Control" },
      { domain: "System Architecture" },
    ];
    const interests = rawInterests.map(
      (i: any) => i.domain || i.interestName || i
    );

    // Format education details
    const stage = (profile?.educationStage || "UNDERGRADUATE") as EducationStage;
    const stream = (profile?.currentStream || "NON_MEDICAL_PCM") as EducationalStream;

    return {
      id: profileId,
      userId,
      name,
      email,
      avatar: user?.avatar || null,
      bio:
        profile?.bio ||
        "Dedicated engineering student specializing in Mathematics, Computing, and Autonomous Systems. Proven track record in algorithmic problem solving and robotics competitions.",
      isMinor,
      academic: {
        stage,
        stageLabel: STAGE_LABELS[stage] || stage,
        stream,
        streamLabel: STREAM_LABELS[stream] || stream,
        institutionName:
          profile?.institutionName ||
          "Delhi Technological University (DTU)",
        boardOrUniversity: profile?.boardOrUniversity || "DTU",
        specialization:
          profile?.specialization || "Computer Science & Engineering",
        graduationYear:
          profile?.targetCompletionYear || profile?.graduationYear || 2027,
        grade: profile?.grade || "9.2 CGPA",
      },
      location: {
        city: profile?.city || "New Delhi",
        state: profile?.state || "Delhi",
      },
      languagePreference: profile?.languagePreference || "en",
      targetCareer,
      interests,
      skills: {
        assessed: assessedSkills,
        selfReported: selfReportedSkills,
        totalCount: assessedSkills.length + selfReportedSkills.length,
        assessedCount: assessedSkills.length,
        selfReportedCount: selfReportedSkills.length,
      },
      assessmentHistory: [
        {
          id: "attempt-stem-01",
          title: "Autonomous Systems & Robotics Diagnostic",
          stream: "NON_MEDICAL_PCM",
          score: 88,
          passed: true,
          completedAt: "2026-10-15T14:30:00.000Z",
        },
        {
          id: "attempt-math-01",
          title: "Advanced Engineering Mathematics & Calculus",
          stream: "NON_MEDICAL_PCM",
          score: 92,
          passed: true,
          completedAt: "2026-10-18T11:15:00.000Z",
        },
        {
          id: "attempt-ai-01",
          title: "Robotics Kinematics & Control Systems Challenge",
          stream: "NON_MEDICAL_PCM",
          score: 85,
          passed: true,
          completedAt: "2026-11-01T16:45:00.000Z",
        },
      ],
      privacy: {
        isProfilePublic: profile?.privacy?.isProfilePublic || false,
        allowRecruiterView: isMinor
          ? false
          : profile?.privacy?.allowRecruiterView || false,
        isMinorShieldActive: isMinor,
      },
      careerReadinessIndex: profile?.careerReadinessIndex ?? 79,
      onboardingCompleted: profile?.onboardingCompleted ?? true,
      lastUpdated: profile?.updatedAt || new Date().toISOString(),
    };
  }

  private static updateDevStoreProfile(
    userIdOrEmail: string,
    input: UpdateStudentProfileInput
  ): StudentProfileViewData {
    let profile: any = devStore.getProfile(userIdOrEmail);
    let user: any = null;

    if (profile) {
      if (profile.userId) {
        user = devStore.getUser(profile.userId);
      }
      if (!user && profile.user) {
        user = profile.user;
      }
    }

    if (!user) {
      user = devStore.getUserByEmail(userIdOrEmail) || devStore.getUser(userIdOrEmail);
    }
    if (!user && !profile) {
      user = devStore.getUserByEmail("demo.student@kaabil.in");
    }

    const email = user?.email || profile?.user?.email || "demo.student@kaabil.in";
    if (!profile) {
      profile =
        (user?.studentProfile?.id ? devStore.getProfile(user.studentProfile.id) : null) ||
        devStore.getProfileByEmail(email) ||
        devStore.getProfile("demo-profile-id");
    }

    const profileId = profile?.id || "demo-profile-id";

    // Update user name
    if (input.name && user) {
      user.name = input.name;
      devStore.saveUser({ ...user, name: input.name });
    }

    const isMinor =
      user?.isMinor ||
      (input.educationStage
        ? isMinorStage(input.educationStage)
        : isMinorStage(profile?.educationStage || "UNDERGRADUATE"));

    // Prepare updated profile
    const updatedProfile = {
      ...(profile || {}),
      id: profileId,
      userId: user?.id || "demo-student-id",
      bio: input.bio !== undefined ? input.bio : profile?.bio,
      educationStage: input.educationStage || profile?.educationStage || "UNDERGRADUATE",
      currentStream: input.currentStream || profile?.currentStream || "NON_MEDICAL_PCM",
      institutionName: input.institutionName !== undefined ? input.institutionName : profile?.institutionName,
      boardOrUniversity: input.boardOrUniversity !== undefined ? input.boardOrUniversity : profile?.boardOrUniversity,
      specialization: input.specialization !== undefined ? input.specialization : profile?.specialization,
      graduationYear: input.graduationYear !== undefined ? input.graduationYear : profile?.targetCompletionYear,
      targetCompletionYear: input.graduationYear !== undefined ? input.graduationYear : profile?.targetCompletionYear,
      grade: input.grade !== undefined ? input.grade : profile?.grade,
      city: input.city !== undefined ? input.city : profile?.city,
      state: input.state !== undefined ? input.state : profile?.state,
      languagePreference: input.languagePreference || profile?.languagePreference || "en",
      privacy: {
        isProfilePublic: input.isProfilePublic ?? profile?.privacy?.isProfilePublic ?? false,
        allowRecruiterView: isMinor
          ? false
          : (input.allowRecruiterView ?? profile?.privacy?.allowRecruiterView ?? false),
      },
      updatedAt: new Date().toISOString(),
    };

    // Update interests
    if (input.interests && Array.isArray(input.interests)) {
      updatedProfile.interests = input.interests.map((name) => ({ domain: name, interestName: name }));
    }

    // Update career goals
    if (input.targetCareerSlug) {
      const meta = getCareerBySlug(input.targetCareerSlug);
      const title =
        meta?.title ||
        input.targetCareerSlug
          .split("-")
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");

      updatedProfile.careerGoals = [
        {
          careerPath: {
            slug: input.targetCareerSlug,
            title,
            regulatoryBody: meta?.regulatoryBody,
          },
          priorityRank: 1,
          targetYear: input.targetYear || updatedProfile.graduationYear || 2027,
          notes: input.careerGoalNotes || "Targeted career goal",
        },
      ];
    }

    // Update self-reported skills (leaving verified skills completely intact!)
    if (input.selfReportedSkills && Array.isArray(input.selfReportedSkills)) {
      const existing = updatedProfile.userSkills || [];
      const verifiedOnes = existing.filter((s: any) => s.isVerified);
      const verifiedNames = new Set(
        verifiedOnes.map((s: any) => (s.skill?.name || s.name || "").toLowerCase())
      );

      const newSelfReported = input.selfReportedSkills
        .filter((sk) => !verifiedNames.has(sk.name.toLowerCase()))
        .map((sk) => ({
          skill: { name: sk.name, category: "TECHNICAL" },
          proficiencyLevel: sk.proficiency,
          isVerified: false,
          scorePercentage: 0,
        }));

      updatedProfile.userSkills = [...verifiedOnes, ...newSelfReported];
    }

    // Save profile to store via public API
    devStore.saveProfile(updatedProfile);

    return this.getProfileFromDevStore(email);
  }

  private static mapPrismaToProfileView(
    user: any,
    profile: any
  ): StudentProfileViewData {
    const isMinor = user.isMinor || isMinorStage(profile.educationStage);

    // Demonstrated skills separation
    const assessedSkills: AssessedSkill[] = [];
    const selfReportedSkills: SelfReportedSkill[] = [];
    const seenAssessed = new Set<string>();

    // Evidences
    for (const ev of profile.skillEvidences || []) {
      if (ev.isVerified || ev.verificationStatus === "VERIFIED") {
        const lower = ev.skillName.toLowerCase();
        if (!seenAssessed.has(lower)) {
          seenAssessed.add(lower);
          assessedSkills.push({
            name: ev.skillName,
            proficiency:
              ev.scorePercentage >= 85
                ? "PROFICIENT"
                : ev.scorePercentage >= 70
                ? "INTERMEDIATE"
                : "BEGINNER",
            scorePercentage: ev.scorePercentage || 80,
            verifiedAt: ev.verifiedAt?.toISOString() || new Date().toISOString(),
            evidenceType: ev.evidenceType || "AUTOMATED_ASSESSMENT",
            assessmentTitle: ev.title || `${ev.skillName} Diagnostic Checkpoint`,
            issuerOrVerifier:
              ev.issuerOrVerifier ||
              (ev.evidenceType === "EXTERNAL_CREDENTIAL"
                ? "External Certification Board"
                : "KAABIL Assessment Hub"),
            isVerified: true,
          });
        }
      }
    }

    // User skills
    for (const us of profile.userSkills || []) {
      const name = us.skill?.name || "Skill";
      const lower = name.toLowerCase();

      if (us.isVerified && !seenAssessed.has(lower)) {
        seenAssessed.add(lower);
        assessedSkills.push({
          name,
          proficiency: us.proficiencyLevel || "PROFICIENT",
          scorePercentage: us.scorePercentage || 80,
          verifiedAt: us.verifiedAt?.toISOString() || new Date().toISOString(),
          evidenceType: "PRACTICAL_CHALLENGE",
          assessmentTitle: `${name} Practical Benchmark`,
          issuerOrVerifier: "KAABIL Practical Challenge Hub",
          isVerified: true,
        });
      } else if (!us.isVerified && !seenAssessed.has(lower)) {
        selfReportedSkills.push({
          name,
          proficiency: us.proficiencyLevel || "INTERMEDIATE",
          isVerified: false,
        });
      }
    }

    // Target career
    const goal = profile.careerGoals?.[0];
    let targetCareer: TargetCareerGoal | null = null;
    if (goal) {
      const meta = getCareerBySlug(goal.careerPath.slug);
      targetCareer = {
        slug: goal.careerPath.slug,
        title: goal.careerPath.title,
        stream: meta?.stream || profile.currentStream,
        regulatoryBody: goal.careerPath.regulatoryBody || undefined,
        targetYear: goal.targetYear,
        priorityRank: goal.priorityRank,
        notes: goal.notes,
      };
    }

    // Educational background
    const edu = profile.educationalHistory?.[0];

    // Assessment history
    const assessmentHistory = (profile.assessmentAttempts || []).map((att: any) => ({
      id: att.id,
      title: att.assessment?.title || "Career Assessment Challenge",
      stream: att.assessment?.stream || profile.currentStream,
      score: att.result?.scorePercentage || 85,
      passed: att.result?.isPassed ?? true,
      completedAt: att.completedAt?.toISOString() || new Date().toISOString(),
    }));

    return {
      id: profile.id,
      userId: user.id,
      name: user.name || "Student",
      email: user.email,
      avatar: user.avatar || null,
      bio: profile.bio || null,
      isMinor,
      academic: {
        stage: profile.educationStage,
        stageLabel: STAGE_LABELS[profile.educationStage] || profile.educationStage,
        stream: profile.currentStream,
        streamLabel: STREAM_LABELS[profile.currentStream] || profile.currentStream,
        institutionName: edu?.institutionName || profile.institutionName || null,
        boardOrUniversity: edu?.boardOrUniversity || null,
        specialization: edu?.specialization || null,
        graduationYear: edu?.endYear || profile.graduationYear || null,
        grade: edu?.gradeOrPercentage ? `${edu.gradeOrPercentage}%` : null,
      },
      location: {
        city: profile.city || null,
        state: profile.state || null,
      },
      languagePreference: profile.languagePreference || "en",
      targetCareer,
      interests: (profile.interests || []).map((i: any) => i.interestName),
      skills: {
        assessed: assessedSkills,
        selfReported: selfReportedSkills,
        totalCount: assessedSkills.length + selfReportedSkills.length,
        assessedCount: assessedSkills.length,
        selfReportedCount: selfReportedSkills.length,
      },
      assessmentHistory,
      privacy: {
        isProfilePublic: profile.privacyPreference?.isProfilePublic || false,
        allowRecruiterView: isMinor
          ? false
          : profile.privacyPreference?.allowRecruiterView || false,
        isMinorShieldActive: isMinor,
      },
      careerReadinessIndex: profile.careerReadinessIndex,
      onboardingCompleted: profile.onboardingCompleted,
      lastUpdated: profile.updatedAt?.toISOString() || new Date().toISOString(),
    };
  }
}
