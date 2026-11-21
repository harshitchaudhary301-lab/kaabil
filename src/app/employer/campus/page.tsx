"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Building,
  Plus,
  Send,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Calendar,
  Users,
  MapPin,
  FileText,
  AlertCircle,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { EMPLOYER_NAV } from "@/components/employer/employer-nav";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InstitutionPartnershipRecord, JobOpportunityRecord } from "@/types/employer";
import { EducationalStream } from "@/types";

export default function EmployerCampusPage() {
  const [partnerships, setPartnerships] = useState<InstitutionPartnershipRecord[]>([]);
  const [opportunities, setOpportunities] = useState<JobOpportunityRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // New Proposal Form
  const [showDriveModal, setShowDriveModal] = useState<boolean>(false);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>("inst-delhi-tech");
  const [selectedInstName, setSelectedInstName] = useState<string>("Delhi Institute of Higher Technology");
  const [driveTitle, setDriveTitle] = useState<string>("");
  const [targetStream, setTargetStream] = useState<EducationalStream>("NON_MEDICAL_PCM");
  const [driveDate, setDriveDate] = useState<string>("2026-12-15");
  const [driveLocation, setDriveLocation] = useState<string>("Campus Auditorium & Virtual Screening");

  useEffect(() => {
    fetchCampusData();
  }, []);

  async function fetchCampusData() {
    setLoading(true);
    try {
      // 1. Fetch partnerships
      const partRes = await fetch("/api/employer/partnerships");
      const partData = await partRes.json();
      if (partData.success) {
        setPartnerships(partData.partnerships || []);
      }

      // 2. Fetch opportunities
      const oppRes = await fetch("/api/employer/opportunities");
      const oppData = await oppRes.json();
      if (oppData.success) {
        setOpportunities(oppData.opportunities || []);
      }
    } catch (err) {
      console.error("Failed to load campus data", err);
    } finally {
      setLoading(false);
    }
  }

  const handleProposeDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveTitle.trim()) {
      setStatusMessage({ type: "error", text: "Please enter a placement drive title." });
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/employer/partnerships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          institutionId: selectedInstitutionId,
          institutionName: selectedInstName,
          title: driveTitle,
          stream: targetStream,
          date: driveDate,
          location: driveLocation,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: "success",
          text: `Placement drive proposal successfully submitted to ${selectedInstName}!`,
        });
        setShowDriveModal(false);
        setDriveTitle("");
        await fetchCampusData();
      } else {
        setStatusMessage({ type: "error", text: data.error || "Failed to submit proposal." });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Network error occurred." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PortalLayout
      portalName="Employer Console"
      portalRole="EMPLOYER"
      navItems={EMPLOYER_NAV}
      breadcrumbs={["Campus", "Recruitment Drives & Partnerships"]}
    >
      <div className="space-y-6 max-w-6xl mx-auto pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              Campus Recruitment & Institutional Partnerships
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Coordinate placement drives and skill-verified cohort recruitment with educational institutions.
            </p>
          </div>

          <Button
            onClick={() => setShowDriveModal(true)}
            className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2 shadow-sm text-xs"
          >
            <Plus className="h-4 w-4" /> Propose Placement Drive
          </Button>
        </div>

        {/* DPDP Safeguard Banner */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Consensual Student Recruitment:</strong> In compliance with the Digital Personal Data Protection
              Act (2023), student records are only transmitted when adult students explicitly register or apply for
              your scheduled campus recruitment drive.
            </span>
          </div>
          <Badge variant="outline" className="text-[10px] bg-white text-emerald-700 border-emerald-300">
            DPDP Compliant
          </Badge>
        </div>

        {statusMessage && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
              statusMessage.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Active Partnerships List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Partner Educational Institutions</h2>
            <span className="text-xs text-slate-500">{partnerships.length} active partnerships</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">Loading institutional relationships...</div>
          ) : partnerships.length === 0 ? (
            <Card className="border-slate-200 shadow-sm text-center py-12 bg-white">
              <CardContent>
                <Building className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-slate-800">No Institutional Partnerships Yet</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Partner with universities, engineering colleges, medical institutes, and polytechnics to recruit verified talent.
                </p>
                <Button
                  onClick={() => setShowDriveModal(true)}
                  variant="outline"
                  size="sm"
                  className="mt-4 text-xs border-slate-300"
                >
                  Propose Your First Drive
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {partnerships.map((p) => (
                <Card key={p.id} className="border-slate-200 shadow-sm bg-white hover:border-slate-300 transition-all">
                  <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-bold text-slate-900">{p.institutionName}</CardTitle>
                      <div className="text-[11px] text-slate-500">Established {new Date(p.establishedAt).toLocaleDateString("en-IN")}</div>
                    </div>
                    <Badge
                      className={`text-[10px] ${
                        p.status === "APPROVED"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {p.status}
                    </Badge>
                  </CardHeader>
                  <CardContent className="pt-3 text-xs space-y-2">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Placement Drives Conducted:</span>
                      <strong className="text-slate-900">{p.driveProposalsCount} Drives</strong>
                    </div>
                    <div className="pt-2 flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedInstitutionId(p.institutionId);
                          setSelectedInstName(p.institutionName);
                          setShowDriveModal(true);
                        }}
                        className="text-xs h-7 border-slate-200"
                      >
                        Schedule Drive
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Modal: Propose Campus Placement Drive */}
        {showDriveModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in-50 zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" />
                  Propose Campus Placement Drive
                </h3>
                <button
                  type="button"
                  onClick={() => setShowDriveModal(false)}
                  className="text-slate-400 hover:text-slate-700 text-lg leading-none"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleProposeDrive} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Institution</label>
                  <select
                    value={selectedInstitutionId}
                    onChange={(e) => {
                      setSelectedInstitutionId(e.target.value);
                      const instNames: Record<string, string> = {
                        "inst-delhi-tech": "Delhi Institute of Higher Technology",
                        "inst-aiims-del": "All India Institute of Medical Sciences (AIIMS)",
                        "inst-nlsiu-blr": "National Law School of India University",
                        "inst-poly-pune": "Government Polytechnic Pune",
                      };
                      setSelectedInstName(instNames[e.target.value] || "Educational Institution");
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                  >
                    <option value="inst-delhi-tech">Delhi Institute of Higher Technology</option>
                    <option value="inst-aiims-del">All India Institute of Medical Sciences (AIIMS)</option>
                    <option value="inst-nlsiu-blr">National Law School of India University</option>
                    <option value="inst-poly-pune">Government Polytechnic Pune</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Drive Name / Role Focus</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Annual Technology Trainee Placement Drive 2026"
                    value={driveTitle}
                    onChange={(e) => setDriveTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Target Stream</label>
                    <select
                      value={targetStream}
                      onChange={(e) => setTargetStream(e.target.value as EducationalStream)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                    >
                      <option value="NON_MEDICAL_PCM">Engineering (PCM)</option>
                      <option value="MEDICAL_PCB">Medicine (PCB)</option>
                      <option value="COMMERCE">Commerce & Finance</option>
                      <option value="ARTS_HUMANITIES">Arts & Humanities</option>
                      <option value="LAW">Law</option>
                      <option value="VOCATIONAL_TRADES">Vocational & Trades</option>
                      <option value="MANAGEMENT">Management</option>
                      <option value="CREATIVE_DESIGN">Design</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Drive Date</label>
                    <input
                      type="date"
                      required
                      value={driveDate}
                      onChange={(e) => setDriveDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Drive Venue / Logistics</label>
                  <input
                    type="text"
                    value={driveLocation}
                    onChange={(e) => setDriveLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    When the institution approves this drive, eligible students will receive invitations. Only students who voluntarily register will share their verified skill profile with your team.
                  </span>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDriveModal(false)}
                    className="border-slate-200"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting} className="bg-primary hover:bg-primary/90 text-white">
                    {submitting ? "Submitting..." : "Submit Proposal"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
