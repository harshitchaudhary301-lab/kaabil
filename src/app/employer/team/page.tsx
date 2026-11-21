"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Mail,
  ShieldCheck,
  UserPlus,
  Trash2,
  X,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { EMPLOYER_NAV } from "@/components/employer/employer-nav";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmployerMemberRecord, EmployerRole } from "@/types/employer";

export default function EmployerTeamPage() {
  const [members, setMembers] = useState<EmployerMemberRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isInviteOpen, setIsInviteOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [role, setRole] = useState<EmployerRole>("RECRUITER");
  const [title, setTitle] = useState<string>("");
  const [department, setDepartment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    setLoading(true);
    try {
      const res = await fetch("/api/employer/team");
      const data = await res.json();
      if (data.success) {
        setMembers(data.members || []);
      }
    } catch (err) {
      console.error("Failed to load team members", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !title) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/employer/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role, title, department }),
      });
      const data = await res.json();
      if (data.success) {
        setIsInviteOpen(false);
        resetForm();
        fetchMembers();
      } else {
        alert(data.error || "Failed to invite member");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetForm() {
    setName("");
    setEmail("");
    setRole("RECRUITER");
    setTitle("");
    setDepartment("");
  }

  async function handleRemove(memberId: string) {
    if (!confirm("Are you sure you want to revoke this staff member's access?")) return;
    try {
      const res = await fetch(`/api/employer/team?memberId=${memberId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        fetchMembers();
      }
    } catch (err) {
      console.error("Failed to remove member", err);
    }
  }

  return (
    <PortalLayout
      portalName="Employer Portal"
      portalRole="EMPLOYER"
      navItems={EMPLOYER_NAV}
      breadcrumbs={["Recruitment", "Team Management"]}
    >
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Users className="w-7 h-7 text-[#4169E1]" />
              Recruitment Team &amp; Permissions
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Manage organization administrators, recruiters, and hiring managers with granular role-based access controls.
            </p>
          </div>

          <Button
            onClick={() => setIsInviteOpen(true)}
            className="bg-[#4169E1] hover:bg-blue-700 text-white text-xs font-semibold gap-1.5 shadow-sm h-9"
          >
            <UserPlus className="w-4 h-4" /> Invite Staff Member
          </Button>
        </div>

        {/* Members Table */}
        <Card className="border-slate-200 bg-white shadow-soft-xs">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#4169E1]" />
              Active Team Members ({members.length})
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Loading team members...
              </div>
            ) : members.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No team members found.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {members.map((mem) => (
                  <div
                    key={mem.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-[#4169E1] text-xs">
                        {mem.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{mem.name}</span>
                          <Badge
                            variant="outline"
                            className={`text-[9px] px-1.5 py-0.2 capitalize ${
                              mem.role === "ORGANIZATION_ADMIN"
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : mem.role === "RECRUITER"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            {mem.role.replace(/_/g, " ").toLowerCase()}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {mem.title} {mem.department ? `• ${mem.department}` : ""} • {mem.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:justify-end">
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          mem.invitationStatus === "ACCEPTED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {mem.invitationStatus === "ACCEPTED" ? "Active Member" : "Invitation Pending"}
                      </Badge>

                      {mem.role !== "ORGANIZATION_ADMIN" && (
                        <button
                          onClick={() => handleRemove(mem.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                          title="Revoke Access"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invite Modal */}
        {isInviteOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 text-sm">Invite Team Member</h3>
                <button onClick={() => setIsInviteOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleInvite} className="p-4 space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Nair"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Business Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="priya@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Role *</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white"
                    >
                      <option value="RECRUITER">Recruiter</option>
                      <option value="HIRING_MANAGER">Hiring Manager</option>
                      <option value="ORGANIZATION_ADMIN">Organization Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Job Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Senior Talent Lead"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Department</label>
                  <input
                    type="text"
                    placeholder="e.g. Engineering, Nursing Staffing, Finance"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsInviteOpen(false)} className="text-xs">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="bg-[#4169E1] text-white text-xs">
                    {isSubmitting ? "Inviting..." : "Send Invitation"}
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
