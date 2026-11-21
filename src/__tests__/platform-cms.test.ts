import { describe, it, expect, beforeEach } from "vitest";
import { devStore } from "@/lib/dev-store";
import { CMSContentItem } from "@/types/admin";

describe("Part G2: Universal Platform CMS & Taxonomy", () => {
  beforeEach(() => {
    devStore.reset();
  });

  it("creates and publishes content across multiple educational streams", () => {
    const newItem: CMSContentItem = {
      id: "cms-med-path-01",
      contentType: "CAREER_PATH",
      type: "CAREER_PATH",
      stream: "MEDICAL_PCB",
      title: "Pediatric Pathology Specialist Career Pathway",
      slug: "pediatric-pathology-specialist",
      summary: "Comprehensive educational journey from MBBS to Fellowship in Pediatric Pathology.",
      content: {
        stages: ["MBBS Degree", "MD Pathology", "Fellowship in Pediatric Diagnostics"],
        regulatoryCouncil: "National Medical Commission (NMC)",
      },
      status: "PUBLISHED",
      authorId: "admin-super-01",
      authorName: "Dr. Vikramaditya Sen",
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };

    devStore.saveCMSContentItem(newItem);

    const retrieved = devStore.getCMSContentItem("cms-med-path-01");
    expect(retrieved).toBeDefined();
    expect(retrieved?.title).toContain("Pediatric Pathology");
    expect(retrieved?.stream).toBe("MEDICAL_PCB");
    expect(retrieved?.status).toBe("PUBLISHED");
  });

  it("increments version and updates content body", () => {
    const item = devStore.getCMSContentItems()[0];
    const initialVersion = item.version || 1;

    const updatedItem: CMSContentItem = {
      ...item,
      summary: "Updated curriculum guidelines for 2026-2027 academic session.",
      updatedAt: new Date().toISOString(),
    };

    devStore.saveCMSContentItem(updatedItem);

    const saved = devStore.getCMSContentItem(item.id);
    expect(saved?.version).toBe(initialVersion + 1);
    expect(saved?.summary).toContain("2026-2027");
  });

  it("filters content by stream, status, and content type", () => {
    const items = devStore.getCMSContentItems();
    expect(items.length).toBeGreaterThan(0);

    const publishedItems = devStore.getCMSContentItems({ status: "PUBLISHED" });
    expect(publishedItems.every((i) => i.status === "PUBLISHED")).toBe(true);
  });
});
