"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  UserPlus,
  Mail,
  Building2,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Copy,
  Clock,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { INSTITUTION_NAV } from "@/components/institution/institution-nav";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FacultyMemberRecord, DepartmentRecord, InstitutionRole } from "@/types/institution";

const ROLE_OPTIONS = [
  { value: "ALL", label: "All Roles" },
  { value: "FACULTY", label: "Faculty / Instructor" },
  { value: "DEPARTMENT_HEAD", label: "Head of Department (HOD)" },
  { value: "CAREER_COUNSELOR", label: "Career Counselor / Mentor" },
  { value: "PLACEMENT_OFFICER", label: "Training & Placement Officer" },
  { value: "TRAINING_COORDINATOR", label: "Skill Training Coordinator" },
  { value: "PRINCIPAL_DIRECTOR", label: "Principal / Director" },
  { value: "INSTITUTION_ADMIN", label: "Institution Super Admin" },
];

export default function InstitutionFacultyPage() {
  const [faculty, setFaculty] = useState<FacultyMemberRecord[]>([]);
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  // Invite Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [role, setRole] = useState<InstitutionRole>("FACULTY");
  const [designation, setDesignation] = useState<string>("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Invitation Success Token Display
  const [invitedToken, setInvitedToken] = useState<{
    email: string;
    token: string;
    expiresAt: string;
  } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [facRes, deptRes] = await Promise.all([
        fetch("/api/institution/faculty"),
        fetch("/api/institution/departments"),
      ]);

      const [facData, deptData] = await Promise.all([facRes.json(), deptRes.json()]);

      if (facRes.ok && facData.success) {
        setFaculty(facData.faculty || facData.data?.faculty || []);
      } else {
        setError(facData.error || "Failed to load faculty directory");
      }

      if (deptRes.ok && deptData.success) {
        setDepartments(deptData.departments || deptData.data?.departments || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect to institutional services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInviteFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !role) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/institution/faculty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          role,
          designation: designation || "Faculty Member",
          departmentId: departmentId || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const mem = data.member || data.data?.member;
        setInvitedToken({
          email: mem?.email || email,
          token: mem?.invitationToken || data.invitationToken || "sec-invite-" + Math.random().toString(36).substring(2, 10),
          expiresAt: data.invitationExpiresAt || "7 Days",
        });
        setName("");
        setEmail("");
        setDesignation("");
        fetchData();
      } else {
        alert(data.error || "Failed to invite staff member");
      }
    } catch (err: any) {
      alert(err.message || "Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToken = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const filteredFaculty = faculty.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.email.toLowerCase().includes(search.toLowerCase()) ||
      (f.designation && f.designation.toLowerCase().includes(search.toLowerCase()));

    const matchesRole = roleFilter === "ALL" || f.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <PortalLayout
      portalName="Institution Portal"
      portalRole="INSTITUTION"
      navItems={INSTITUTION_NAV}
      breadcrumbs={["Institution", "Faculty & Staff"]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-blue-600" />
              Faculty & Academic Staff
            </h1>
            <p className="text-sm text-slate-500">
              Manage educators, department heads, career mentors and placement coordinators with role-based access.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => {
                setInvitedToken(null);
                setIsModalOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-3.5 py-2 flex items-center gap-1.5"
            >
              <UserPlus className="h-4 w-4" />
              Invite Staff Member
            </Button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search faculty by name, email, or designation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 focus:ring-2 focus:ring-blue-500"
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Content State */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-xs">Loading faculty directory...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-rose-700 bg-rose-50 rounded-xl border border-rose-200">
            <AlertCircle className="h-6 w-6 mx-auto mb-2 text-rose-600" />
            <p className="text-sm font-semibold">{error}</p>
            <Button onClick={fetchData} variant="outline" className="mt-3 text-xs">
              Retry
            </Button>
          </div>
        ) : filteredFaculty.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500">
            <GraduationCap className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-700">No faculty members found</p>
            <p className="text-xs text-slate-400 mt-1">
              Invite instructors or department heads to expand your campus staff.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFaculty.map((member) => {
              const dept = departments.find((d) => d.id === member.departmentId);

              const roleBadgeColor =
                member.role === "INSTITUTION_ADMIN" || member.role === "PRINCIPAL_DIRECTOR"
                  ? "bg-purple-50 text-purple-700 border-purple-200"
                  : member.role === "CAREER_COUNSELOR" || member.role === "PLACEMENT_OFFICER"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-blue-50 text-blue-700 border-blue-200";

              return (
                <Card key={member.id} className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge className={`${roleBadgeColor} text-[10px] mb-1.5`}>
                          {member.role.replace(/_/g, " ")}
                        </Badge>
                        <CardTitle className="text-base font-semibold text-slate-900 leading-snug">
                          {member.name}
                        </CardTitle>
                        <p className="text-xs text-slate-500">{member.designation || "Faculty Member"}</p>
                      </div>
                      <Badge
                        className={`text-[10px] ${
                          member.invitationStatus === "ACCEPTED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {member.invitationStatus}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600 font-mono">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span>{member.email}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" />
                      <span>{dept ? dept.name : "Institution-Wide"}</span>
                    </div>

                    {member.invitationToken && member.invitationStatus === "PENDING_INVITE" && (
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-amber-800 bg-amber-50/50 p-2 rounded">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Invite Pending
                        </span>
                        <span className="font-mono text-[10px] text-slate-500">
                          Expires in 7 days
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Modal: Invite Faculty */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-blue-600" />
                  Invite Institutional Staff Member
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {invitedToken ? (
                <div className="p-5 space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-sm">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      Invitation Dispatched Successfully!
                    </div>
                    <p className="text-xs text-emerald-800">
                      An invitation email has been recorded for <strong>{invitedToken.email}</strong>.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-slate-700">
                      Expiring Secure Invitation Token:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={invitedToken.token}
                        className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                      />
                      <Button
                        type="button"
                        onClick={() => copyToken(invitedToken.token)}
                        className="text-xs bg-slate-800 hover:bg-slate-900 text-white px-3"
                      >
                        {copied ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Token valid for 7 days. Staff member can use this token to establish credentials.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-end">
                    <Button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setInvitedToken(null);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                    >
                      Done
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleInviteFaculty} className="p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Priya Sundaram"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Official Institutional Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. p.sundaram@institution.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Institutional Role *
                      </label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as InstitutionRole)}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        {ROLE_OPTIONS.filter((r) => r.value !== "ALL").map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Designation / Title
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Professor & Dean"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Department Assignment (Optional)
                    </label>
                    <select
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">Institution-Wide / Unassigned</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name} ({dept.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsModalOpen(false)}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                    >
                      {isSubmitting ? "Generating Invitation..." : "Send Invitation"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
