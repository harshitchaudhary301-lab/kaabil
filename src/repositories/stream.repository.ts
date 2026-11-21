// ==============================================================================
// KAABIL (काबिल) — Educational Stream Repository
// Universal Career, Education, Skill Development & Employment Ecosystem
// ==============================================================================

import { db, checkDatabaseConnection } from "@/lib/db";
import { EducationalStream } from "@prisma/client";
import { STREAMS_CONFIG } from "@/data/careersData";

export interface StreamSummary {
  stream: EducationalStream;
  title: string;
  hindiTitle: string;
  shortDescription: string;
  iconName: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  careerCount: number;
}

export class StreamRepository {
  /**
   * Retrieves all 13 supported educational streams with verified career counts.
   * If PostgreSQL is reachable, queries live counts from DB.
   * If unreachable, returns standard stream catalogue with database status flag.
   */
  static async getAllStreams(): Promise<{
    data: StreamSummary[];
    source: "database" | "local_catalogue";
    isDbConnected: boolean;
    dbMessage?: string;
  }> {
    const conn = await checkDatabaseConnection();

    if (conn.connected) {
      try {
        const domains = await db.domain.findMany({
          where: { isActive: true },
          orderBy: { orderIndex: "asc" },
          include: {
            subDomains: {
              include: {
                careerPaths: {
                  select: { id: true },
                },
              },
            },
          },
        });

        if (domains.length > 0) {
          const streamSummaries: StreamSummary[] = domains.map((domain) => {
            const staticCfg = STREAMS_CONFIG.find(
              (s) => s.stream === domain.stream
            );
            const totalCareers = domain.subDomains.reduce(
              (acc, sub) => acc + sub.careerPaths.length,
              0
            );

            return {
              stream: domain.stream,
              title: domain.name,
              hindiTitle: staticCfg?.hindiTitle || domain.name,
              shortDescription: domain.description,
              iconName: domain.iconName || staticCfg?.iconName || "Sparkles",
              badgeBg: staticCfg?.badgeColor.bg || "bg-slate-50",
              badgeText: staticCfg?.badgeColor.text || "text-slate-700",
              badgeBorder: staticCfg?.badgeColor.border || "border-slate-200",
              careerCount: totalCareers,
            };
          });

          return {
            data: streamSummaries,
            source: "database",
            isDbConnected: true,
          };
        }
      } catch (err: unknown) {
        console.error("StreamRepository query error:", err);
      }
    }

    // Explicit fallback when database is disconnected / not yet seeded
    const fallbackSummaries: StreamSummary[] = STREAMS_CONFIG.map((s) => ({
      stream: s.stream as EducationalStream,
      title: s.title,
      hindiTitle: s.hindiTitle,
      shortDescription: s.shortDescription,
      iconName: s.iconName,
      badgeBg: s.badgeColor.bg,
      badgeText: s.badgeColor.text,
      badgeBorder: s.badgeColor.border,
      careerCount: 1, // 1 canonical demo benchmark per stream in local baseline
    }));

    return {
      data: fallbackSummaries,
      source: "local_catalogue",
      isDbConnected: conn.connected,
      dbMessage: conn.message,
    };
  }

  /**
   * Retrieves single stream detail by enum code.
   */
  static async getStreamByCode(streamCode: EducationalStream) {
    const conn = await checkDatabaseConnection();

    if (conn.connected) {
      try {
        const domain = await db.domain.findFirst({
          where: { stream: streamCode, isActive: true },
          include: {
            subDomains: {
              include: {
                careerPaths: {
                  include: {
                    skillRequirements: {
                      include: { skill: true },
                    },
                    entranceExams: {
                      include: { exam: true },
                    },
                  },
                },
              },
            },
          },
        });

        if (domain) {
          return { data: domain, source: "database", isDbConnected: true };
        }
      } catch (err: unknown) {
        console.error("StreamRepository getStreamByCode error:", err);
      }
    }

    const staticMatch = STREAMS_CONFIG.find((s) => s.stream === streamCode);
    return {
      data: staticMatch || null,
      source: "local_catalogue",
      isDbConnected: conn.connected,
      dbMessage: conn.message,
    };
  }
}
