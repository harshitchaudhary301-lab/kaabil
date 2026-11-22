// ==============================================================================
// KAABIL (काबिल) — Student Onboarding Completion API Endpoint
// Persists multi-stream diagnostic calibration, skills, interests & preferences
// Strictly enforces DPDP Act 2023 minor privacy constraints
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, checkDatabaseConnection } from "@/lib/db";
import { devStore } from "@/lib/dev-store";
import { getSessionUser } from "@/lib/auth/session";
import { isMinorStage } from "@/lib/auth/rbac";
import {
  EducationStage,
  EducationalStream,
  SkillProficiencyLevel,
} from "@prisma/client";

export const dynamic = "force-dynamic";

const onboardingSchema = z.object({
  educationStage: z.enum([
    "CLASS_8",
    "CLASS_9",
    "CLASS_10",
    "CLASS_11",
    "CLASS_12",
    "DIPLOMA",
    "ITI",
    "UNDERGRADUATE",
    "POSTGRADUATE",
    "WORKING_PROFESSIONAL",
    "OTHER",
  ]),
  primaryStream: z.enum([
    "MEDICAL_PCB",
    "NON_MEDICAL_PCM",
    "COMMERCE",
    "ARTS_HUMANITIES",
    "LAW",
    "MANAGEMENT",
    "CREATIVE_DESIGN",
    "AGRICULTURE",
    "VOCATIONAL_TRADES",
    "SPORTS_PHYSICAL_ED",
    "HOSPITALITY_TOURISM",
    "INTERDISCIPLINARY",
    "UNDECIDED",
  ]).optional().default("UNDECIDED"),
  goalClarity: z.string().optional(),
  primaryNeed: z.string().optional(),
  selectedStreams: z.array(
    z.enum([
      "MEDICAL_PCB",
      "NON_MEDICAL_PCM",
      "COMMERCE",
      "ARTS_HUMANITIES",
      "LAW",
      "MANAGEMENT",
      "CREATIVE_DESIGN",
      "AGRICULTURE",
      "VOCATIONAL_TRADES",
      "SPORTS_PHYSICAL_ED",
      "HOSPITALITY_TOURISM",
      "INTERDISCIPLINARY",
      "UNDECIDED",
    ])
  ).optional().default([]),
  institutionName: z.string().max(150).optional().nullable(),
  boardOrUniversity: z.string().max(100).optional().nullable(),
  specialization: z.string().max(100).optional().nullable(),
  graduationYear: z.number().int().min(2000).max(2040).optional().nullable(),
  city: z.string().max(80).optional().nullable(),
  state: z.string().max(80).optional().nullable(),
  guardianConsent: z.boolean().optional().default(false),
  interests: z.array(z.string().min(1).max(100)).optional().default([]),
  skills: z.array(
    z.object({
      name: z.string().min(1).max(100),
      proficiency: z.enum(["NOVICE", "BEGINNER", "INTERMEDIATE", "PROFICIENT", "EXPERT"]).default("BEGINNER"),
    })
  ).optional().default([]),
  careerGoal: z.object({
    goalType: z.string().optional(),
    targetRole: z.string().max(150).optional().nullable(),
    targetYear: z.number().optional().nullable(),
    notes: z.string().max(500).optional().nullable(),
  }).optional(),
  learningPreferences: z.object({
    preferredPace: z.string().default("BALANCED"),
    preferredStyle: z.string().default("PRACTICAL"),
    weeklyHoursAvailable: z.number().min(1).max(80).default(10),
    primaryLanguage: z.string().default("hinglish"),
    allowAiMentoring: z.boolean().default(true),
  }).optional().default({
    preferredPace: "BALANCED",
    preferredStyle: "PRACTICAL",
    weeklyHoursAvailable: 10,
    primaryLanguage: "hinglish",
    allowAiMentoring: true,
  }),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in to submit onboarding." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = onboardingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid onboarding payload.",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const isMinor = isMinorStage(data.educationStage as EducationStage);

    // Calculate baseline Career Readiness Index (CRI)
    // 25 base for completing all sections + 5 for each reported skill (up to 15) + 10 for defined career goal
    let calculatedCRI = 30;
    if (data.skills.length > 0) {
      calculatedCRI += Math.min(20, data.skills.length * 5);
    }
    if (data.careerGoal?.targetRole) {
      calculatedCRI += 10;
    }
    calculatedCRI = Math.min(60, calculatedCRI); // Max initial onboarding CRI is 60; remainder earned via verification

    const conn = await checkDatabaseConnection();

    if (conn.connected) {
      await db.$transaction(async (tx) => {
        // 1. Update User minor status
        await tx.user.update({
          where: { id: user.id },
          data: { isMinor },
        });

        // 2. Find or create StudentProfile
        let profile = await tx.studentProfile.findUnique({
          where: { userId: user.id },
        });

        const allSelectedStreams = Array.from(
          new Set([data.primaryStream, ...data.selectedStreams])
        ) as EducationalStream[];

        if (!profile) {
          profile = await tx.studentProfile.create({
            data: {
              userId: user.id,
              educationStage: data.educationStage as EducationStage,
              currentStream: data.primaryStream as EducationalStream,
              selectedStreams: allSelectedStreams,
              institutionName: data.institutionName || null,
              graduationYear: data.graduationYear || null,
              city: data.city || null,
              state: data.state || null,
              languagePreference: data.learningPreferences.primaryLanguage,
              guardianConsent: isMinor ? !!data.guardianConsent : true,
              careerReadinessIndex: calculatedCRI,
              onboardingCompleted: true,
            },
          });
        } else {
          profile = await tx.studentProfile.update({
            where: { id: profile.id },
            data: {
              educationStage: data.educationStage as EducationStage,
              currentStream: data.primaryStream as EducationalStream,
              selectedStreams: allSelectedStreams,
              institutionName: data.institutionName || profile.institutionName,
              graduationYear: data.graduationYear || profile.graduationYear,
              city: data.city || profile.city,
              state: data.state || profile.state,
              languagePreference: data.learningPreferences.primaryLanguage,
              guardianConsent: isMinor ? !!data.guardianConsent : profile.guardianConsent,
              careerReadinessIndex: Math.max(profile.careerReadinessIndex, calculatedCRI),
              onboardingCompleted: true,
            },
          });
        }

        // 3. Persist Educational Background
        if (data.institutionName) {
          await tx.educationalBackground.deleteMany({
            where: { studentProfileId: profile.id },
          }).catch(() => {});

          await tx.educationalBackground.create({
            data: {
              studentProfileId: profile.id,
              stage: data.educationStage as EducationStage,
              institutionName: data.institutionName,
              boardOrUniversity: data.boardOrUniversity || null,
              specialization: data.specialization || null,
              startYear: new Date().getFullYear() - 1,
              endYear: data.graduationYear || null,
              isCurrent: true,
            },
          });
        }

        // 4. Persist Interests
        if (data.interests.length > 0) {
          await tx.studentInterest.deleteMany({
            where: { studentProfileId: profile.id },
          }).catch(() => {});

          for (const interest of data.interests) {
            await tx.studentInterest.create({
              data: {
                studentProfileId: profile.id,
                interestName: interest,
                category: "EXPLORATORY",
                weight: 1.0,
              },
            });
          }
        }

        // 5. Persist Self-Reported Skills
        if (data.skills.length > 0) {
          // Find skill category
          const defaultCategory = await tx.skillCategory.findFirst();
          const categoryId = defaultCategory?.id || "default-cat";

          for (const sk of data.skills) {
            const canonicalSlug = sk.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
            let skillRecord = await tx.skill.findUnique({ where: { name: sk.name } });

            if (!skillRecord && defaultCategory) {
              skillRecord = await tx.skill.create({
                data: {
                  categoryId,
                  name: sk.name,
                  canonicalSlug,
                  isTechnical: true,
                },
              });
            }

            if (skillRecord) {
              await tx.userSkill.upsert({
                where: {
                  studentProfileId_skillId: {
                    studentProfileId: profile.id,
                    skillId: skillRecord.id,
                  },
                },
                update: {
                  proficiencyLevel: sk.proficiency as SkillProficiencyLevel,
                },
                create: {
                  studentProfileId: profile.id,
                  skillId: skillRecord.id,
                  proficiencyLevel: sk.proficiency as SkillProficiencyLevel,
                  // Self-reported skills remain unverified with 0.0 assessment score until verified via AI missions
                  scorePercentage: 0.0,
                  isVerified: false,
                },
              });
            }
          }
        }

        // 6. Persist Learning Preferences
        await tx.learningPreference.upsert({
          where: { studentProfileId: profile.id },
          update: {
            preferredPace: data.learningPreferences.preferredPace,
            preferredStyle: data.learningPreferences.preferredStyle,
            weeklyHoursAvailable: data.learningPreferences.weeklyHoursAvailable,
            primaryLanguage: data.learningPreferences.primaryLanguage,
            allowAiMentoring: data.learningPreferences.allowAiMentoring,
          },
          create: {
            studentProfileId: profile.id,
            preferredPace: data.learningPreferences.preferredPace,
            preferredStyle: data.learningPreferences.preferredStyle,
            weeklyHoursAvailable: data.learningPreferences.weeklyHoursAvailable,
            primaryLanguage: data.learningPreferences.primaryLanguage,
            allowAiMentoring: data.learningPreferences.allowAiMentoring,
          },
        });

        // 7. Persist Strict DPDP Privacy Preferences
        await tx.privacyPreference.upsert({
          where: { studentProfileId: profile.id },
          update: {
            allowRecruiterView: !isMinor, // DPDP minor lock
            isProfilePublic: false,
          },
          create: {
            studentProfileId: profile.id,
            allowRecruiterView: !isMinor,
            isProfilePublic: false,
            allowAnalytics: true,
          },
        });

        // 8. Mark Onboarding Progress as complete
        await tx.onboardingProgress.upsert({
          where: { studentProfileId: profile.id },
          update: {
            currentStep: 7,
            isCompleted: true,
            stepDataJson: JSON.stringify(data),
          },
          create: {
            studentProfileId: profile.id,
            currentStep: 7,
            isCompleted: true,
            stepDataJson: JSON.stringify(data),
          },
        });
      });
    } else {
      // Offline fallback: Persist onboarding in devStore
      const profileId = user.studentProfile?.id || "fallback-prof-" + user.id;
      const streamDefaultTitles: Record<string, string> = {
        MEDICAL_PCB: "Clinical Healthcare & Medicine",
        NON_MEDICAL_PCM: "Engineering & Applied Sciences",
        COMMERCE: "Chartered Accountancy & Finance",
        ARTS_HUMANITIES: "Humanities & Social Impact",
        LAW: "Legal Studies & Judiciary",
        MANAGEMENT: "Business Management",
        CREATIVE_DESIGN: "Design & Creative Arts",
        AGRICULTURE: "Agricultural Sciences",
        VOCATIONAL_TRADES: "Vocational & Applied Technology",
        SPORTS_PHYSICAL_ED: "Sports & Physical Education",
        HOSPITALITY_TOURISM: "Hospitality & Tourism Management",
        INTERDISCIPLINARY: "Interdisciplinary Studies",
        UNDECIDED: "Exploring Career Pathways",
      };

      const targetTitle = data.careerGoal?.targetRole || streamDefaultTitles[data.primaryStream] || "Exploring Career Pathways";
      const targetSlug = targetTitle.toLowerCase().replace(/[^a-z0-9]/g, "-");
      const targetYear = data.careerGoal?.targetYear || 2027;

      devStore.saveProfile({
        id: profileId,
        userId: user.id,
        educationStage: data.educationStage,
        currentStream: data.primaryStream,
        selectedStreams: data.selectedStreams,
        targetCareerPathId: targetSlug,
        targetCompletionYear: targetYear,
        onboardingCompleted: true,
        careerReadinessIndex: calculatedCRI,
        user: { name: user.name, email: user.email },
        interests: data.interests.map((i) => ({ domain: i, interestName: i })),
        careerGoals: [
          {
            careerPath: { slug: targetSlug, title: targetTitle, regulatoryBody: "Statutory Council" },
            priorityRank: 1,
          },
        ],
        userSkills: data.skills.map((s) => ({
          skill: { name: s.name, category: "TECHNICAL" },
          proficiencyLevel: s.proficiency,
          isVerified: false,
        })),
        roadmaps: [],
        dailyMissions: [],
      });

      // Update user in devStore
      const storedUser = devStore.getUserByEmail(user.email);
      if (storedUser) {
        if (!storedUser.studentProfile) storedUser.studentProfile = {};
        storedUser.studentProfile.id = profileId;
        storedUser.studentProfile.educationStage = data.educationStage;
        storedUser.studentProfile.currentStream = data.primaryStream;
        storedUser.studentProfile.onboardingCompleted = true;
        storedUser.studentProfile.careerReadinessIndex = calculatedCRI;
        devStore.saveUser(storedUser);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Diagnostic profile and preferences successfully calibrated.",
      onboardingCompleted: true,
      careerReadinessIndex: calculatedCRI,
      isMinor,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Onboarding error:", err);
    return NextResponse.json(
      { error: "Could not save onboarding profile.", details: err.message },
      { status: 500 }
    );
  }
}
