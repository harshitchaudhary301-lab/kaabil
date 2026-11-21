"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Eye,
  FileText,
  Bookmark,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { ADMIN_NAV_ITEMS } from "@/components/admin/admin-nav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CMSContentItem, CMSContentType, CMSContentStatus } from "@/types/admin";
import { EducationalStream } from "@/types";

const STREAMS: EducationalStream[] = [
  "NON_MEDICAL_PCM",
  "MEDICAL_PCB",
  "COMMERCE",
  "ARTS_HUMANITIES",
  "VOCATIONAL_TRADES",
  "LAW",
  "MANAGEMENT",
  "CREATIVE_DESIGN",
  "AGRICULTURE",
  "SPORTS_PHYSICAL_ED",
  "HOSPITALITY_TOURISM",
  "INTERDISCIPLINARY",
  "UNDECIDED",
];

const CONTENT_TYPES: CMSContentType[] = [
  "CAREER_PATH",
  "SKILL_TAXONOMY",
  "QUESTION_BANK",
  "LEARNING_RESOURCE",
  "ROADMAP_TEMPLATE",
  "EXAM_ALERT",
  "SCHOLARSHIP",
  "FAQ",
  "ANNOUNCEMENT",
  "POLICY",
];

export default function AdminCMSPage() {
  const [items, setItems] = useState<CMSContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [streamFilter, setStreamFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Create / Edit modal state
  const [editingItem, setEditingItem] = useState<Partial<CMSContentItem> | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== "ALL") params.append("type", typeFilter);
      if (streamFilter !== "ALL") params.append("stream", streamFilter);
      if (statusFilter !== "ALL") params.append("status", statusFilter);

      const res = await fetch(`/api/admin/cms?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setItems(data.items);
        }
      }
    } catch (err) {
      console.error("Failed to load CMS items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [typeFilter, streamFilter, statusFilter]);

  const handleSaveItem = async () => {
    const cType = editingItem?.contentType || editingItem?.type;
    if (!editingItem?.title || !cType || !editingItem?.content) {
      setNotification({ type: "error", message: "Title, type, and content are required." });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editingItem,
          type: cType,
          contentType: cType,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setNotification({ type: "success", message: data.message });
        setEditingItem(null);
        fetchItems();
      } else {
        setNotification({ type: "error", message: data.error || "Save failed." });
      }
    } catch (err: any) {
      setNotification({ type: "error", message: err.message || "Network error." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PortalLayout
      portalName="Admin Governance"
      portalRole="ADMIN"
      navItems={ADMIN_NAV_ITEMS}
      breadcrumbs={["Administration", "Platform CMS"]}
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-text-primary">
                Universal Platform CMS & Taxonomy
              </h1>
              <Badge variant="outline" className="border-primary/30 text-primary">
                13 Educational Streams Active
              </Badge>
            </div>
            <p className="text-sm text-text-secondary mt-1">
              Curate career catalogues, entrance examinations, scholarships, assessment question banks, and policies
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchItems}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              size="sm"
              className="gap-1.5 bg-primary text-white"
              onClick={() =>
                setEditingItem({
                  contentType: "CAREER_PATH",
                  type: "CAREER_PATH",
                  title: "",
                  stream: "NON_MEDICAL_PCM",
                  summary: "",
                  content: "",
                  tags: [],
                  status: "PUBLISHED",
                  targetAudiences: ["STUDENT"],
                })
              }
            >
              <Plus className="h-4 w-4" />
              Create Content Item
            </Button>
          </div>
        </div>

        {/* Feedback Alert */}
        {notification && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
              notification.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="font-bold underline ml-4 hover:opacity-80"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Filters */}
        <Card className="p-4 border-border flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-text-muted">Type:</span>
            <select
              className="h-8 text-xs px-2.5 rounded-lg border border-border bg-white text-text-primary"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="ALL">All Content Types</option>
              {CONTENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replace(/_/g, " ")}
                </option>
              ))}
            </select>

            <span className="text-xs font-semibold text-text-muted ml-2">Stream:</span>
            <select
              className="h-8 text-xs px-2.5 rounded-lg border border-border bg-white text-text-primary"
              value={streamFilter}
              onChange={(e) => setStreamFilter(e.target.value)}
            >
              <option value="ALL">All 13 Streams</option>
              {STREAMS.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </select>

            <span className="text-xs font-semibold text-text-muted ml-2">Status:</span>
            <select
              className="h-8 text-xs px-2.5 rounded-lg border border-border bg-white text-text-primary"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </Card>

        {/* Content Items List */}
        {loading ? (
          <Card className="p-12 text-center text-text-muted">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
            Loading CMS content repository...
          </Card>
        ) : items.length === 0 ? (
          <Card className="p-12 text-center text-text-muted">
            No CMS items found matching the selected filters.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => {
              const displayType = item.contentType || item.type || "CONTENT";
              const contentSummary =
                item.summary ||
                (typeof item.content === "string"
                  ? item.content
                  : JSON.stringify(item.content));

              return (
                <Card
                  key={item.id}
                  className="p-5 border-border flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="text-[10px] uppercase font-bold text-primary">
                        {displayType.replace(/_/g, " ")}
                      </Badge>
                      <Badge
                        variant={
                          item.status === "PUBLISHED"
                            ? "success"
                            : item.status === "DRAFT"
                            ? "warning"
                            : "outline"
                        }
                        className="text-[10px]"
                      >
                        {item.status}
                      </Badge>
                    </div>

                    <h3 className="font-heading text-base font-bold text-text-primary line-clamp-1">
                      {item.title}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-text-muted">
                      <GraduationCap className="h-3.5 w-3.5" />
                      <span>{item.stream.replace(/_/g, " ")}</span>
                    </div>

                    <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                      {contentSummary}
                    </p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {(item.tags || []).slice(0, 3).map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-text-muted">
                    <span>v{item.version} • {new Date(item.updatedAt).toLocaleDateString()}</span>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-primary"
                        onClick={() => setEditingItem(item)}
                      >
                        <Edit className="h-3.5 w-3.5 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Create / Edit Modal */}
        {editingItem && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl p-6 bg-white space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-lg font-bold text-text-primary">
                  {editingItem.id ? "Edit CMS Content Item" : "Create New Content Item"}
                </h3>
                <button
                  onClick={() => setEditingItem(null)}
                  className="text-text-muted hover:text-text-primary"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-text-primary block mb-1">Title</label>
                  <Input
                    className="h-9 text-xs"
                    value={editingItem.title || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    placeholder="e.g. Master Curriculum for Robotics Engineering"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-text-primary block mb-1">Content Type</label>
                    <select
                      className="w-full h-9 px-2 rounded-lg border border-border bg-white text-xs"
                      value={editingItem.contentType || editingItem.type || "CAREER_PATH"}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          contentType: e.target.value as CMSContentType,
                          type: e.target.value as CMSContentType,
                        })
                      }
                    >
                      {CONTENT_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-text-primary block mb-1">Educational Stream</label>
                    <select
                      className="w-full h-9 px-2 rounded-lg border border-border bg-white text-xs"
                      value={editingItem.stream || "NON_MEDICAL_PCM"}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          stream: e.target.value as EducationalStream,
                        })
                      }
                    >
                      {STREAMS.map((s) => (
                        <option key={s} value={s}>
                          {s.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-text-primary block mb-1">Status</label>
                    <select
                      className="w-full h-9 px-2 rounded-lg border border-border bg-white text-xs"
                      value={editingItem.status || "PUBLISHED"}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, status: e.target.value as CMSContentStatus })
                      }
                    >
                      <option value="PUBLISHED">Published</option>
                      <option value="DRAFT">Draft</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-text-primary block mb-1">Summary</label>
                  <Input
                    className="h-9 text-xs"
                    value={editingItem.summary || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, summary: e.target.value })}
                    placeholder="Short summary for preview cards..."
                  />
                </div>

                <div>
                  <label className="font-semibold text-text-primary block mb-1">Content Body (Markdown Supported)</label>
                  <textarea
                    className="w-full h-36 p-2 rounded-lg border border-border font-mono text-xs focus:outline-primary"
                    value={
                      typeof editingItem.content === "string"
                        ? editingItem.content
                        : JSON.stringify(editingItem.content || "")
                    }
                    onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
                    placeholder="Write detailed curriculum, examination criteria, questions, or policy text..."
                  />
                </div>

                <div>
                  <label className="font-semibold text-text-primary block mb-1">
                    Tags (Comma-separated)
                  </label>
                  <Input
                    className="h-9 text-xs"
                    value={(editingItem.tags || []).join(", ")}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        tags: e.target.value
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="engineering, robotics, ai, gate"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingItem(null)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveItem}
                  disabled={submitting}
                  className="bg-primary text-white"
                >
                  {submitting ? "Saving..." : "Save & Publish"}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
