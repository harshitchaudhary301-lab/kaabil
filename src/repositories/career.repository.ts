// ==============================================================================
// KAABIL (काबिल) — Career Pathway Repository
// Universal Career, Education, Skill Development & Employment Ecosystem
// ==============================================================================

import { db, checkDatabaseConnection } from "@/lib/db";
import { EducationalStream, EducationStage } from "@prisma/client";
import { CAREER_PATHS_DATABASE, STREAMS_CONFIG } from "@/data/careersData";

export interface CareerQueryParams {
  stream?: EducationalStream | "ALL";
  search?: string;
  stage?: EducationStage;
  page?: number;
  limit?: number;
}

export interface PublicCareerListItem {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  overview: string;
  stream: EducationalStream;
  streamTitle: string;
  domainName: string;
  minEducationStage: EducationStage;
  avgStartingSalaryInr: number | null;
  avgMidCareerSalaryInr: number | null;
  growthOutlook: string | null;
  automationRisk: string | null;
  regulatoryBody: string | null;
  isRegulated: boolean;
  isDemoData: boolean;
  verificationStatus: string;
  skills: {
    name: string;
    category: string;
    requiredLevel: number;
    importanceWeight: number;
    isMandatory: boolean;
  }[];
  keyEntranceExams: string[];
}

export class CareerRepository {
  /**
   * Queries paginated and filtered career paths from PostgreSQL.
   * If PostgreSQL is disconnected, serves from validated local canonical dataset
   * while transparently reporting the database connection status.
   */
  static async getCareers(params: CareerQueryParams = {}): Promise<{
    careers: PublicCareerListItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    source: "database" | "local_catalogue";
    isDbConnected: boolean;
    dbMessage?: string;
  }> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(50, Math.max(1, params.limit || 12));
    const skip = (page - 1) * limit;

    const conn = await checkDatabaseConnection();

    if (conn.connected) {
      try {
        const whereClause: Record<string, unknown> = {};

        // Stream filter: Match direct stream or multi-stream junction
        if (params.stream && params.stream !== "ALL") {
          whereClause.OR = [
            { subDomain: { domain: { stream: params.stream } } },
            { streams: { some: { stream: params.stream } } },
          ];
        }

        // Stage filter
        if (params.stage) {
          whereClause.minEducationStage = params.stage;
        }

        // Search query
        if (params.search && params.search.trim() !== "") {
          const q = params.search.trim();
          whereClause.AND = [
            {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { overview: { contains: q, mode: "insensitive" } },
                { tagline: { contains: q, mode: "insensitive" } },
                {
                  skillRequirements: {
                    some: { skill: { name: { contains: q, mode: "insensitive" } } },
                  },
                },
              ],
            },
          ];
        }

        const [total, records] = await Promise.all([
          db.careerPath.count({ where: whereClause }),
          db.careerPath.findMany({
            where: whereClause,
            skip,
            take: limit,
            orderBy: [{ isRegulated: "desc" }, { title: "asc" }],
            include: {
              subDomain: {
                include: { domain: true },
              },
              streams: true,
              skillRequirements: {
                include: { skill: { include: { category: true } } },
              },
              entranceExams: {
                include: { exam: true },
              },
            },
          }),
        ]);

        if (records.length > 0) {
          const mappedCareers: PublicCareerListItem[] = records.map((c) => {
            const stream = c.subDomain.domain.stream;
            const streamCfg = STREAMS_CONFIG.find((s) => s.stream === stream);

            return {
              id: c.id,
              slug: c.slug,
              title: c.title,
              tagline: c.tagline,
              overview: c.overview,
              stream,
              streamTitle: streamCfg?.title || c.subDomain.domain.name,
              domainName: c.subDomain.name,
              minEducationStage: c.minEducationStage,
              avgStartingSalaryInr: c.avgStartingSalaryInr,
              avgMidCareerSalaryInr: c.avgMidCareerSalaryInr,
              growthOutlook: c.growthOutlook,
              automationRisk: c.automationRisk,
              regulatoryBody: c.regulatoryBody,
              isRegulated: c.isRegulated,
              isDemoData: c.isDemoData,
              verificationStatus: c.verificationStatus,
              skills: c.skillRequirements.map((sr) => ({
                name: sr.skill.name,
                category: sr.skill.category.name,
                requiredLevel:
                  sr.requiredLevel === "NOVICE"
                    ? 1
                    : sr.requiredLevel === "BEGINNER"
                    ? 2
                    : sr.requiredLevel === "INTERMEDIATE"
                    ? 3
                    : sr.requiredLevel === "PROFICIENT"
                    ? 4
                    : 5,
                importanceWeight: sr.weight,
                isMandatory: sr.isMandatory,
              })),
              keyEntranceExams: c.entranceExams.map((ee) => ee.exam.name),
            };
          });

          return {
            careers: mappedCareers,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            source: "database",
            isDbConnected: true,
          };
        }
      } catch (err: unknown) {
        console.error("CareerRepository getCareers DB query failed:", err);
      }
    }

    // Explicit fallback using local canonical dataset
    let filtered = [...CAREER_PATHS_DATABASE];

    if (params.stream && params.stream !== "ALL") {
      filtered = filtered.filter((c) => c.stream === params.stream);
    }

    if (params.search && params.search.trim() !== "") {
      const q = params.search.toLowerCase().trim();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.overview.toLowerCase().includes(q) ||
          c.tagline.toLowerCase().includes(q) ||
          c.skills.some((s) => s.name.toLowerCase().includes(q))
      );
    }

    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + limit);

    const fallbackItems: PublicCareerListItem[] = paginated.map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      tagline: c.tagline,
      overview: c.overview,
      stream: c.stream as EducationalStream,
      streamTitle: c.streamTitle,
      domainName: c.domainName,
      minEducationStage: c.minEducationStage as EducationStage,
      avgStartingSalaryInr: c.avgStartingSalaryInr,
      avgMidCareerSalaryInr: c.avgMidCareerSalaryInr,
      growthOutlook: c.growthOutlook,
      automationRisk: c.automationRisk,
      regulatoryBody: c.regulatoryBody || null,
      isRegulated: !!c.regulatoryBody,
      isDemoData: c.isDemoData,
      verificationStatus: "VERIFIED",
      skills: c.skills.map((s) => ({
        name: s.name,
        category: s.category,
        requiredLevel: s.requiredLevel,
        importanceWeight: s.importanceWeight,
        isMandatory: s.isMandatory,
      })),
      keyEntranceExams: c.keyEntranceExams,
    }));

    return {
      careers: fallbackItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      source: "local_catalogue",
      isDbConnected: conn.connected,
      dbMessage: conn.message,
    };
  }

  /**
   * Retrieves single career by slug.
   */
  static async getCareerBySlug(slug: string) {
    const conn = await checkDatabaseConnection();

    if (conn.connected) {
      try {
        const record = await db.careerPath.findUnique({
          where: { slug },
          include: {
            subDomain: {
              include: { domain: true },
            },
            streams: true,
            qualifications: true,
            entranceExams: {
              include: { exam: true },
            },
            skillRequirements: {
              include: { skill: { include: { category: true } } },
            },
            eligibilityRules: true,
            roadmapTemplates: {
              include: {
                steps: {
                  include: {
                    resources: { include: { resource: true } },
                  },
                },
              },
            },
            sources: true,
          },
        });

        if (record) {
          const stream = record.subDomain?.domain?.stream || record.streams?.[0]?.stream;
          return {
            data: {
              ...record,
              stream,
            },
            source: "database",
            isDbConnected: true,
          };
        }
      } catch (err: unknown) {
        console.error("CareerRepository getCareerBySlug DB query failed:", err);
      }
    }

    const localMatch = CAREER_PATHS_DATABASE.find((c) => c.slug === slug);
    return {
      data: localMatch || null,
      source: "local_catalogue",
      isDbConnected: conn.connected,
      dbMessage: conn.message,
    };
  }

  /**
   * Returns published database counts.
   */
  static async getCatalogueCounts(): Promise<{
    totalCareers: number;
    totalStreams: number;
    isDbConnected: boolean;
    source: "database" | "local_catalogue";
  }> {
    const conn = await checkDatabaseConnection();
    if (conn.connected) {
      try {
        const [totalCareers, totalDomains] = await Promise.all([
          db.careerPath.count(),
          db.domain.count(),
        ]);
        return {
          totalCareers,
          totalStreams: totalDomains || 13,
          isDbConnected: true,
          source: "database",
        };
      } catch (err: unknown) {
        console.error("CareerRepository getCatalogueCounts error:", err);
      }
    }

    return {
      totalCareers: CAREER_PATHS_DATABASE.length,
      totalStreams: STREAMS_CONFIG.length,
      isDbConnected: conn.connected,
      source: "local_catalogue",
    };
  }
}
