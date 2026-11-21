"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  GraduationCap,
  FileText,
  Clock,
  ArrowRight,
  Filter,
  CheckCheck,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { INSTITUTION_NAV } from "@/components/institution/institution-nav";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InstitutionNotificationRecord } from "@/types/institution";

export default function InstitutionNotificationsPage() {
  const [notifications, setNotifications] = useState<InstitutionNotificationRecord[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [unreadOnly, setUnreadOnly] = useState<boolean>(false);

  useEffect(() => {
    fetchNotifications();
  }, [unreadOnly]);

  async function fetchNotifications() {
    setLoading(true);
    try {
      const q = unreadOnly ? "?unread=true" : "";
      const res = await fetch(`/api/institution/notifications${q}`);
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkRead(id: string) {
    try {
      const res = await fetch("/api/institution/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "MARK_READ", notificationId: id }),
      });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      }
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  }

  async function handleMarkAllRead() {
    try {
      const res = await fetch("/api/institution/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "MARK_ALL_READ" }),
      });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  }

  const filteredNotifications = notifications.filter((n) => {
    if (filterType !== "ALL" && n.type !== filterType) return false;
    return true;
  });

  function getNotificationIcon(type: InstitutionNotificationRecord["type"]) {
    switch (type) {
      case "INTERVENTION":
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case "TRAINING":
        return <GraduationCap className="w-5 h-5 text-blue-600" />;
      case "PLACEMENT":
        return <Briefcase className="w-5 h-5 text-purple-600" />;
      case "REPORT":
        return <FileText className="w-5 h-5 text-emerald-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-600" />;
    }
  }

  return (
    <PortalLayout
      portalName="Institution Portal"
      portalRole="INSTITUTION"
      navItems={INSTITUTION_NAV}
      breadcrumbs={["Institution", "Notifications"]}
    >
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Bell className="w-7 h-7 text-[#4169E1]" />
              Institutional Notifications & Alerts
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Real-time updates on student interventions, workshop attendance, assessments, and recruitment drives.
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleMarkAllRead}
              className="text-xs text-slate-700 hover:text-slate-900 gap-1.5"
            >
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              Mark all as read ({unreadCount})
            </Button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-slate-500 mr-1">Filter:</span>
            {["ALL", "INTERVENTION", "TRAINING", "PLACEMENT", "REPORT", "SYSTEM"].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                  filterType === t
                    ? "bg-[#4169E1] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
              className="rounded text-[#4169E1]"
            />
            Unread only
          </label>
        </div>

        {/* Notification Feed */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
            <div className="animate-spin w-8 h-8 border-4 border-[#4169E1] border-t-transparent rounded-full mx-auto mb-3"></div>
            Loading notification feed...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">You are all caught up!</h3>
            <p className="text-xs text-slate-500 mt-1">
              No new alerts or interventions require your attention at this moment.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-xl border transition-all flex items-start gap-4 ${
                  notif.isRead
                    ? "bg-white border-slate-200 hover:border-slate-300"
                    : "bg-blue-50/40 border-[#4169E1]/40 shadow-sm"
                }`}
              >
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-sm flex-shrink-0">
                  {getNotificationIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-slate-900">{notif.title}</h4>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#4169E1] inline-block" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {notif.message}
                  </p>

                  <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-100">
                    <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-600 capitalize">
                      {notif.type.toLowerCase()}
                    </Badge>

                    <div className="flex items-center gap-3">
                      {notif.link && (
                        <Link
                          href={notif.link}
                          className="text-xs text-[#4169E1] font-semibold flex items-center gap-1 hover:underline"
                        >
                          Take Action <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                      {!notif.isRead && (
                        <button
                          onClick={() => handleMarkRead(notif.id)}
                          className="text-xs text-slate-500 hover:text-slate-800"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
