"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileText,
  Building,
  GraduationCap,
  Sparkles,
  Check,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { EMPLOYER_NAV } from "@/components/employer/employer-nav";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmployerNotificationRecord } from "@/types/employer";

export default function EmployerNotificationsPage() {
  const [notifications, setNotifications] = useState<EmployerNotificationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    setLoading(true);
    try {
      const res = await fetch("/api/employer/notifications");
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  }

  const handleMarkRead = async (id?: string) => {
    try {
      const res = await fetch("/api/employer/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(id ? { notificationId: id } : { markAll: true }),
      });
      const data = await res.json();
      if (data.success) {
        if (id) {
          setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
          );
        } else {
          setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        }
      }
    } catch (err) {
      console.error("Failed to mark notifications read", err);
    }
  };

  const filtered = notifications.filter((n) => (filter === "UNREAD" ? !n.isRead : true));
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <PortalLayout
      portalName="Employer Console"
      portalRole="EMPLOYER"
      navItems={EMPLOYER_NAV}
      breadcrumbs={["Notifications", "Recruitment Activity Alerts"]}
    >
      <div className="space-y-6 max-w-4xl mx-auto pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Bell className="h-6 w-6 text-primary" />
              Notifications & Activity Alerts
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Real-time audit updates on applicant submissions, pipeline stage transitions, and verification status.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
              <button
                type="button"
                onClick={() => setFilter("ALL")}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  filter === "ALL" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter("UNREAD")}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  filter === "UNREAD" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMarkRead()}
                className="text-xs border-slate-200 text-slate-700"
              >
                Mark all read
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-500">Loading notifications...</div>
        ) : filtered.length === 0 ? (
          <Card className="border-slate-200 shadow-sm text-center py-16 bg-white">
            <CardContent>
              <Bell className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-800">No Notifications</h3>
              <p className="text-xs text-slate-500 mt-1">
                You are all caught up! New applicant actions and system updates will be logged here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <Card
                key={item.id}
                className={`border transition-all shadow-xs ${
                  item.isRead ? "bg-white border-slate-200" : "bg-sky-50/40 border-sky-200"
                }`}
              >
                <CardContent className="p-4 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 text-primary shrink-0 mt-0.5">
                      {item.type === "APPLICATION" && <FileText className="h-4 w-4 text-primary" />}
                      {item.type === "STAGE_CHANGE" && <Clock className="h-4 w-4 text-purple-600" />}
                      {item.type === "VERIFICATION" && <ShieldCheck className="h-4 w-4 text-emerald-600" />}
                      {item.type === "PARTNERSHIP" && <GraduationCap className="h-4 w-4 text-amber-600" />}
                      {item.type === "SYSTEM" && <Bell className="h-4 w-4 text-slate-600" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900">{item.title}</span>
                        {!item.isRead && (
                          <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>
                      <div className="text-[10px] text-slate-400">
                        {new Date(item.createdAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.link && (
                      <Link href={item.link}>
                        <Button variant="ghost" size="sm" className="text-xs text-primary h-7 px-2">
                          View
                        </Button>
                      </Link>
                    )}
                    {!item.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkRead(item.id)}
                        className="text-xs text-slate-400 hover:text-slate-700 h-7 px-2"
                        title="Mark as read"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
