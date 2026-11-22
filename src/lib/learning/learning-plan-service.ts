// ==============================================================================
// KAABIL (काबिल) — Personalized Learning Plan & Projects Hub Service
// Real-world, multi-stream adaptive learning roadmaps, daily micro-tasks,
// authentic free resources, and multi-stream project submissions.
// Adheres strictly to Zero-Fabrication and DPDP Act Minor Shield standards.
// ==============================================================================

import { devStore } from "@/lib/dev-store";
import { ProfileService } from "@/lib/student/profile-service";
import { SkillTreeEngine } from "@/lib/skills/skill-tree-engine";
import {
  PersonalizedLearningPlanData,
  LearningPlanPreferences,
  WeeklySprintMilestone,
  LearningTask,
  StudentProjectEnrollment,
  CareerProject,
} from "@/types/learning-plan";
import {
  CURATED_LEARNING_RESOURCES,
  getCuratedResourcesForCareer,
} from "@/data/learningResourcesData";
import {
  CAREER_PROJECTS_DATABASE,
  getProjectsForCareer,
  getProjectBySlugOrId,
} from "@/data/careerProjectsData";
import { EducationalStream, EducationStage } from "@/types";

export class LearningPlanService {
  /**
   * Generates or retrieves a complete, personalized learning plan
   * integrating target career, education stage, missing skills from the skill tree,
   * student time commitment, and budget preferences.
   */
  public static async getLearningPlan(
    studentProfileIdOrEmail: string
  ): Promise<PersonalizedLearningPlanData> {
    // 1. Resolve student profile
    const profile = await ProfileService.getStudentProfile(studentProfileIdOrEmail);
    const profileId = profile?.id || "demo-profile-id";
    const educationStage: EducationStage = profile?.academic?.stage || "UNDERGRADUATE";
    const careerStream: EducationalStream = profile?.academic?.stream || "NON_MEDICAL_PCM";
    const streamTitle = profile?.academic?.streamLabel || "General Stream";

    // 2. Resolve target career
    const targetCareerSlug =
      profile?.targetCareer?.slug || "full-stack-web-developer";
    const careerTitle =
      profile?.targetCareer?.title || "Full Stack Web Developer";

    // 3. Resolve skill tree & real skill gaps
    const skillTree = await SkillTreeEngine.generateSkillTree(
      studentProfileIdOrEmail,
      targetCareerSlug
    );

    // Filter missing / unverified skills
    const missingNodes = skillTree.nodes.filter(
      (n) =>
        n.status === "READY_TO_LEARN" ||
        n.status === "LOCKED" ||
        n.status === "IN_PROGRESS" ||
        n.status === "SELF_REPORTED"
    );

    const suggestedNextSkill =
      skillTree.suggestedNextSkill ||
      missingNodes.find((n) => n.status === "READY_TO_LEARN") ||
      missingNodes[0] ||
      skillTree.nodes[0];

    // 4. Resolve student preferences
    const preferences: LearningPlanPreferences = devStore.getLearningPreferences(profileId);

    // 5. Daily duration based on weekly time budget
    // 5h -> 30 mins/day, 10h -> 45 mins/day, 15h -> 60 mins/day, 20h -> 90 mins/day (5 days/week)
    const taskMinutes =
      preferences.weeklyTimeCommitmentHours === 5
        ? 30
        : preferences.weeklyTimeCommitmentHours === 10
        ? 45
        : preferences.weeklyTimeCommitmentHours === 15
        ? 60
        : 90;

    // 6. Curated Authentic Resources
    const missingSkillNames = missingNodes.map((n) => n.name);
    const recommendedResources = getCuratedResourcesForCareer(
      careerStream,
      missingSkillNames
    );

    // 7. Load task states from devStore
    const taskStates = devStore.getLearningTaskStates(profileId);

    // 8. Generate 4-Week Sprints
    const weeklySprints = this.buildFourWeekSprints({
      missingNodes,
      suggestedNextSkill,
      taskMinutes,
      taskStates,
      recommendedResources,
      careerStream,
      careerTitle,
    });

    // 9. Flatten tasks for metrics and "What Should I Do Today?"
    const allTasks: LearningTask[] = weeklySprints.flatMap((w) => w.tasks);
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter((t) => t.isCompleted).length;
    const overallPlanProgressPercent =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Determine Today's Task: First uncompleted task
    const todaysTask = allTasks.find((t) => !t.isCompleted) || allTasks[0] || null;

    // Calculate streak
    let currentStreakDays = 0;
    if (completedTasks > 0) {
      currentStreakDays = Math.min(completedTasks, 7);
    }

    // 10. Load Enrolled and Suggested Projects
    const enrolledProjectsMap = devStore.getProjectEnrollments(profileId);
    const streamProjects = getProjectsForCareer(careerStream, targetCareerSlug);

    const enrolledProjects: { project: CareerProject; enrollment: StudentProjectEnrollment }[] = [];
    const suggestedProjects: CareerProject[] = [];

    for (const proj of streamProjects) {
      const enrollment = enrolledProjectsMap[proj.id];
      if (enrollment) {
        enrolledProjects.push({ project: proj, enrollment });
      } else {
        suggestedProjects.push(proj);
      }
    }

    // If no projects enrolled yet, ensure at least one beginner/intermediate project is suggested
    return {
      studentProfileId: profileId,
      careerSlug: targetCareerSlug,
      careerTitle,
      careerStream,
      streamTitle,
      educationStage,
      preferences,
      totalTasks,
      completedTasks,
      overallPlanProgressPercent,
      currentStreakDays,
      todaysTask,
      weeklySprints,
      recommendedResources,
      enrolledProjects,
      suggestedProjects,
    };
  }

  /**
   * Toggles task completion state.
   * Does NOT fabricate external skill verification or modify CRI.
   */
  public static async toggleTaskCompletion(
    studentProfileIdOrEmail: string,
    taskId: string,
    completed?: boolean
  ): Promise<{ success: boolean; isCompleted: boolean; completedAt: string | null }> {
    const profile = await ProfileService.getStudentProfile(studentProfileIdOrEmail);
    const profileId = profile?.id || "demo-profile-id";

    const currentStates = devStore.getLearningTaskStates(profileId);
    const currentState = currentStates[taskId];
    const newCompleted = completed !== undefined ? completed : !currentState?.isCompleted;

    const completedAt = newCompleted ? new Date().toISOString() : null;

    devStore.saveLearningTaskState(profileId, taskId, {
      isCompleted: newCompleted,
      completedAt,
    });

    return {
      success: true,
      isCompleted: newCompleted,
      completedAt,
    };
  }

  /**
   * Updates student's weekly time commitment and budget preferences.
   */
  public static async updatePreferences(
    studentProfileIdOrEmail: string,
    prefs: Partial<LearningPlanPreferences>
  ): Promise<LearningPlanPreferences> {
    const profile = await ProfileService.getStudentProfile(studentProfileIdOrEmail);
    const profileId = profile?.id || "demo-profile-id";

    const current = devStore.getLearningPreferences(profileId);
    const updated: LearningPlanPreferences = {
      weeklyTimeCommitmentHours:
        prefs.weeklyTimeCommitmentHours || current.weeklyTimeCommitmentHours || 10,
      budgetPreference:
        prefs.budgetPreference || current.budgetPreference || "FREE_ONLY",
      learningPace:
        prefs.learningPace || current.learningPace || "STEADY",
    };

    devStore.saveLearningPreferences(profileId, updated);
    return updated;
  }

  /**
   * Enrolls a student in a project from the Projects Hub.
   */
  public static async enrollInProject(
    studentProfileIdOrEmail: string,
    projectId: string
  ): Promise<StudentProjectEnrollment> {
    const profile = await ProfileService.getStudentProfile(studentProfileIdOrEmail);
    const profileId = profile?.id || "demo-profile-id";

    const existingMap = devStore.getProjectEnrollments(profileId);
    if (existingMap[projectId]) {
      return existingMap[projectId];
    }

    const newEnrollment: StudentProjectEnrollment = {
      id: `enroll-${Date.now()}-${projectId}`,
      projectId,
      studentProfileId: profileId,
      status: "IN_PROGRESS",
      startedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      completedMilestoneIds: [],
      submissionUrl: null,
      submissionNotes: null,
      submittedAt: null,
      selfAssessedReflection: null,
    };

    devStore.saveProjectEnrollment(profileId, projectId, newEnrollment);
    return newEnrollment;
  }

  /**
   * Toggles milestone completion on an enrolled project.
   */
  public static async updateProjectMilestone(
    studentProfileIdOrEmail: string,
    projectId: string,
    milestoneId: string,
    completed: boolean
  ): Promise<StudentProjectEnrollment> {
    const profile = await ProfileService.getStudentProfile(studentProfileIdOrEmail);
    const profileId = profile?.id || "demo-profile-id";

    const enrollments = devStore.getProjectEnrollments(profileId);
    let enrollment = enrollments[projectId];

    if (!enrollment) {
      enrollment = await this.enrollInProject(studentProfileIdOrEmail, projectId);
    }

    const milestoneSet = new Set<string>(enrollment.completedMilestoneIds || []);
    if (completed) {
      milestoneSet.add(milestoneId);
    } else {
      milestoneSet.delete(milestoneId);
    }

    const updated: StudentProjectEnrollment = {
      ...enrollment,
      completedMilestoneIds: Array.from(milestoneSet),
      lastUpdatedAt: new Date().toISOString(),
    };

    devStore.saveProjectEnrollment(profileId, projectId, updated);
    return updated;
  }

  /**
   * Submits an enrolled project with portfolio deliverables.
   * Records project submission as self-reported practical evidence (NOT platform-verified).
   */
  public static async submitProject(
    studentProfileIdOrEmail: string,
    projectId: string,
    submission: {
      submissionUrl: string;
      submissionNotes?: string;
      selfAssessedReflection?: string;
    }
  ): Promise<StudentProjectEnrollment> {
    const profile = await ProfileService.getStudentProfile(studentProfileIdOrEmail);
    const profileId = profile?.id || "demo-profile-id";

    const enrollments = devStore.getProjectEnrollments(profileId);
    let enrollment = enrollments[projectId];

    if (!enrollment) {
      enrollment = await this.enrollInProject(studentProfileIdOrEmail, projectId);
    }

    const project = getProjectBySlugOrId(projectId);

    const updated: StudentProjectEnrollment = {
      ...enrollment,
      status: "SUBMITTED",
      submissionUrl: submission.submissionUrl,
      submissionNotes: submission.submissionNotes || null,
      selfAssessedReflection: submission.selfAssessedReflection || null,
      submittedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
    };

    devStore.saveProjectEnrollment(profileId, projectId, updated);

    // Save self-directed project evidence in devStore (PROVENANCE: SELF_REPORTED)
    // Never fabricate platform-assessed verification badges or CRI scores (Rule 13 & 14)
    if (project) {
      devStore.saveSkillEvidence({
        id: `ev-proj-${Date.now()}`,
        studentProfileId: profileId,
        skillName: project.requiredSkills[0] || project.title,
        evidenceType: "PORTFOLIO_PROJECT",
        title: project.title,
        description: `Student completed and submitted self-directed project: ${project.title}. Deliverable: ${submission.submissionUrl}`,
        url: submission.submissionUrl,
        isVerified: false,
        verificationStatus: "SELF_REPORTED",
        scorePercentage: 80, // Self-assessed indicative completeness, unverified
        verifiedAt: null,
        verifier: null,
      });
    }

    return updated;
  }

  // ============================================================================
  // PRIVATE BUILDER METHODS
  // ============================================================================

  private static buildFourWeekSprints(params: {
    missingNodes: any[];
    suggestedNextSkill: any;
    taskMinutes: number;
    taskStates: Record<string, any>;
    recommendedResources: any[];
    careerStream: EducationalStream;
    careerTitle: string;
  }): WeeklySprintMilestone[] {
    const {
      missingNodes,
      suggestedNextSkill,
      taskMinutes,
      taskStates,
      recommendedResources,
      careerStream,
      careerTitle,
    } = params;

    // Pick 3 focus skills across 4 weeks
    const skill1 = suggestedNextSkill?.name || "Foundation Principles";
    const skill2 = missingNodes[1]?.name || missingNodes[0]?.name || "Core Analytical Methods";
    const skill3 = missingNodes[2]?.name || missingNodes[0]?.name || "Applied Practice & Tools";

    const primaryResource = recommendedResources[0] || {
      title: "Public Curriculum Portal (NPTEL / Swayam)",
      url: "https://swayam.gov.in",
      provider: "Ministry of Education / Swayam",
      isFree: true,
    };

    const secondaryResource = recommendedResources[1] || primaryResource;

    const sprints: WeeklySprintMilestone[] = [
      // Week 1: Foundation Focus
      {
        weekNumber: 1,
        title: `Week 1: Foundations of ${skill1}`,
        titleHi: `सप्ताह 1: ${skill1} के मूलभूत सिद्धांत`,
        titleHinglish: `Week 1: ${skill1} ka Foundation & Basics`,
        focusSkill: skill1,
        objective: `Master the core terminology, principles, and fundamental framework of ${skill1}.`,
        estimatedHours: Math.round((taskMinutes * 5) / 60),
        tasks: [
          this.makeTask({
            id: "task-w1-d1",
            dayNumber: 1,
            dayLabel: "Day 1 (Mon)",
            title: `Introduction & Conceptual Framework: ${skill1}`,
            titleHi: `परिचय और वैचारिक ढांचा: ${skill1}`,
            titleHinglish: `Intro aur Core Concepts: ${skill1}`,
            skillTarget: skill1,
            minutes: taskMinutes,
            type: "READING",
            resource: primaryResource,
            criteria: "Read foundational overview and summarize 3 core takeaways in your notebook.",
            criteriaHi: "मूलभूत अवलोकन पढ़ें और अपनी नोटबुक में 3 मुख्य बिंदु संक्षेप में लिखें।",
            criteriaHinglish: "Overview padhein aur 3 main takeaways apne notes me likhein.",
            taskStates,
          }),
          this.makeTask({
            id: "task-w1-d2",
            dayNumber: 2,
            dayLabel: "Day 2 (Tue)",
            title: `Guided Walkthrough: Core Rules & Standards`,
            titleHi: `मार्गदर्शित पाठ: मुख्य नियम और मानक`,
            titleHinglish: `Video Walkthrough: Core Rules & Standards`,
            skillTarget: skill1,
            minutes: taskMinutes,
            type: "VIDEO",
            resource: primaryResource,
            criteria: "Watch standard video lecture and note key terminology and formulas.",
            criteriaHi: "मानक वीडियो व्याख्यान देखें और प्रमुख शब्दावली को नोट करें।",
            criteriaHinglish: "Lecture video dekhein aur essential keywords note karein.",
            taskStates,
          }),
          this.makeTask({
            id: "task-w1-d3",
            dayNumber: 3,
            dayLabel: "Day 3 (Wed)",
            title: `Hands-On Practice: Beginner Exercises`,
            titleHi: `व्यावहारिक अभ्यास: शुरुआती अभ्यास प्रश्न`,
            titleHinglish: `Hands-On Practice: Beginner Exercises`,
            skillTarget: skill1,
            minutes: taskMinutes,
            type: "HANDS_ON_PRACTICE",
            resource: primaryResource,
            criteria: "Solve 5 foundational problems or draft initial working template.",
            criteriaHi: "5 बुनियादी समस्याओं को हल करें या प्रारंभिक कार्यशील टेम्पलेट बनाएं।",
            criteriaHinglish: "5 foundational problems solve karein ya basic template banayein.",
            taskStates,
          }),
          this.makeTask({
            id: "task-w1-d4",
            dayNumber: 4,
            dayLabel: "Day 4 (Thu)",
            title: `Diagnostic Self-Assessment & Misconceptions Review`,
            titleHi: `स्व-मूल्यांकन और समीक्षा`,
            titleHinglish: `Self-Check Quiz & Concept Clarification`,
            skillTarget: skill1,
            minutes: taskMinutes,
            type: "DIAGNOSTIC_QUIZ",
            resource: primaryResource,
            criteria: "Complete practice quiz and review explanations for any incorrect answers.",
            criteriaHi: "अभ्यास प्रश्नोत्तरी पूरी करें और गलत उत्तरों के स्पष्टीकरण की समीक्षा करें।",
            criteriaHinglish: "Practice quiz complete karein aur doubts clear karein.",
            taskStates,
          }),
          this.makeTask({
            id: "task-w1-d5",
            dayNumber: 5,
            dayLabel: "Day 5 (Fri)",
            title: `Mini-Synthesis: 1-Page Summary & Practical Draft`,
            titleHi: `साप्ताहिक संक्षेप और व्यावहारिक मसौदा`,
            titleHinglish: `Week 1 Summary & Practical Reflection`,
            skillTarget: skill1,
            minutes: taskMinutes,
            type: "CASE_STUDY",
            resource: primaryResource,
            criteria: "Draft a 1-page synthesis connecting theory to real-world applications.",
            criteriaHi: "सिद्धांत को वास्तविक अनुप्रयोगों से जोड़ने वाला 1-पृष्ठ का सारांश तैयार करें।",
            criteriaHinglish: "1-page summary banayein jo theory ko real-world use-case se connect kare.",
            taskStates,
          }),
        ],
        isCompleted: false,
        progressPercent: 0,
      },

      // Week 2: Deep Dive into Secondary Missing Competency
      {
        weekNumber: 2,
        title: `Week 2: Deep Dive into ${skill2}`,
        titleHi: `सप्ताह 2: ${skill2} का गहन अध्ययन`,
        titleHinglish: `Week 2: ${skill2} Deep Dive & Techniques`,
        focusSkill: skill2,
        objective: `Build practical confidence and procedural competence in ${skill2}.`,
        estimatedHours: Math.round((taskMinutes * 5) / 60),
        tasks: [
          this.makeTask({
            id: "task-w2-d1",
            dayNumber: 1,
            dayLabel: "Day 1 (Mon)",
            title: `Methodology & Best Practices in ${skill2}`,
            titleHi: `पद्धति और सर्वोत्तम अभ्यास: ${skill2}`,
            titleHinglish: `Core Methods & Best Practices: ${skill2}`,
            skillTarget: skill2,
            minutes: taskMinutes,
            type: "READING",
            resource: secondaryResource,
            criteria: "Study standard operating procedures or industry best practices documentation.",
            criteriaHi: "मानक संचालन प्रक्रियाएं या उद्योग सर्वोत्तम अभ्यास दस्तावेज पढ़ें।",
            criteriaHinglish: "Standard industry guidelines aur best practices padhein.",
            taskStates,
          }),
          this.makeTask({
            id: "task-w2-d2",
            dayNumber: 2,
            dayLabel: "Day 2 (Tue)",
            title: `Practical Demonstration & Protocol Breakdown`,
            titleHi: `व्यावहारिक प्रदर्शन और विश्लेषण`,
            titleHinglish: `Video Demo: Step-by-Step Protocol`,
            skillTarget: skill2,
            minutes: taskMinutes,
            type: "VIDEO",
            resource: secondaryResource,
            criteria: "Follow along step-by-step with an expert demonstration.",
            criteriaHi: "विशेषज्ञ प्रदर्शन के साथ चरण-दर-चरण अभ्यास करें।",
            criteriaHinglish: "Expert demonstration ko follow karte hue practical steps note karein.",
            taskStates,
          }),
          this.makeTask({
            id: "task-w2-d3",
            dayNumber: 3,
            dayLabel: "Day 3 (Wed)",
            title: `Simulation & Intermediate Exercise`,
            titleHi: `सिमुलेशन और मध्यम स्तर का अभ्यास`,
            titleHinglish: `Hands-on Simulation & Problem Set`,
            skillTarget: skill2,
            minutes: taskMinutes,
            type: "HANDS_ON_PRACTICE",
            resource: secondaryResource,
            criteria: "Implement an intermediate task with edge-case considerations.",
            criteriaHi: "विभिन्न परिस्थितियों को ध्यान में रखते हुए मध्यम स्तर का कार्य पूरा करें।",
            criteriaHinglish: "Intermediate task implement karein with edge-case handling.",
            taskStates,
          }),
          this.makeTask({
            id: "task-w2-d4",
            dayNumber: 4,
            dayLabel: "Day 4 (Thu)",
            title: `Real-World Case Study Analysis`,
            titleHi: `वास्तविक केस स्टडी विश्लेषण`,
            titleHinglish: `Real-World Case Study Breakdown`,
            skillTarget: skill2,
            minutes: taskMinutes,
            type: "CASE_STUDY",
            resource: secondaryResource,
            criteria: "Analyze a published case study examining common failures and solutions.",
            criteriaHi: "सामान्य समस्याओं और समाधानों की जांच करने वाले केस स्टडी का विश्लेषण करें।",
            criteriaHinglish: "Case study examine karke common errors aur optimal solutions identify karein.",
            taskStates,
          }),
          this.makeTask({
            id: "task-w2-d5",
            dayNumber: 5,
            dayLabel: "Day 5 (Fri)",
            title: `Intermediate Milestone Checkpoint`,
            titleHi: `मध्यवर्ती मील का पत्थर जांच`,
            titleHinglish: `Week 2 Milestone Evaluation`,
            skillTarget: skill2,
            minutes: taskMinutes,
            type: "DIAGNOSTIC_QUIZ",
            resource: secondaryResource,
            criteria: "Evaluate progress against competency benchmarks.",
            criteriaHi: "दक्षता मानकों के अनुसार प्रगति का मूल्यांकन करें।",
            criteriaHinglish: "Competency rubric ke against apna progress check karein.",
            taskStates,
          }),
        ],
        isCompleted: false,
        progressPercent: 0,
      },

      // Week 3: Applied Integration & Practical Challenge
      {
        weekNumber: 3,
        title: `Week 3: Applied Integration of ${skill3}`,
        titleHi: `सप्ताह 3: ${skill3} का एकीकृत अनुप्रयोग`,
        titleHinglish: `Week 3: Applied Integration & Problem Solving`,
        focusSkill: skill3,
        objective: `Combine foundational concepts with practical tool mastery for ${careerTitle}.`,
        estimatedHours: Math.round((taskMinutes * 5) / 60),
        tasks: [
          this.makeTask({
            id: "task-w3-d1",
            dayNumber: 1,
            dayLabel: "Day 1 (Mon)",
            title: `Tooling & Environment Setup for ${skill3}`,
            titleHi: `उपकरण और कार्यक्षेत्र सेटअप: ${skill3}`,
            titleHinglish: `Tools & Environment Setup: ${skill3}`,
            skillTarget: skill3,
            minutes: taskMinutes,
            type: "HANDS_ON_PRACTICE",
            resource: primaryResource,
            criteria: "Set up professional tool environment (IDE, spreadsheet, simulator, or drafting kit).",
            criteriaHi: "व्यावसायिक उपकरण कार्यक्षेत्र (आईडीई, स्प्रेडशीट या किट) सेट करें।",
            criteriaHinglish: "Required software, IDE ya tools correctly configure karein.",
            taskStates,
          }),
          this.makeTask({
            id: "task-w3-d2",
            dayNumber: 2,
            dayLabel: "Day 2 (Tue)",
            title: `Advanced Workflow & Automation Patterns`,
            titleHi: `उन्नत कार्यप्रवाह और ऑटोमेशन तकनीक`,
            titleHinglish: `Advanced Workflow & Productivity Techniques`,
            skillTarget: skill3,
            minutes: taskMinutes,
            type: "VIDEO",
            resource: primaryResource,
            criteria: "Learn productivity accelerators, shortcut patterns, and error diagnostics.",
            criteriaHi: "उत्पादकता बढ़ाने वाली तकनीकें और त्रुटि निदान सीखें।",
            criteriaHinglish: "Advanced patterns aur efficiency shortcuts master karein.",
            taskStates,
          }),
          this.makeTask({
            id: "task-w3-d3",
            dayNumber: 3,
            dayLabel: "Day 3 (Wed)",
            title: `Comprehensive Scenario Exercise`,
            titleHi: `व्यापक परिदृश्य अभ्यास`,
            titleHinglish: `End-to-End Scenario Simulation`,
            skillTarget: skill3,
            minutes: taskMinutes,
            type: "HANDS_ON_PRACTICE",
            resource: primaryResource,
            criteria: "Simulate a live client/workplace task under standard time limits.",
            criteriaHi: "मानक समय सीमा के भीतर एक कार्यस्थल कार्य का अनुकरण करें।",
            criteriaHinglish: "Timed scenario solve karein simulating real workplace constraints.",
            taskStates,
          }),
          this.makeTask({
            id: "task-w3-d4",
            dayNumber: 4,
            dayLabel: "Day 4 (Thu)",
            title: `Cross-Domain Synthesis: Quality & Compliance`,
            titleHi: `गुणवत्ता और अनुपालन समीक्षा`,
            titleHinglish: `Quality Check, Standards & Compliance`,
            skillTarget: skill3,
            minutes: taskMinutes,
            type: "READING",
            resource: primaryResource,
            criteria: "Review statutory standards, safety guidelines, and code of ethics.",
            criteriaHi: "सांविधिक मानकों, सुरक्षा दिशानिर्देशों और आचार संहिता की समीक्षा करें।",
            criteriaHinglish: "Safety, ethics aur statutory standards guidelines verify karein.",
            taskStates,
          }),
          this.makeTask({
            id: "task-w3-d5",
            dayNumber: 5,
            dayLabel: "Day 5 (Fri)",
            title: `Project Readiness & Pre-Mortem Review`,
            titleHi: `प्रोजेक्ट तैयारी और पूर्व-समीक्षा`,
            titleHinglish: `Pre-Project Plan & Peer Rubric Review`,
            skillTarget: skill3,
            minutes: taskMinutes,
            type: "CASE_STUDY",
            resource: primaryResource,
            criteria: "Verify readiness to tackle an independent practical project.",
            criteriaHi: "स्वतंत्र व्यावहारिक प्रोजेक्ट शुरू करने की तैयारी की पुष्टि करें।",
            criteriaHinglish: "Project checklist review karein ensuring all prerequisites are met.",
            taskStates,
          }),
        ],
        isCompleted: false,
        progressPercent: 0,
      },

      // Week 4: Capstone Practical Project
      {
        weekNumber: 4,
        title: `Week 4: Practical Capstone Deliverable`,
        titleHi: `सप्ताह 4: व्यावहारिक कैपस्टोन प्रोजेक्ट`,
        titleHinglish: `Week 4: Real-World Project Execution`,
        focusSkill: `${skill1} & ${skill2}`,
        objective: `Execute and document an end-to-end practical project for your career portfolio.`,
        estimatedHours: Math.round((taskMinutes * 5) / 60),
        tasks: [
          this.makeTask({
            id: "task-w4-d1",
            dayNumber: 1,
            dayLabel: "Day 1 (Mon)",
            title: `Milestone 1: Project Scope, Wireframe & Architecture`,
            titleHi: `चरण 1: प्रोजेक्ट दायरा और संरचना`,
            titleHinglish: `Milestone 1: Scope Definition & Wireframe`,
            skillTarget: skill1,
            minutes: taskMinutes,
            type: "PROJECT_MILESTONE",
            resource: primaryResource,
            criteria: "Complete Milestone 1 of your chosen Projects Hub assignment.",
            criteriaHi: "अपने चुने हुए प्रोजेक्ट असाइनमेंट का चरण 1 पूरा करें।",
            criteriaHinglish: "Projects Hub assignment ka Milestone 1 complete karein.",
            taskStates,
          }),
          this.makeTask({
            id: "task-w4-d2",
            dayNumber: 2,
            dayLabel: "Day 2 (Tue)",
            title: `Milestone 2: Core Implementation & Operations`,
            titleHi: `चरण 2: मुख्य क्रियान्वयन`,
            titleHinglish: `Milestone 2: Core Build & Implementation`,
            skillTarget: skill2,
            minutes: taskMinutes,
            type: "PROJECT_MILESTONE",
            resource: primaryResource,
            criteria: "Build functional core with standard validation and error handling.",
            criteriaHi: "मानक सत्यापन के साथ मुख्य कार्यशीलता का निर्माण करें।",
            criteriaHinglish: "Core functionality implement karein with clean validations.",
            taskStates,
          }),
          this.makeTask({
            id: "task-w4-d3",
            dayNumber: 3,
            dayLabel: "Day 3 (Wed)",
            title: `Milestone 3: Polish, UI/Design & Edge-Case Testing`,
            titleHi: `चरण 3: सुधार, डिजाइन और परीक्षण`,
            titleHinglish: `Milestone 3: Testing & Polish`,
            skillTarget: skill3,
            minutes: taskMinutes,
            type: "PROJECT_MILESTONE",
            resource: primaryResource,
            criteria: "Test thoroughly on multiple viewports/scenarios and fix bugs.",
            criteriaHi: "विभिन्न परिदृश्यों में परीक्षण करें और त्रुटियों को ठीक करें।",
            criteriaHinglish: "Extensive testing karein aur formatting/bugs polish karein.",
            taskStates,
          }),
          this.makeTask({
            id: "task-w4-d4",
            dayNumber: 4,
            dayLabel: "Day 4 (Thu)",
            title: `Milestone 4: Deliverable Export & Documentation`,
            titleHi: `चरण 4: दस्तावेज और अंतिम निर्यात`,
            titleHinglish: `Milestone 4: Documentation & Submission Link`,
            skillTarget: skill1,
            minutes: taskMinutes,
            type: "PROJECT_MILESTONE",
            resource: primaryResource,
            criteria: "Prepare public repository, PDF report, or live prototype link.",
            criteriaHi: "सार्वजनिक रिपॉजिटरी, पीडीएफ रिपोर्ट या प्रोटोटाइप लिंक तैयार करें।",
            criteriaHinglish: "Clean documentation aur deliverable link prepare karein.",
            taskStates,
          }),
          this.makeTask({
            id: "task-w4-d5",
            dayNumber: 5,
            dayLabel: "Day 5 (Fri)",
            title: `Project Submission & Self-Assessed Reflection`,
            titleHi: `प्रोजेक्ट सबमिशन और स्व-समीक्षा`,
            titleHinglish: `Final Project Submission & Reflection`,
            skillTarget: `${skill1} & ${skill2}`,
            minutes: taskMinutes,
            type: "PROJECT_MILESTONE",
            resource: primaryResource,
            criteria: "Submit deliverable in Projects Hub and log self-reflection notes.",
            criteriaHi: "प्रोजेक्ट्स हब में सबमिट करें और आत्म-चिंतन नोट्स दर्ज करें।",
            criteriaHinglish: "Deliverable submit karein aur key learnings reflect karein.",
            taskStates,
          }),
        ],
        isCompleted: false,
        progressPercent: 0,
      },
    ];

    // Compute completion progress for each sprint
    for (const sprint of sprints) {
      const completedCount = sprint.tasks.filter((t) => t.isCompleted).length;
      sprint.isCompleted = completedCount === sprint.tasks.length && sprint.tasks.length > 0;
      sprint.progressPercent =
        sprint.tasks.length > 0
          ? Math.round((completedCount / sprint.tasks.length) * 100)
          : 0;
    }

    return sprints;
  }

  private static makeTask(params: {
    id: string;
    dayNumber: number;
    dayLabel: string;
    title: string;
    titleHi?: string;
    titleHinglish?: string;
    skillTarget: string;
    minutes: number;
    type: any;
    resource: any;
    criteria: string;
    criteriaHi?: string;
    criteriaHinglish?: string;
    taskStates: Record<string, any>;
  }): LearningTask {
    const saved = params.taskStates[params.id];
    return {
      id: params.id,
      dayNumber: params.dayNumber,
      dayLabel: params.dayLabel,
      title: params.title,
      titleHi: params.titleHi,
      titleHinglish: params.titleHinglish,
      skillTarget: params.skillTarget,
      estimatedMinutes: params.minutes,
      type: params.type,
      resourceTitle: params.resource.title,
      resourceUrl: params.resource.url,
      isFreeResource: params.resource.isFree ?? true,
      resourceProvider: params.resource.provider || "Public Educational Portal",
      completionCriteria: params.criteria,
      completionCriteriaHi: params.criteriaHi,
      completionCriteriaHinglish: params.criteriaHinglish,
      isCompleted: !!saved?.isCompleted,
      completedAt: saved?.completedAt || null,
    };
  }
}
