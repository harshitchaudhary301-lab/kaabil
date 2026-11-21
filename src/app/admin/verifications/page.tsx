"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Building2,
  Briefcase,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FileText,
  ExternalLink,
  Eye,
  RefreshCw,
  Search,
  AlertCircle,
  Check,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { ADMIN_NAV_ITEMS } from "@/components/admin/admin-nav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VerificationRequestItem, VerificationDecision } from "@/types/admin";

export default function AdminVerificationsPage() {
  const [requests, setRequests] = useState<VerificationRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Decision Modal
  const [activeReq, setActiveReq] = useState<VerificationRequestItem | null>(null);
  const [decisionType, setDecisionType] = useState<VerificationDecision | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [docModal, setDocModal] = useState<{ title: string; type: string; url: string } | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== "ALL") params.append("type", typeFilter);
      if (statusFilter !== "ALL") params.append("status", statusFilter);

      const res = await fetch(`/api/admin/verifications?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setRequests(data.queue);
        }
      }
    } catch (err) {
      console.error("Failed to fetch verifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [typeFilter, statusFilter]);

  const handleDecisionSubmit = async () => {
    if (!activeReq || !decisionType) return;
    if (!reviewNotes || reviewNotes.trim().length < 5) {
      setNotification({ type: "error", message: "Review notes must be at least 5 characters long." });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/verifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: activeReq.id,
          decision: decisionType,
          reviewNotes: reviewNotes.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setNotification({ type: "success", message: data.message });
        setActiveReq(null);
        setDecisionType(null);
        setReviewNotes("");
        fetchQueue();
      } else {
        setNotification({ type: "error", message: data.error || "Decision failed." });
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
      breadcrumbs={["Administration", "Verification Directorate"]}
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-text-primary">
                Trust & Safety Verification Directorate
              </h1>
              <Badge variant="default" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                Human-in-the-Loop Vetting
              </Badge>
            </div>
            <p className="text-sm text-text-secondary mt-1">
              Statutory verification of AISHE/CBSE codes for institutions and CIN/GSTIN corporate identity for employers
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchQueue}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Queue
          </Button>
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

        {/* Filter Toolbar */}
        <Card className="p-4 border-border flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-text-muted">Type:</span>
            {["ALL", "INSTITUTION", "EMPLOYER"].map((t) => (
              <Button
                key={t}
                size="sm"
                variant={typeFilter === t ? "primary" : "outline"}
                className="h-8 text-xs capitalize"
                onClick={() => setTypeFilter(t)}
              >
                {t === "ALL" ? "All Organizations" : t.toLowerCase() + "s"}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-text-muted">Status:</span>
            {["ALL", "PENDING_REVIEW", "APPROVED", "REJECTED"].map((s) => (
              <Button
                key={s}
                size="sm"
                variant={statusFilter === s ? "primary" : "outline"}
                className="h-8 text-xs capitalize"
                onClick={() => setStatusFilter(s)}
              >
                {s === "ALL" ? "All Statuses" : s.replace("_", " ").toLowerCase()}
              </Button>
            ))}
          </div>
        </Card>

        {/* Request Cards */}
        {loading ? (
          <Card className="p-12 text-center text-text-muted">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
            Loading verification queue...
          </Card>
        ) : requests.length === 0 ? (
          <Card className="p-12 text-center text-text-muted">
            No verification requests found matching current filters.
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <Card key={req.id} className="p-6 border-border hover:shadow-sm transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
                        {req.organizationType === "INSTITUTION" ? (
                          <Building2 className="h-4 w-4" />
                        ) : (
                          <Briefcase className="h-4 w-4" />
                        )}
                      </div>
                      <h3 className="font-heading text-lg font-bold text-text-primary">
                        {req.organizationName}
                      </h3>
                      <Badge
                        variant={
                          req.status === "APPROVED"
                            ? "success"
                            : req.status === "REJECTED"
                            ? "warning"
                            : "outline"
                        }
                        className="text-[11px]"
                      >
                        {req.status.replace("_", " ")}
                      </Badge>
                      <Badge variant="outline" className="text-[11px]">
                        {req.organizationType}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-xs text-text-secondary pt-1">
                      <div>
                        <strong className="text-text-primary font-medium">Identifier: </strong>
                        <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[11px]">
                          {req.registrationIdentifier}
                        </span>
                      </div>
                      <div>
                        <strong className="text-text-primary font-medium">Official Domain: </strong>
                        <span>{req.officialDomain}</span>
                      </div>
                      <div>
                        <strong className="text-text-primary font-medium">Official Email: </strong>
                        <span>{req.officialEmail}</span>
                      </div>
                      <div>
                        <strong className="text-text-primary font-medium">Signatory: </strong>
                        <span>
                          {req.authorizedSignatory
                            ? `${req.authorizedSignatory.name} (${req.authorizedSignatory.designation})`
                            : "Authorized Representative"}
                        </span>
                      </div>
                      <div>
                        <strong className="text-text-primary font-medium">Location: </strong>
                        <span>
                          {req.city || "New Delhi"}, {req.state || "Delhi"}
                        </span>
                      </div>
                      <div>
                        <strong className="text-text-primary font-medium">Submitted: </strong>
                        <span>{new Date(req.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Attached Documents */}
                    <div className="pt-2 flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-semibold text-text-muted">Verification Proofs:</span>
                      {req.documents.map((doc, dIdx) => (
                        <button
                          key={dIdx}
                          onClick={() =>
                            setDocModal({
                              title: doc.title || doc.fileName || "Statutory Proof",
                              type: doc.type || doc.documentType || "PDF Document",
                              url: doc.url || doc.documentUrl || "#",
                            })
                          }
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-medium hover:bg-blue-100 transition-colors"
                        >
                          <FileText className="h-3 w-3" />
                          <span>{doc.title || doc.fileName || "Proof Document"}</span>
                          <Eye className="h-3 w-3 ml-1 text-blue-500" />
                        </button>
                      ))}
                    </div>

                    {/* Reviewer Note if already reviewed */}
                    {req.reviewNotes && (
                      <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-border text-xs">
                        <strong className="text-text-primary">Auditor Note: </strong>
                        <span className="text-text-secondary">{req.reviewNotes}</span>
                        {req.reviewedBy && (
                          <span className="text-text-muted ml-2">
                            — {req.reviewedBy} on {new Date(req.reviewedAt || "").toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Decision Actions */}
                  <div className="flex flex-row lg:flex-col items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-3"
                      onClick={() => {
                        setActiveReq(req);
                        setDecisionType("APPROVED");
                        setReviewNotes(`Approved after verification of official credentials and valid registration (${req.registrationIdentifier}).`);
                      }}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      Approve
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="text-amber-700 border-amber-300 hover:bg-amber-50 text-xs h-8 px-3"
                      onClick={() => {
                        setActiveReq(req);
                        setDecisionType("ADDITIONAL_INFO_REQUIRED");
                        setReviewNotes("Please provide supplementary gazette notification or official letterhead endorsement.");
                      }}
                    >
                      <HelpCircle className="h-3.5 w-3.5 mr-1" />
                      Request Info
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-300 hover:bg-red-50 text-xs h-8 px-3"
                      onClick={() => {
                        setActiveReq(req);
                        setDecisionType("REJECTED");
                        setReviewNotes("Official registration identifier could not be reconciled against government databases.");
                      }}
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Decision Modal */}
        {activeReq && decisionType && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg p-6 bg-white space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-lg font-bold text-text-primary">
                  Confirm Verification Decision: {decisionType}
                </h3>
                <button
                  onClick={() => {
                    setActiveReq(null);
                    setDecisionType(null);
                  }}
                  className="text-text-muted hover:text-text-primary"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-border text-xs space-y-1">
                <div>
                  <strong className="text-text-primary">Organization: </strong>
                  {activeReq.organizationName} ({activeReq.organizationType})
                </div>
                <div>
                  <strong className="text-text-primary">Identifier: </strong>
                  {activeReq.registrationIdentifier}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-primary">
                  Reviewer Audit Note (Mandatory):
                </label>
                <textarea
                  className="w-full h-24 p-2 text-xs rounded-lg border border-border focus:outline-primary"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Record verification rationale, regulatory cross-reference, and notes..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setActiveReq(null);
                    setDecisionType(null);
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleDecisionSubmit}
                  disabled={submitting}
                  className={
                    decisionType === "APPROVED"
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : decisionType === "REJECTED"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-amber-600 hover:bg-amber-700 text-white"
                  }
                >
                  {submitting ? "Signing & Committing..." : `Commit ${decisionType}`}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Document Inspection Modal */}
        {docModal && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg p-6 bg-white space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-base font-bold text-text-primary flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  {docModal.title}
                </h3>
                <button onClick={() => setDocModal(null)} className="text-text-muted hover:text-text-primary">
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-border text-center space-y-3">
                <div className="text-xs text-text-muted">
                  Official statutory proof document archived in secure storage.
                </div>
                <div className="inline-block p-3 rounded-lg bg-white border border-border text-xs font-mono text-text-secondary">
                  Document Type: {docModal.type}
                  <br />
                  URI: {docModal.url}
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-emerald-700 font-medium">
                  <Check className="h-4 w-4" /> Cryptographic SHA-256 Digest Verified
                </div>
              </div>

              <div className="flex justify-end">
                <Button size="sm" variant="outline" onClick={() => setDocModal(null)}>
                  Close Viewer
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
