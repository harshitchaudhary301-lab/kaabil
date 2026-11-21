"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  Plus,
  Users,
  Calendar,
  Building,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Search,
  Filter,
  X,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Award,
  Layers,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { INSTITUTION_NAV } from "@/components/institution/institution-nav";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PlacementDriveRecord,
  PlacementApplicationRecord,
} from "@/types/institution";
import { EducationalStream, EducationStage } from "@/types";

const STREAMS_LIST: { label: string; value: EducationalStream }[] = [
  { label: "Engineering & Tech (PCM)", value: "NON_MEDICAL_PCM" },
  { label: "Medicine & Life Sciences (PCB)", value: "MEDICAL_PCB" },
  { label: "Commerce & Finance", value: "COMMERCE" },
  { label: "Arts & Humanities", value: "ARTS_HUMANITIES" },
  { label: "Legal & Judiciary", value: "LAW" },
  { label: "Vocational Trades & ITI", value: "VOCATIONAL_TRADES" },
  { label: "Design & Creative Media", value: "CREATIVE_DESIGN" },
  { label: "Agriculture & Allied", value: "AGRICULTURE" },
];

export default function InstitutionPlacementsPage() {
  const [drives, setDrives] = useState<PlacementDriveRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [companyName, setCompanyName] = useState<string>("");
  const [driveTitle, setDriveTitle] = useState<string>("");
  const [roleType, setRoleType] = useState<"FULL_TIME" | "INTERNSHIP" | "APPRENTICESHIP">("FULL_TIME");
  const [selectedStreams, setSelectedStreams] = useState<EducationalStream[]>(["NON_MEDICAL_PCM"]);
  const [minStage, setMinStage] = useState<EducationStage>("UNDERGRADUATE");
  const [minCRI, setMinCRI] = useState<string>("60");
  const [requiredSkillsInput, setRequiredSkillsInput] = useState<string>("");
  const [packageLPA, setPackageLPA] = useState<string>("");
  const [stipendMonthly, setStipendMonthly] = useState<string>("");
  const [driveDate, setDriveDate] = useState<string>("");
  const [venueOrLink, setVenueOrLink] = useState<string>("Campus Placement Auditorium / Online");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Applications Drawer State
  const [activeDrive, setActiveDrive] = useState<PlacementDriveRecord | null>(null);
  const [applications, setApplications] = useState<PlacementApplicationRecord[]>([]);
  const [loadingApps, setLoadingApps] = useState<boolean>(false);
  const [isAppsDrawerOpen, setIsAppsDrawerOpen] = useState<boolean>(false);

  // Action status state
  const [actionSlot, setActionSlot] = useState<string>("");
  const [actionOffer, setActionOffer] = useState<string>("");
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  useEffect(() => {
    fetchDrives();
  }, [statusFilter]);

  async function fetchDrives() {
    setLoading(true);
    setError(null);
    try {
      const url =
        statusFilter === "ALL"
          ? "/api/institution/placements/drives"
          : `/api/institution/placements/drives?status=${statusFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setDrives(data.drives || []);
      } else {
        setError(data.error || "Failed to load placement drives");
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect to placement service");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateDrive(e: React.FormEvent) {
    e.preventDefault();
    if (!companyName || !driveTitle || !driveDate) return;

    setIsSubmitting(true);
    try {
      const skills = requiredSkillsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch("/api/institution/placements/drives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          driveTitle,
          roleType,
          streams: selectedStreams,
          minStage,
          minCRI: minCRI ? Number(minCRI) : undefined,
          requiredSkills: skills,
          packageLPA: packageLPA || undefined,
          stipendMonthly: stipendMonthly || undefined,
          driveDate,
          venueOrLink,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsCreateModalOpen(false);
        resetForm();
        fetchDrives();
      } else {
        alert(data.error || "Failed to create drive");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetForm() {
    setCompanyName("");
    setDriveTitle("");
    setRoleType("FULL_TIME");
    setSelectedStreams(["NON_MEDICAL_PCM"]);
    setMinStage("UNDERGRADUATE");
    setMinCRI("60");
    setRequiredSkillsInput("");
    setPackageLPA("");
    setStipendMonthly("");
    setDriveDate("");
    setVenueOrLink("Campus Placement Auditorium / Online");
  }

  async function openApplicationsDrawer(drive: PlacementDriveRecord) {
    setActiveDrive(drive);
    setIsAppsDrawerOpen(true);
    setLoadingApps(true);
    try {
      const res = await fetch(`/api/institution/placements/applications?driveId=${drive.id}`);
      const data = await res.json();
      if (data.success) {
        setApplications(data.applications || []);
      }
    } catch (err) {
      console.error("Failed to load applications", err);
    } finally {
      setLoadingApps(false);
    }
  }

  async function handleUpdateAppStatus(
    appId: string,
    newStatus: PlacementApplicationRecord["status"]
  ) {
    if (!activeDrive) return;
    try {
      const res = await fetch("/api/institution/placements/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_STATUS",
          driveId: activeDrive.id,
          applicationId: appId,
          status: newStatus,
          interviewSlot: actionSlot || undefined,
          offerDetails: actionOffer || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedAppId(null);
        setActionSlot("");
        setActionOffer("");
        // Refresh apps & drives
        openApplicationsDrawer(activeDrive);
        fetchDrives();
      } else {
        alert(data.error || "Failed to update application");
      }
    } catch (err: any) {
      alert(err.message || "Failed to update application");
    }
  }

  const filteredDrives = drives.filter((d) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      d.companyName.toLowerCase().includes(term) ||
      d.driveTitle.toLowerCase().includes(term) ||
      d.requiredSkills.some((s) => s.toLowerCase().includes(term))
    );
  });

  return (
    <PortalLayout
      portalName="Institution Portal"
      portalRole="INSTITUTION"
      navItems={INSTITUTION_NAV}
      breadcrumbs={["Institution", "Campus Placements"]}
    >
      <div className="space-y-6">
        {/* Header with Title and Schedule Action */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Briefcase className="w-7 h-7 text-[#4169E1]" />
              Campus Placements & Opportunity Matching
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Multi-stream recruitment drives, skill-verified eligibility, and adult career matching.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#4169E1] hover:bg-blue-700 text-white gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Schedule Placement Drive
            </Button>
          </div>
        </div>

        {/* DPDP Act 2023 Minor Protection Shield Banner */}
        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <strong className="font-semibold block text-amber-950 mb-0.5">
              DPDP Act (2023) Statutory Safeguard: Minor (&lt;18) Account Shielding
            </strong>
            In compliance with India&apos;s Digital Personal Data Protection Act, 2023, school students (Class 8–10 or age &lt;18)
            are strictly shielded from commercial recruitment drives and corporate talent discovery. Secondary school students participate exclusively
            in academic stream exploration and developmental skill workshops.
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 rounded-xl border border-slate-200">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search companies, drives, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4169E1]/20 focus:border-[#4169E1]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-600 font-medium">Status:</span>
            <div className="flex gap-1">
              {["ALL", "SCHEDULED", "ACTIVE", "COMPLETED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                    statusFilter === st
                      ? "bg-[#4169E1] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Placement Drives Grid */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
            <div className="animate-spin w-8 h-8 border-4 border-[#4169E1] border-t-transparent rounded-full mx-auto mb-3"></div>
            Loading placement drives...
          </div>
        ) : filteredDrives.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
            <Building className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No recruitment drives found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Schedule your institution&apos;s first campus recruitment or internship drive to match verified students with industry partners.
            </p>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 bg-[#4169E1] text-white text-xs"
            >
              Schedule Drive
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDrives.map((drive) => (
              <Card
                key={drive.id}
                className="hover:shadow-md transition-shadow border-slate-200 flex flex-col justify-between"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-[#4169E1] text-base">
                        {drive.companyName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-semibold text-slate-900 text-sm">{drive.companyName}</h3>
                          {drive.isVerifiedPartner && (
                            <span title="Verified Industry Partner">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{drive.driveTitle}</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-2 py-0.5 capitalize ${
                        drive.status === "SCHEDULED"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : drive.status === "ACTIVE" || drive.status === "IN_PROGRESS"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {drive.status.toLowerCase()}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  {/* Meta pills */}
                  <div className="flex flex-wrap gap-2 text-[11px] text-slate-600">
                    <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">
                      {drive.roleType.replace("_", " ")}
                    </span>
                    {drive.packageLPA && (
                      <span className="bg-emerald-50 text-emerald-700 font-medium px-2 py-0.5 rounded">
                        ₹{drive.packageLPA} LPA
                      </span>
                    )}
                    {drive.stipendMonthly && (
                      <span className="bg-purple-50 text-purple-700 font-medium px-2 py-0.5 rounded">
                        ₹{drive.stipendMonthly}/mo
                      </span>
                    )}
                    <span className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-slate-500">
                      Min CRI: {drive.minCRI || 50}+
                    </span>
                  </div>

                  {/* Target Streams */}
                  <div>
                    <span className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Target Disciplinary Streams:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {drive.streams.map((s) => (
                        <span
                          key={s}
                          className="text-[10px] bg-blue-50/70 text-blue-700 border border-blue-100 px-1.5 py-0.5 rounded"
                        >
                          {s.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Required Skills */}
                  {drive.requiredSkills.length > 0 && (
                    <div>
                      <span className="text-[11px] font-semibold text-slate-700 block mb-1">
                        Required Verified Skills:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {drive.requiredSkills.map((sk) => (
                          <span
                            key={sk}
                            className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Drive Date & Venue */}
                  <div className="text-xs text-slate-500 space-y-1 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Drive Date: {drive.driveDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Deadline: {drive.deadline}</span>
                    </div>
                  </div>

                  {/* Pipeline Counters & Action */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-600">
                        <strong className="text-slate-900 font-semibold">{drive.totalApplicants || 0}</strong> Applicants
                      </span>
                      <span className="text-emerald-700">
                        <strong className="font-semibold">{drive.offeredCount || 0}</strong> Offers
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openApplicationsDrawer(drive)}
                      className="text-xs border-[#4169E1] text-[#4169E1] hover:bg-blue-50 gap-1 h-8"
                    >
                      Pipeline <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Schedule Placement Drive Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-xl max-h-[90vh] overflow-y-auto">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[#4169E1]" />
                  <h3 className="font-semibold text-slate-900 text-base">Schedule Campus Placement Drive</h3>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateDrive} className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Company Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tata Consultancy Services, Apollo Hospitals"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#4169E1]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Drive / Role Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Associate Software Engineer, Clinical Trainee"
                      value={driveTitle}
                      onChange={(e) => setDriveTitle(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#4169E1]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Role Type</label>
                    <select
                      value={roleType}
                      onChange={(e) => setRoleType(e.target.value as any)}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white"
                    >
                      <option value="FULL_TIME">Full Time</option>
                      <option value="INTERNSHIP">Internship</option>
                      <option value="APPRENTICESHIP">Apprenticeship</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Min Academic Stage</label>
                    <select
                      value={minStage}
                      onChange={(e) => setMinStage(e.target.value as any)}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white"
                    >
                      <option value="UNDERGRADUATE">Undergraduate (UG)</option>
                      <option value="POSTGRADUATE">Postgraduate (PG)</option>
                      <option value="DIPLOMA">Diploma</option>
                      <option value="ITI">ITI / Vocational</option>
                      <option value="CLASS_12">Class 12 (Eligible Adults)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Min CRI Score (0-100)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="e.g. 60"
                      value={minCRI}
                      onChange={(e) => setMinCRI(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                {/* Target Streams Multi-Select */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Target Disciplinary Streams
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                    {STREAMS_LIST.map((st) => (
                      <label key={st.value} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedStreams.includes(st.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStreams([...selectedStreams, st.value]);
                            } else {
                              if (selectedStreams.length > 1) {
                                setSelectedStreams(selectedStreams.filter((s) => s !== st.value));
                              }
                            }
                          }}
                          className="rounded text-[#4169E1]"
                        />
                        <span className="text-[11px] text-slate-700">{st.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Required Verified Skills (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Python, SQL, Financial Modeling, Clinical Pharmacology"
                    value={requiredSkillsInput}
                    onChange={(e) => setRequiredSkillsInput(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Package (LPA)</label>
                    <input
                      type="text"
                      placeholder="e.g. 6.5 - 9.0"
                      value={packageLPA}
                      onChange={(e) => setPackageLPA(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Stipend (₹/month if internship)</label>
                    <input
                      type="text"
                      placeholder="e.g. 25,000"
                      value={stipendMonthly}
                      onChange={(e) => setStipendMonthly(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Drive Date *</label>
                    <input
                      type="date"
                      required
                      value={driveDate}
                      onChange={(e) => setDriveDate(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Venue or Online Link</label>
                    <input
                      type="text"
                      value={venueOrLink}
                      onChange={(e) => setVenueOrLink(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#4169E1] text-white text-xs"
                  >
                    {isSubmitting ? "Scheduling..." : "Confirm Drive"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Applicant Pipeline Drawer */}
        {isAppsDrawerOpen && activeDrive && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end">
            <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900 text-base">{activeDrive.companyName}</h3>
                    <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700">
                      {activeDrive.driveTitle}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Applicant Pipeline & Explainable Eligibility Verification
                  </p>
                </div>
                <button
                  onClick={() => setIsAppsDrawerOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {loadingApps ? (
                  <div className="p-8 text-center text-slate-500">
                    <div className="animate-spin w-6 h-6 border-2 border-[#4169E1] border-t-transparent rounded-full mx-auto mb-2"></div>
                    Loading candidate records...
                  </div>
                ) : applications.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                    <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs text-slate-600 font-medium">No candidates currently in the pipeline.</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Students matching stream and verified competency criteria will appear here.
                    </p>
                  </div>
                ) : (
                  applications.map((app) => (
                    <div
                      key={app.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 text-sm">{app.studentName}</span>
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-2 py-0.5 font-medium ${
                                app.status === "OFFERED"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : app.status === "SHORTLISTED" || app.status === "INTERVIEW_SCHEDULED"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : app.status === "REJECTED"
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : "bg-slate-100 text-slate-700 border-slate-200"
                              }`}
                            >
                              {app.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {app.studentEmail} • {app.stream.replace(/_/g, " ")}
                          </p>
                        </div>

                        {/* Explainable Eligibility Badge */}
                        <div>
                          {app.eligibilityCheck.isEligible ? (
                            <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-700 font-medium px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> Eligible
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] bg-amber-50 text-amber-700 font-medium px-2 py-0.5 rounded border border-amber-200">
                              <AlertCircle className="w-3 h-3" /> Criteria Gap
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Reasons & Requirements Breakdown */}
                      <div className="p-2.5 bg-slate-50 rounded-lg text-[11px] text-slate-600 space-y-1">
                        {app.eligibilityCheck.reasons.map((r, i) => (
                          <div key={i} className="flex items-start gap-1.5">
                            <span className="text-slate-400">•</span>
                            <span>{r}</span>
                          </div>
                        ))}
                        {app.eligibilityCheck.missingRequirements.length > 0 && (
                          <div className="pt-1 text-amber-700 font-medium">
                            Missing: {app.eligibilityCheck.missingRequirements.join(", ")}
                          </div>
                        )}
                        {app.interviewSlot && (
                          <div className="pt-1 text-blue-700 font-medium">
                            Interview Slot: {app.interviewSlot}
                          </div>
                        )}
                        {app.offerDetails && (
                          <div className="pt-1 text-emerald-700 font-medium">
                            Offer Details: {app.offerDetails}
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                        {selectedAppId === app.id ? (
                          <div className="w-full space-y-2 pt-2">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Interview slot or Offer details..."
                                value={actionSlot || actionOffer}
                                onChange={(e) => {
                                  setActionSlot(e.target.value);
                                  setActionOffer(e.target.value);
                                }}
                                className="flex-1 text-xs p-1.5 border border-slate-200 rounded"
                              />
                            </div>
                            <div className="flex justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedAppId(null)}
                                className="text-[11px] h-7"
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleUpdateAppStatus(app.id, "INTERVIEW_SCHEDULED")}
                                className="text-[11px] h-7 bg-blue-600 text-white"
                              >
                                Schedule Interview
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleUpdateAppStatus(app.id, "OFFERED")}
                                className="text-[11px] h-7 bg-emerald-600 text-white"
                              >
                                Record Offer
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateAppStatus(app.id, "SHORTLISTED")}
                              className="text-[11px] h-7 text-slate-700"
                            >
                              Shortlist
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedAppId(app.id)}
                              className="text-[11px] h-7 border-[#4169E1] text-[#4169E1]"
                            >
                              Advance / Offer
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateAppStatus(app.id, "REJECTED")}
                              className="text-[11px] h-7 text-rose-600 border-rose-200 hover:bg-rose-50"
                            >
                              Archive
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
