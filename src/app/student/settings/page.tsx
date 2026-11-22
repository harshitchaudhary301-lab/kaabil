"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  KeyRound,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  User,
  GraduationCap,
  Building2,
  ArrowLeft,
  LayoutDashboard,
  BrainCircuit,
  Compass,
  Award,
  BookOpenCheck,
  FileBadge,
  Settings,
  Sparkles,
  Scale,
  Layers,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { STUDENT_NAV } from "@/components/student/student-nav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { evaluatePasswordStrengthClient } from "@/lib/auth/client-password";



export default function StudentSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Password Update State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Account Deletion State
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const passwordEvaluation = evaluatePasswordStrengthClient(newPassword);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch {
        // Fallback
      } finally {
        setLoadingUser(false);
      }
    }
    fetchSession();
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await fetch("/api/auth/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordError(data.error || "Failed to update password.");
        setPasswordLoading(false);
        return;
      }

      setPasswordSuccess("Your password was updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setPasswordLoading(false);
    } catch {
      setPasswordError("Network error. Please try again.");
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);
    setDeleteLoading(true);

    try {
      const res = await fetch("/api/auth/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passwordConfirmation: deleteConfirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setDeleteError(data.error || "Account deletion failed. Verify your password.");
        setDeleteLoading(false);
        return;
      }

      // Success -> Redirect to landing page
      router.push("/");
    } catch {
      setDeleteError("Network error during account deletion.");
      setDeleteLoading(false);
    }
  };

  return (
    <PortalLayout
      portalName="Student Portal"
      portalRole="STUDENT"
      navItems={STUDENT_NAV}
      breadcrumbs={["Overview", "Settings & Privacy"]}
    >
      <div className="space-y-8 max-w-4xl mx-auto">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary">
            Account Settings & Data Privacy
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Manage your credentials, verify DPDP Act 2023 compliance protections, or delete your account data.
          </p>
        </div>

        {/* Profile Card */}
        <Card className="p-6 border-border space-y-4">
          <h2 className="font-heading text-base font-bold text-text-primary flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            Profile & Identity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-border">
              <span className="text-[10px] text-text-muted uppercase font-bold block">Full Name</span>
              <span className="text-sm font-semibold text-text-primary">
                {user?.name || "Student"}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-border">
              <span className="text-[10px] text-text-muted uppercase font-bold block">Registered Email</span>
              <span className="text-sm font-semibold text-text-primary">
                {user?.email || "student@kaabil.in"}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-border">
              <span className="text-[10px] text-text-muted uppercase font-bold block">Assigned Role</span>
              <span className="text-sm font-semibold text-text-primary">
                {user?.role || "STUDENT"}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-border">
              <span className="text-[10px] text-text-muted uppercase font-bold block">Account Status</span>
              <span className="text-sm font-semibold text-emerald-600">
                {user?.status || "ACTIVE"}
              </span>
            </div>
          </div>
        </Card>

        {/* DPDP Act Minor Protection Card */}
        <Card className="p-6 border-border space-y-4">
          <h2 className="font-heading text-base font-bold text-text-primary flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-600" />
            DPDP Act 2023 Privacy Safeguards
          </h2>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-bold block text-emerald-900">
                  {user?.isMinor ? "Minor Protection Shield: STRICTLY ACTIVE" : "Adult Student Account"}
                </span>
                <p className="text-[11px] leading-relaxed text-emerald-800 mt-0.5">
                  {user?.isMinor
                    ? "In strict adherence with the Digital Personal Data Protection Act 2023, school learners under 18 cannot be indexed by commercial recruiters, tracked across external sites, or directly messaged by prospective employers."
                    : "Your personal data is encrypted in compliance with Indian privacy laws. You can adjust whether verified skills are visible to accredited hiring partners."}
                </p>
              </div>
              <Badge variant="success" className="shrink-0 text-[10px]">
                {user?.isMinor ? "Protected Minor" : "Adult Verified"}
              </Badge>
            </div>

            <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-emerald-900">Recruiter Profile Discovery:</span>
              <span className="font-bold text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-200">
                {user?.isMinor ? "Permanently Locked" : "User Controlled"}
              </span>
            </div>
          </div>
        </Card>

        {/* Password Update Card */}
        <Card className="p-6 border-border space-y-4">
          <h2 className="font-heading text-base font-bold text-text-primary flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" />
            Change Password
          </h2>

          {passwordSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
              />

              <div className="relative">
                <Input
                  label="New Password (min 8 chars)"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-8 text-text-muted hover:text-text-primary p-1"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {newPassword.length > 0 && (
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-[11px]">
                  <span className="text-text-secondary">Password Strength:</span>
                  <span className="font-bold text-primary">{passwordEvaluation.label}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-full flex-1 rounded-full ${
                        step <= passwordEvaluation.score ? "bg-primary" : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            <Button
              type="submit"
              variant="gradient"
              size="sm"
              disabled={passwordLoading}
              className="rounded-xl"
            >
              {passwordLoading ? (
                <div className="flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Updating...</span>
                </div>
              ) : (
                <span>Update Password</span>
              )}
            </Button>
          </form>
        </Card>

        {/* Delete Account Card (DPDP Right to Erasure) */}
        <Card className="p-6 border-rose-200 bg-rose-50/30 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-heading text-base font-bold text-rose-700 flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-rose-600" />
                DPDP Right to Erasure / Account Deletion
              </h2>
              <p className="text-xs text-text-secondary mt-1 max-w-xl leading-relaxed">
                Under the Indian DPDP Act 2023, you have the right to request permanent erasure of your account, skill assessments, and personal data records. This action is immediate and non-reversible.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              className="text-rose-600 border-rose-300 hover:bg-rose-50 rounded-xl shrink-0"
            >
              Delete Account
            </Button>
          </div>

          {showDeleteModal && (
            <div className="p-4 rounded-2xl bg-white border border-rose-300 space-y-4 animate-in fade-in">
              <div className="space-y-1">
                <span className="font-bold text-xs text-rose-700 block">
                  Confirm Permanent Account Deletion
                </span>
                <p className="text-[11px] text-text-secondary">
                  Please enter your password to confirm that you want to permanently delete your KAABIL account and all linked assessment records.
                </p>
              </div>

              {deleteError && (
                <p className="text-xs text-rose-600 font-semibold">{deleteError}</p>
              )}

              <form onSubmit={handleDeleteAccount} className="space-y-3">
                <Input
                  label="Enter Password to Confirm"
                  type="password"
                  value={deleteConfirmPassword}
                  onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                  placeholder="Your current password"
                  required
                />

                <div className="flex items-center gap-2">
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    disabled={deleteLoading}
                    className="bg-rose-600 text-white hover:bg-rose-700 border-transparent rounded-xl"
                  >
                    {deleteLoading ? "Deleting..." : "Permanently Delete My Data"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteConfirmPassword("");
                    }}
                    className="rounded-xl border-border"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}
        </Card>
      </div>
    </PortalLayout>
  );
}
