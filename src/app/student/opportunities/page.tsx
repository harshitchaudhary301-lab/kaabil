"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Building,
  Sparkles,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Bookmark,
  Check,
  AlertTriangle,
  GraduationCap,
  Layers,
  ChevronRight,
  ExternalLink,
  Award,
  X,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { STUDENT_NAV } from "@/components/student/student-nav";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JobOpportunityRecord } from "@/types/employer";
import { EducationalStream } from "@/types";



export default function StudentOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<JobOpportunityRecord[]>([]);
  const [appliedOppIds, setAppliedOppIds] = useState<string[]>([]);
  const [savedOppIds, setSavedOppIds] = useState<string[]>([]);
  const [isMinor, setIsMinor] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [streamFilter, setStreamFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [viewTab, setViewTab] = useState<"ALL" | "RECOMMENDED" | "SAVED" | "APPLIED">("ALL");
  const [recommendedMatches, setRecommendedMatches] = useState<any[]>([]);

  // Application Modal
  const [selectedOpp, setSelectedOpp] = useState<JobOpportunityRecord | null>(null);
  const [coverNote, setCoverNote] = useState("");
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [submittingApp, setSubmittingApp] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    fetchStudentOpportunities();
  }, [streamFilter, typeFilter]);

  async function fetchStudentOpportunities() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (streamFilter !== "ALL") params.set("stream", streamFilter);
      if (typeFilter !== "ALL") params.set("type", typeFilter);

      const res = await fetch(`/api/student/opportunities?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setOpportunities(data.opportunities || []);
        setAppliedOppIds(data.appliedOpportunityIds || []);
        setIsMinor(Boolean(data.isMinor));
      }

      // Fetch saved opportunities
      const savedRes = await fetch("/api/student/opportunities/saved");
      const savedData = await savedRes.json();
      if (savedData.success) {
        setSavedOppIds(savedData.savedOpportunityIds || []);
      }

      // Fetch AI explainable recommendations
      const recRes = await fetch("/api/student/opportunities/recommendations");
      const recData = await recRes.json();
      if (recData.success) {
        setRecommendedMatches(recData.recommendations || []);
      }
    } catch (err) {
      console.error("Failed to load opportunities", err);
    } finally {
      setLoading(false);
    }
  }

  const handleToggleSave = async (oppId: string) => {
    try {
      const res = await fetch("/api/student/opportunities/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId: oppId }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.saved) {
          setSavedOppIds((prev) => [...prev, oppId]);
        } else {
          setSavedOppIds((prev) => prev.filter((id) => id !== oppId));
        }
      }
    } catch (err) {
      console.error("Failed to toggle saved status", err);
    }
  };

  const handleApply = async () => {
    if (!selectedOpp) return;
    if (!consentConfirmed) {
      setActionError("Please confirm student authorization consent before submitting.");
      return;
    }

    setSubmittingApp(true);
    setActionError(null);
    try {
      const res = await fetch("/api/student/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityId: selectedOpp.id,
          coverNote,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAppliedOppIds((prev) => [...prev, selectedOpp.id]);
        setActionSuccess(`Application submitted to ${selectedOpp.organizationName}!`);
        setSelectedOpp(null);
        setCoverNote("");
        setConsentConfirmed(false);
        setTimeout(() => setActionSuccess(null), 4000);
      } else {
        setActionError(data.error || "Failed to submit application.");
      }
    } catch (err: any) {
      setActionError(err.message || "Network error occurred.");
    } finally {
      setSubmittingApp(false);
    }
  };

  const handleWithdraw = async (oppId: string) => {
    if (!confirm("Are you sure you want to withdraw your application?")) return;
    try {
      const res = await fetch(`/api/student/opportunities?opportunityId=${oppId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setAppliedOppIds((prev) => prev.filter((id) => id !== oppId));
        setActionSuccess("Application withdrawn.");
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (err) {
      console.error("Failed to withdraw application", err);
    }
  };

  // If student is minor (<18 or Class 8-10), display DPDP statutory shield banner
  if (isMinor) {
    return (
      <PortalLayout
        portalName="Student Portal"
        portalRole="STUDENT"
        navItems={STUDENT_NAV}
        breadcrumbs={["Opportunities", "Legal Safeguard"]}
      >
        <div className="max-w-3xl mx-auto py-12 space-y-6">
          <Card className="border-amber-200 bg-amber-50/70 shadow-sm p-8 text-center space-y-4">
            <ShieldAlert className="h-14 w-14 text-amber-600 mx-auto" />
            <h1 className="text-xl font-bold text-slate-900">
              Statutory Child Safeguard Notice (DPDP Act 2023)
            </h1>
            <p className="text-sm text-slate-700 leading-relaxed max-w-xl mx-auto">
              In accordance with Section 9 of the <strong>Digital Personal Data Protection Act, 2023</strong> (Government of India),
              direct recruitment listings, candidate talent discovery, and employment applications are strictly restricted to adult
              jobseekers (Class 12+, ITI, Polytechnic, and College students aged 18+).
            </p>
            <p className="text-xs text-slate-600 max-w-lg mx-auto">
              Your profile is safely protected from employer recruitment visibility. Continue developing your foundational skills
              using KAABIL&apos;s educational career exploration tools!
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-3">
              <Link href="/student/mentor">
                <Button className="bg-primary hover:bg-primary/90 text-white text-xs">
                  Consult AI Career Mentor
                </Button>
              </Link>
              <Link href="/student/assessments">
                <Button variant="outline" className="border-slate-300 text-xs">
                  Practice Skill Assessments
                </Button>
              </Link>
              <Link href="/student/digital-twin">
                <Button variant="outline" className="border-slate-300 text-xs">
                  Explore Career Digital Twin
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </PortalLayout>
    );
  }

  const filteredOpportunities = opportunities.filter((opp) => {
    if (viewTab === "SAVED" && !savedOppIds.includes(opp.id)) return false;
    if (viewTab === "APPLIED" && !appliedOppIds.includes(opp.id)) return false;
    if (viewTab === "RECOMMENDED" && !recommendedMatches.some((m) => m.opportunityId === opp.id)) return false;

    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      opp.title.toLowerCase().includes(term) ||
      opp.organizationName.toLowerCase().includes(term) ||
      opp.industry.toLowerCase().includes(term) ||
      opp.requiredSkills.some((s) => s.toLowerCase().includes(term))
    );
  });

  return (
    <PortalLayout
      portalName="Student Portal"
      portalRole="STUDENT"
      navItems={STUDENT_NAV}
      breadcrumbs={["Opportunities", "Skills-First Job Discovery"]}
    >
      <div className="space-y-6 max-w-6xl mx-auto pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-primary" />
              Verified Job & Internship Opportunities
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Apply to verified employers across all 13 educational streams based on your verifiable skills.
            </p>
          </div>

          {/* Tab selector */}
          <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
            <button
              type="button"
              onClick={() => setViewTab("ALL")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                viewTab === "ALL" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Roles ({opportunities.length})
            </button>
            <button
              type="button"
              onClick={() => setViewTab("RECOMMENDED")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1 ${
                viewTab === "RECOMMENDED" ? "bg-purple-600 text-white shadow-xs" : "text-purple-700 hover:bg-purple-50"
              }`}
            >
              <Sparkles className="h-3 w-3" />
              AI Matched ({recommendedMatches.length})
            </button>
            <button
              type="button"
              onClick={() => setViewTab("APPLIED")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                viewTab === "APPLIED" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Applied ({appliedOppIds.length})
            </button>
            <button
              type="button"
              onClick={() => setViewTab("SAVED")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                viewTab === "SAVED" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Saved ({savedOppIds.length})
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardContent className="pt-4 pb-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search role, organization, or skill..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <select
                  value={streamFilter}
                  onChange={(e) => setStreamFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                >
                  <option value="ALL">All Educational Streams</option>
                  <option value="NON_MEDICAL_PCM">Engineering & Tech (PCM)</option>
                  <option value="MEDICAL_PCB">Medicine & Health (PCB)</option>
                  <option value="COMMERCE">Commerce & Finance</option>
                  <option value="ARTS_HUMANITIES">Arts & Humanities</option>
                  <option value="LAW">Law & Legal</option>
                  <option value="VOCATIONAL_TRADES">Vocational Trades</option>
                  <option value="MANAGEMENT">Management</option>
                  <option value="CREATIVE_DESIGN">Design & Media</option>
                  <option value="AGRICULTURE">Agriculture</option>
                </select>
              </div>

              <div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                >
                  <option value="ALL">All Opportunity Types</option>
                  <option value="FULL_TIME">Full-Time Positions</option>
                  <option value="INTERNSHIP">Internships</option>
                  <option value="APPRENTICESHIP">Apprenticeships</option>
                  <option value="GRADUATE_TRAINEE">Graduate Trainee</option>
                  <option value="VOCATIONAL">Vocational Craft</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {actionSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Opportunities List */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm text-slate-500">Discovering verified opportunities...</p>
          </div>
        ) : filteredOpportunities.length === 0 ? (
          <Card className="border-slate-200 shadow-sm text-center py-16 bg-white">
            <CardContent>
              <Briefcase className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-800">No Opportunities Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No active roles match your search filters. Check back soon as new verified employers post opportunities.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOpportunities.map((opp) => {
              const isApplied = appliedOppIds.includes(opp.id);
              const isSaved = savedOppIds.includes(opp.id);

              return (
                <Card
                  key={opp.id}
                  className="border-slate-200 shadow-sm bg-white hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="text-[10px] bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider"
                        >
                          {opp.opportunityType.replace(/_/g, " ")}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] border-slate-200 text-slate-600">
                          {opp.workplaceType}
                        </Badge>
                      </div>
                      <CardTitle className="text-base font-bold text-slate-900 leading-snug">
                        {opp.title}
                      </CardTitle>
                      <div className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                        <Building className="h-3.5 w-3.5 text-slate-400" />
                        {opp.organizationName}
                        <span className="text-slate-300">&bull;</span>
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {opp.city}, {opp.state}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleSave(opp.id)}
                      className={`p-1.5 rounded-lg border text-slate-400 hover:text-primary transition-colors ${
                        isSaved ? "bg-primary/10 border-primary text-primary" : "border-slate-200 bg-white"
                      }`}
                      title={isSaved ? "Saved" : "Save Opportunity"}
                    >
                      <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
                    </button>
                  </CardHeader>

                  <CardContent className="pt-3 pb-4 space-y-3 flex-1 flex flex-col justify-between text-xs">
                    <div className="space-y-2">
                      <p className="text-slate-600 line-clamp-2 leading-relaxed">{opp.description}</p>

                      {/* Required Skills Badges */}
                      {opp.requiredSkills && opp.requiredSkills.length > 0 && (
                        <div>
                          <div className="text-[11px] font-semibold text-slate-500 mb-1">Target Skills:</div>
                          <div className="flex flex-wrap gap-1">
                            {opp.requiredSkills.map((sk, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-[10px] bg-slate-50 text-slate-700 border-slate-200"
                              >
                                {sk}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Compensation */}
                      <div className="text-slate-700 font-semibold pt-1">
                        {opp.compensation?.isDisclosed ? (
                          opp.opportunityType === "INTERNSHIP" ? (
                            <span>Stipend: ₹{opp.compensation.stipendMonthly?.toLocaleString("en-IN")}/mo</span>
                          ) : (
                            <span>
                              CTC: ₹{opp.compensation.minSalary} - ₹{opp.compensation.maxSalary} LPA
                            </span>
                          )
                        ) : (
                          <span className="text-slate-500 font-normal italic">
                            Compensation: Competitive / Skill Commensurate
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="text-[11px] text-slate-400">
                        Deadline: {new Date(opp.deadline).toLocaleDateString("en-IN")}
                      </div>

                      {isApplied ? (
                        <div className="flex items-center gap-2">
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs flex items-center gap-1">
                            <Check className="h-3 w-3" /> Applied
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleWithdraw(opp.id)}
                            className="text-xs h-7 text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2"
                          >
                            Withdraw
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedOpp(opp);
                            setConsentConfirmed(false);
                            setActionError(null);
                          }}
                          className="bg-primary hover:bg-primary/90 text-white text-xs h-8 px-3"
                        >
                          Apply Now
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Application Confirmation Modal with DPDP Consent */}
        {selectedOpp && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in-50 zoom-in-95">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Apply to {selectedOpp.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedOpp.organizationName}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOpp(null)}
                  className="text-slate-400 hover:text-slate-700 text-lg leading-none p-1"
                >
                  &times;
                </button>
              </div>

              {actionError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{actionError}</span>
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Candidate Cover Note / Statement of Purpose (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe how your verified skills and academic projects make you an exceptional fit for this role..."
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* DPDP Consent Checkbox */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="dpdp-consent"
                      checked={consentConfirmed}
                      onChange={(e) => setConsentConfirmed(e.target.checked)}
                      className="mt-0.5 rounded text-primary focus:ring-primary"
                    />
                    <label htmlFor="dpdp-consent" className="text-[11px] text-slate-700 cursor-pointer leading-relaxed">
                      <strong>Voluntary Data Sharing Consent (DPDP Act 2023):</strong> I hereby authorize KAABIL to share
                      my verified skill credentials, educational stream, and career readiness scores with the authorized
                      recruiting team at <strong>{selectedOpp.organizationName}</strong> solely for evaluating this application.
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedOpp(null)}
                    className="border-slate-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleApply}
                    disabled={submittingApp || !consentConfirmed}
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    {submittingApp ? "Submitting..." : "Confirm & Submit Application"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
