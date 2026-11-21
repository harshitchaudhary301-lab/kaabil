// ==============================================================================
// KAABIL (काबिल) — Resume Studio Service
// Structured resume generation, skill passport integration, and template styling.
// ==============================================================================

import { devStore } from "@/lib/dev-store";
import { StudentResumeData } from "@/types/admin";
import { EducationalStream, EducationStage } from "@/types";

export class ResumeService {
  /**
   * Retrieves existing student resume or generates an auto-populated draft
   * using the student's profile, verified credentials, and skills.
   */
  public static getResumeForStudent(studentId: string): StudentResumeData {
    const existing = devStore.getStudentResume(studentId);
    if (existing) {
      return existing;
    }

    // Auto-populate from user profile and store
    const user = devStore.getUser(studentId);
    const credentials = (devStore as any).getStudentCredentials
      ? (devStore as any).getStudentCredentials(studentId)
      : [];

    const verifiedSkills = (user?.studentProfile?.verifiedSkills || [
      "Python",
      "Calculus",
      "Robotics Control",
      "Scientific Research",
    ]).map((s: string) => ({
      name: s,
      level: "Proficient",
      verified: true,
    }));

    const initialResume: StudentResumeData = {
      id: `resume-${studentId}`,
      studentId,
      studentProfileId: studentId,
      fullName: user?.name || "Aryan Sharma",
      headline: "Autonomous Systems & Robotics Engineering Student",
      email: user?.email || "aryan.sharma@example.com",
      phone: "+91 98765 43210",
      city: "New Delhi",
      state: "Delhi",
      stream: (user?.studentProfile?.currentStream || "NON_MEDICAL_PCM") as EducationalStream,
      educationStage: (user?.studentProfile?.educationStage || "UNDERGRADUATE") as EducationStage,
      template: "MODERN_CLEAN",
      templateId: "MODERN_CLEAN",
      personalInfo: {
        fullName: user?.name || "Aryan Sharma",
        email: user?.email || "aryan.sharma@example.com",
        phone: "+91 98765 43210",
        location: "New Delhi, India",
        linkedinUrl: "https://linkedin.com/in/aryan-sharma",
        githubUrl: "https://github.com/aryan-sharma",
        portfolioUrl: "https://kaabil.in/p/aryan-sharma",
      },
      summary:
        "Dedicated engineering student specializing in Mathematics, Computing, and Autonomous Systems. Proven track record in algorithmic problem solving and robotics competitions.",
      education: [
        {
          institution: "Delhi Technological University (DTU)",
          degree: "B.Tech in Computer Science & Engineering",
          fieldOfStudy: "Artificial Intelligence & Robotics",
          startYear: "2023",
          endYear: "2027 (Expected)",
          grade: "9.2 CGPA",
        },
      ],
      skills: verifiedSkills,
      verifiedSkills: verifiedSkills.map((s: any) => s.name),
      selfReportedSkills: ["C++", "ROS 2", "OpenCV"],
      experience: [
        {
          title: "Robotics Research Intern",
          organization: "Centre for Autonomous Systems, DTU",
          location: "New Delhi",
          startDate: "Jun 2024",
          endDate: "Aug 2024",
          description:
            "Implemented SLAM navigation algorithms for autonomous ground rovers. Reduced localization drift by 18% using sensor fusion.",
        },
      ],
      projects: [
        {
          title: "Autonomous Drone Obstacle Avoidance",
          description: "Developed stereo vision pipeline for real-time indoor obstacle detection.",
          technologies: ["Python", "OpenCV", "ROS 2"],
          url: "https://github.com/aryan-sharma/drone-vision",
          link: "https://github.com/aryan-sharma/drone-vision",
        },
      ],
      credentials: credentials.map((c: any) => ({
        title: c.title || "Certified Competency",
        issuer: c.issuerName || "KAABIL Platform",
        issuerName: c.issuerName || "KAABIL Platform",
        issueDate: c.issueDate || "2026-10",
        issuedAt: c.issueDate || "2026-10",
        verificationUrl: `https://kaabil.in/verify/${c.id || "cred-01"}`,
      })),
      lastUpdated: new Date().toISOString(),
    };

    devStore.saveStudentResume(initialResume);
    return initialResume;
  }

  /**
   * Saves updated student resume.
   */
  public static saveResume(resume: StudentResumeData): StudentResumeData {
    resume.lastUpdated = new Date().toISOString();
    devStore.saveStudentResume(resume);
    return resume;
  }
}
