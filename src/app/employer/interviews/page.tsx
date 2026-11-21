"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  Clock,
  User,
  Video,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PlusCircle,
  FileText,
  Star,
  ChevronRight,
  Filter,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { EMPLOYER_NAV } from "@/components/employer/employer-nav";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InterviewRecord, InterviewType, InterviewStatus, EmployerJobApplicationRecord } from "@/types/employer";

export default function EmployerInterviewsPage() {
  const [interviews, setInterviews] = useState<InterviewRecord[]>([]);
  const [applications, setApplications] = useState<EmployerJobApplicationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modals state
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [scheduleForm, setScheduleForm] = useState({
    applicationId: "",
    interviewType: "TECHNICAL" as InterviewType,
    scheduledDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    startTime: "11:00",
    durationMinutes: 45,
    venueOrMeetingLink: "https://meet.google.com/xyz-kaabil-rec",
    notes: "",
  });

  const [evaluationModalInterview, setEvaluationModalInterview] = useState<InterviewRecord | null>(null);
  const [evalScores, setEvalScores] = useState({
    technicalCompetency: 4,
    domainKnowledge: 4,
    problemSolving: 4,
    communication: 4,
  });
  const [evalRecommendation, setEvalRecommendation] = useState<"STRONG_YES" | "YES" | "NEUTRAL" | "NO">("YES");
  const [evalNotes, setEvalNotes] = useState<string>("");

  useEffect(() => {
    fetchInterviews();
    fetchApplications();
  }, [statusFilter]);

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      let url = "/api/employer/interviews?";
      if (statusFilter !== "ALL") url += `status=${statusFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setInterviews(data.interviews || []);
      }
    } catch (err) {
      console.error("Failed to load interviews", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/employer/applications");
      const data = await res.json();
      if (data.success && data.applications?.length > 0) {
        setApplications(data.applications);
        setScheduleForm((prev) => ({ ...prev, applicationId: data.applications[0].id }));
      }
    } catch (err) {
      console.error("Failed to load applications", err);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/employer/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scheduleForm),
      });
      const data = await res.json();
      if (data.success) {
        setShowScheduleModal(false);
        fetchInterviews();
      }
    } catch (err) {
      console.error("Failed to schedule interview", err);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluationModalInterview) return;
    try {
      const res = await fetch("/api/employer/interviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "FEEDBACK",
          interviewId: evaluationModalInterview.id,
          rubricScores: evalScores,
          recommendation: evalRecommendation,
          feedbackNotes: evalNotes || "Candidate showed strong practical execution and communication skills.",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEvaluationModalInterview(null);
        fetchInterviews();
      }
    } catch (err) {
      console.error("Failed to submit feedback", err);
    }
  };

  return (
    <PortalLayout
      portalName="Employer Portal"
      portalRole="EMPLOYER"
      navItems={EMPLOYER_NAV}
      breadcrumbs={["Employer", "Interview Hub"]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Interview Hub & Structured Rubrics</h1>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">ATS Integrated</Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Schedule candidate interviews, record 1–5 competency rubric scores, and synchronize outcomes with ATS pipeline.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2 font-medium text-sm"
              onClick={() => setShowScheduleModal(true)}
            >
              <PlusCircle className="h-4 w-4" />
              Schedule Interview
            </Button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          {[
            { id: "ALL", label: `All Interviews (${interviews.length})` },
            { id: "SCHEDULED", label: `Scheduled (${interviews.filter((i) => i.status === "SCHEDULED").length})` },
            { id: "COMPLETED", label: `Completed (${interviews.filter((i) => i.status === "COMPLETED").length})` },
            { id: "CANCELLED", label: `Cancelled (${interviews.filter((i) => i.status === "CANCELLED").length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                statusFilter === tab.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Interviews List */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Loading interview schedules...</div>
        ) : interviews.length === 0 ? (
          <Card className="border-slate-200 p-8 text-center">
            <CardContent className="space-y-3">
              <CalendarCheck className="h-10 w-10 text-slate-300 mx-auto" />
              <h3 className="font-semibold text-slate-800">No interviews found</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                No interviews match this filter. You can schedule an interview directly for shortlisted candidates.
              </p>
              <Button
                onClick={() => setShowScheduleModal(true)}
                className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs"
              >
                Schedule New Interview
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {interviews.map((intv) => (
              <Card
                key={intv.id}
                className="border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-bold text-slate-900 text-base">{intv.candidateName}</h3>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] font-bold uppercase ${
                          intv.status === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-800"
                            : intv.status === "SCHEDULED"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {intv.status}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] bg-white border-slate-200">
                        {intv.interviewType.replace(/_/g, " ")}
                      </Badge>
                    </div>

                    <div className="text-xs text-slate-600">
                      Opportunity: <span className="font-semibold text-slate-800">{intv.opportunityTitle}</span> • Recruiter:{" "}
                      <span className="font-medium text-slate-700">{intv.recruiterName}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-blue-600" />
                        <span>
                          {intv.scheduledDate} at {intv.startTime} ({intv.durationMinutes} mins)
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-blue-600">
                        <Video className="h-3.5 w-3.5" />
                        <a href={intv.venueOrMeetingLink} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {intv.venueOrMeetingLink}
                        </a>
                      </div>
                    </div>

                    {intv.rubricScores && (
                      <div className="pt-2 border-t border-slate-100 flex items-center gap-3 text-xs">
                        <span className="font-semibold text-slate-700">Rubric Scores:</span>
                        <span className="text-slate-600">Tech: {intv.rubricScores.technicalCompetency}/5</span>
                        <span className="text-slate-600">Domain: {intv.rubricScores.domainKnowledge}/5</span>
                        <span className="text-slate-600">Solving: {intv.rubricScores.problemSolving}/5</span>
                        <span className="text-slate-600">Comm: {intv.rubricScores.communication}/5</span>
                        <Badge className="bg-purple-100 text-purple-800 border-purple-200 font-bold ml-2">
                          Rec: {intv.recommendation}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {intv.status === "SCHEDULED" && (
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5"
                        onClick={() => setEvaluationModalInterview(intv)}
                      >
                        <FileText className="h-3.5 w-3.5" />
                        Evaluate Rubric
                      </Button>
                    )}
                    <Link href={`/employer/applications`}>
                      <Button variant="outline" size="sm" className="text-xs border-slate-300">
                        ATS Record
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Schedule Interview Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
              <div className="flex items-start justify-between border-b pb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Schedule Candidate Interview</h3>
                  <p className="text-xs text-slate-500">Select candidate application and session details</p>
                </div>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleScheduleSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Candidate Application</label>
                  <select
                    value={scheduleForm.applicationId}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, applicationId: e.target.value })}
                    className="w-full rounded-md border-slate-300 py-2 pl-3 text-xs focus:ring-blue-500"
                    required
                  >
                    {applications.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.studentName} — {app.opportunityTitle} ({app.stage})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Interview Round</label>
                    <select
                      value={scheduleForm.interviewType}
                      onChange={(e) =>
                        setScheduleForm({ ...scheduleForm, interviewType: e.target.value as InterviewType })
                      }
                      className="w-full rounded-md border-slate-300 py-2 pl-3 text-xs focus:ring-blue-500"
                    >
                      <option value="TECHNICAL">Technical Round</option>
                      <option value="HR_FIT">HR & Behavioral Fit</option>
                      <option value="CASE_STUDY">Case Study / Clinical</option>
                      <option value="FINAL_ROUND">Final Leadership Round</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Duration (Minutes)</label>
                    <input
                      type="number"
                      value={scheduleForm.durationMinutes}
                      onChange={(e) =>
                        setScheduleForm({ ...scheduleForm, durationMinutes: parseInt(e.target.value) })
                      }
                      className="w-full p-2 rounded-md border border-slate-300 text-xs focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Scheduled Date</label>
                    <input
                      type="date"
                      value={scheduleForm.scheduledDate}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledDate: e.target.value })}
                      className="w-full p-2 rounded-md border border-slate-300 text-xs focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Start Time</label>
                    <input
                      type="time"
                      value={scheduleForm.startTime}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                      className="w-full p-2 rounded-md border border-slate-300 text-xs focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Video Link or Venue</label>
                  <input
                    type="text"
                    value={scheduleForm.venueOrMeetingLink}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, venueOrMeetingLink: e.target.value })}
                    className="w-full p-2 rounded-md border border-slate-300 text-xs focus:ring-blue-500 font-mono"
                    required
                  />
                </div>

                <div className="pt-3 border-t flex justify-end gap-2">
                  <Button variant="outline" size="sm" type="button" onClick={() => setShowScheduleModal(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                    Confirm & Sync ATS
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Evaluation Rubric Modal */}
        {evaluationModalInterview && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
              <div className="flex items-start justify-between border-b pb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Rubric Evaluation: {evaluationModalInterview.candidateName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Rate candidate on 1–5 structured competency scale
                  </p>
                </div>
                <button
                  onClick={() => setEvaluationModalInterview(null)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-xs">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-slate-700">Technical / Clinical Competency (1–5)</span>
                      <span className="font-bold text-blue-600">{evalScores.technicalCompetency}/5</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={evalScores.technicalCompetency}
                      onChange={(e) =>
                        setEvalScores({ ...evalScores, technicalCompetency: parseInt(e.target.value) })
                      }
                      className="w-full accent-blue-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-slate-700">Domain & Methodology Knowledge (1–5)</span>
                      <span className="font-bold text-blue-600">{evalScores.domainKnowledge}/5</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={evalScores.domainKnowledge}
                      onChange={(e) =>
                        setEvalScores({ ...evalScores, domainKnowledge: parseInt(e.target.value) })
                      }
                      className="w-full accent-blue-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-slate-700">Problem Solving & Reasoning (1–5)</span>
                      <span className="font-bold text-blue-600">{evalScores.problemSolving}/5</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={evalScores.problemSolving}
                      onChange={(e) =>
                        setEvalScores({ ...evalScores, problemSolving: parseInt(e.target.value) })
                      }
                      className="w-full accent-blue-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-slate-700">Communication & Team Collaboration (1–5)</span>
                      <span className="font-bold text-blue-600">{evalScores.communication}/5</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={evalScores.communication}
                      onChange={(e) =>
                        setEvalScores({ ...evalScores, communication: parseInt(e.target.value) })
                      }
                      className="w-full accent-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Hiring Recommendation</label>
                  <select
                    value={evalRecommendation}
                    onChange={(e) =>
                      setEvalRecommendation(e.target.value as "STRONG_YES" | "YES" | "NEUTRAL" | "NO")
                    }
                    className="w-full rounded-md border-slate-300 py-2 pl-3 text-xs focus:ring-blue-500 font-semibold"
                  >
                    <option value="STRONG_YES">Strong Yes (Exceptional candidate)</option>
                    <option value="YES">Yes (Meets requirements well)</option>
                    <option value="NEUTRAL">Neutral (More data needed)</option>
                    <option value="NO">No (Does not meet benchmark)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Recruiter Notes & Feedback</label>
                  <textarea
                    rows={3}
                    value={evalNotes}
                    onChange={(e) => setEvalNotes(e.target.value)}
                    placeholder="Candidate demonstrated deep clinical knowledge during the case review..."
                    className="w-full p-2.5 rounded-md border-slate-300 text-xs focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="pt-3 border-t flex justify-end gap-2">
                  <Button variant="outline" size="sm" type="button" onClick={() => setEvaluationModalInterview(null)}>
                    Cancel
                  </Button>
                  <Button size="sm" type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    Submit Feedback & Complete Round
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
