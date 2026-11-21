"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserX,
  UserCheck,
  Trash2,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Building2,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { ADMIN_NAV_ITEMS } from "@/components/admin/admin-nav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminUserRecord, AccountStatus } from "@/types/admin";
import { UserRole } from "@/types";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modal states
  const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null);
  const [modalAction, setModalAction] = useState<"SUSPEND" | "REACTIVATE" | "CHANGE_ROLE" | "DELETE" | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("STUDENT");
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter !== "ALL") params.append("role", roleFilter);
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (searchTerm.trim()) params.append("search", searchTerm.trim());

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setUsers(data.users);
        }
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const executeAction = async () => {
    if (!selectedUser || !modalAction) return;
    setSubmitting(true);
    try {
      let payload: any = { emailOrId: selectedUser.id };

      if (modalAction === "SUSPEND") {
        payload.action = "UPDATE_STATUS";
        payload.status = "SUSPENDED";
        payload.reason = actionReason || "Platform Terms of Service violation review.";
      } else if (modalAction === "REACTIVATE") {
        payload.action = "UPDATE_STATUS";
        payload.status = "ACTIVE";
      } else if (modalAction === "CHANGE_ROLE") {
        payload.action = "UPDATE_ROLE";
        payload.role = newRole;
      } else if (modalAction === "DELETE") {
        payload.action = "REQUEST_DELETION";
        payload.reason = actionReason || "User exercised DPDP Act right to be forgotten.";
      }

      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setNotification({ type: "success", message: data.message || "User updated successfully." });
        setModalAction(null);
        setSelectedUser(null);
        setActionReason("");
        fetchUsers();
      } else {
        setNotification({ type: "error", message: data.error || "Failed to update user." });
      }
    } catch (err: any) {
      setNotification({ type: "error", message: err.message || "Network error occurred." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PortalLayout
      portalName="Admin Governance"
      portalRole="ADMIN"
      navItems={ADMIN_NAV_ITEMS}
      breadcrumbs={["Administration", "User Governance"]}
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-text-primary">
              User Governance & Security Directorate
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Audit, suspend, reactivate, or update account roles with complete administrative provenance
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Directory
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

        {/* Search & Filters */}
        <Card className="p-4 border-border">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <Input
                placeholder="Search user by name, email, or organization..."
                className="pl-9 h-10 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                className="h-10 text-xs px-3 rounded-lg border border-border bg-white text-text-primary"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="ALL">All Roles</option>
                <option value="STUDENT">Students</option>
                <option value="INSTITUTION">Institutions</option>
                <option value="EMPLOYER">Employers</option>
                <option value="SUPER_ADMIN">Superadmins</option>
              </select>

              <select
                className="h-10 text-xs px-3 rounded-lg border border-border bg-white text-text-primary"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="DEACTIVATED">Deactivated</option>
                <option value="PENDING_DELETION">Pending Deletion</option>
              </select>

              <Button type="submit" size="sm" className="h-10 px-4 text-xs">
                Search
              </Button>
            </div>
          </form>
        </Card>

        {/* Users Table */}
        <Card className="overflow-hidden border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-border text-text-muted uppercase text-[11px] font-semibold">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Stream / Organization</th>
                  <th className="py-3 px-4">DPDP Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-text-muted">
                      <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
                      Loading user governance records...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-text-muted">
                      No users match the selected query.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-text-primary">{user.name}</div>
                        <div className="text-[11px] text-text-muted">{user.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={`text-[10px] uppercase font-bold ${
                            user.role === "SUPER_ADMIN"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : user.role === "EMPLOYER_ADMIN" || user.role === "RECRUITER"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : user.role === "INSTITUTION_ADMIN" || user.role === "FACULTY"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-slate-50 text-slate-700 border-slate-200"
                          }`}
                        >
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            user.status === "ACTIVE"
                              ? "success"
                              : user.status === "SUSPENDED"
                              ? "warning"
                              : "outline"
                          }
                          className="text-[10px]"
                        >
                          {user.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {user.organizationName ? (
                          <div className="flex items-center gap-1.5 font-medium text-text-primary">
                            <Building2 className="h-3 w-3 text-text-muted" />
                            {user.organizationName}
                          </div>
                        ) : user.stream ? (
                          <div className="flex items-center gap-1.5 text-text-secondary">
                            <GraduationCap className="h-3 w-3 text-text-muted" />
                            {user.stream}
                          </div>
                        ) : (
                          <span className="text-text-muted">General</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {user.isMinor ? (
                          <Badge variant="warning" className="text-[10px]">
                            Minor (&lt;18) Protected
                          </Badge>
                        ) : (
                          <span className="text-[11px] text-text-muted">Adult (Standard)</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {user.status === "ACTIVE" ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs text-amber-700 hover:text-amber-800 hover:bg-amber-50"
                              onClick={() => {
                                setSelectedUser(user);
                                setModalAction("SUSPEND");
                              }}
                            >
                              <ShieldAlert className="h-3.5 w-3.5 mr-1" />
                              Suspend
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
                              onClick={() => {
                                setSelectedUser(user);
                                setModalAction("REACTIVATE");
                              }}
                            >
                              <UserCheck className="h-3.5 w-3.5 mr-1" />
                              Reactivate
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-primary hover:bg-primary/10"
                            onClick={() => {
                              setSelectedUser(user);
                              setNewRole(user.role);
                              setModalAction("CHANGE_ROLE");
                            }}
                          >
                            Role
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              setSelectedUser(user);
                              setModalAction("DELETE");
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Action Modal */}
        {modalAction && selectedUser && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-6 bg-white space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-lg font-bold text-text-primary">
                  {modalAction === "SUSPEND" && "Suspend User Account"}
                  {modalAction === "REACTIVATE" && "Reactivate User Account"}
                  {modalAction === "CHANGE_ROLE" && "Update Account Role"}
                  {modalAction === "DELETE" && "DPDP Right to be Forgotten"}
                </h3>
                <button
                  onClick={() => {
                    setModalAction(null);
                    setSelectedUser(null);
                  }}
                  className="text-text-muted hover:text-text-primary"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <div className="text-xs text-text-secondary bg-slate-50 p-3 rounded-lg border border-border">
                Target: <strong className="text-text-primary">{selectedUser.name}</strong> ({selectedUser.email})
              </div>

              {modalAction === "SUSPEND" && (
                <div className="space-y-3">
                  <p className="text-xs text-text-secondary">
                    Provide an administrative reason for suspending this user. The user will be locked out from signing in until reviewed.
                  </p>
                  <textarea
                    className="w-full h-20 p-2 text-xs rounded-lg border border-border focus:outline-primary"
                    placeholder="Reason for suspension (e.g., suspicious activity, policy violation)..."
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                  />
                </div>
              )}

              {modalAction === "REACTIVATE" && (
                <p className="text-xs text-text-secondary">
                  Are you sure you want to reactivate this account? The user will immediately regain access to the platform.
                </p>
              )}

              {modalAction === "CHANGE_ROLE" && (
                <div className="space-y-3">
                  <p className="text-xs text-text-secondary">
                    Select a new role for this user account. Least-privilege rules apply.
                  </p>
                  <select
                    className="w-full h-10 text-xs px-3 rounded-lg border border-border bg-white"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                  >
                    <option value="STUDENT">Student</option>
                    <option value="INSTITUTION_ADMIN">Institution Administrator</option>
                    <option value="FACULTY">Faculty Member</option>
                    <option value="EMPLOYER_ADMIN">Employer Administrator</option>
                    <option value="RECRUITER">Recruiter</option>
                    <option value="SUPER_ADMIN">Super Administrator</option>
                  </select>
                </div>
              )}

              {modalAction === "DELETE" && (
                <div className="space-y-3">
                  <div className="p-3 bg-red-50 text-red-800 text-xs rounded-lg border border-red-200">
                    <strong>DPDP Compliance Warning:</strong> This will flag the account for complete irreversible deletion and anonymization in accordance with statutory privacy guidelines.
                  </div>
                  <textarea
                    className="w-full h-20 p-2 text-xs rounded-lg border border-border focus:outline-primary"
                    placeholder="Reason or ticket reference for deletion request..."
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setModalAction(null);
                    setSelectedUser(null);
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={executeAction}
                  disabled={submitting}
                  className={
                    modalAction === "DELETE" || modalAction === "SUSPEND"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-primary text-white"
                  }
                >
                  {submitting ? "Processing..." : "Confirm Action"}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
