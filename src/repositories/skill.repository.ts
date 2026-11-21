// ==============================================================================
// KAABIL (काबिल) — Skill & Competency Repository
// Universal Career, Education, Skill Development & Employment Ecosystem
// ==============================================================================

import { db, checkDatabaseConnection } from "@/lib/db";

export class SkillRepository {
  /**
   * Retrieves list of competency skills with their categories.
   */
  static async getSkills(params: {
    categoryId?: string;
    search?: string;
    limit?: number;
  } = {}) {
    const conn = await checkDatabaseConnection();

    if (conn.connected) {
      try {
        const whereClause: Record<string, unknown> = {};

        if (params.categoryId) {
          whereClause.categoryId = params.categoryId;
        }

        if (params.search && params.search.trim() !== "") {
          whereClause.OR = [
            { name: { contains: params.search.trim(), mode: "insensitive" } },
            { description: { contains: params.search.trim(), mode: "insensitive" } },
          ];
        }

        const skills = await db.skill.findMany({
          where: whereClause,
          take: params.limit || 50,
          orderBy: { name: "asc" },
          include: {
            category: true,
          },
        });

        return { data: skills, source: "database", isDbConnected: true };
      } catch (err: unknown) {
        console.error("SkillRepository query error:", err);
      }
    }

    return { data: [], source: "local_catalogue", isDbConnected: conn.connected };
  }

  /**
   * Retrieves all canonical skill categories.
   */
  static async getCategories() {
    const conn = await checkDatabaseConnection();

    if (conn.connected) {
      try {
        const categories = await db.skillCategory.findMany({
          orderBy: { name: "asc" },
          include: {
            _count: {
              select: { skills: true },
            },
          },
        });
        return { data: categories, source: "database", isDbConnected: true };
      } catch (err: unknown) {
        console.error("SkillRepository getCategories error:", err);
      }
    }

    return {
      data: [
        { id: "cat-1", name: "Technical & Systems", description: "Hard tools, technologies, and clinical instrumentation." },
        { id: "cat-2", name: "Domain Knowledge", description: "Statutory standards, biological mechanics, and legal jurisprudence." },
        { id: "cat-3", name: "Analytical & Quantitative", description: "Data telemetry, risk modeling, and structured problem-solving." },
        { id: "cat-4", name: "Interpersonal & Leadership", description: "Cross-stream articulation, empathy, and negotiation." },
      ],
      source: "local_catalogue",
      isDbConnected: conn.connected,
    };
  }
}
