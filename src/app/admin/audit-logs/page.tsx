"use client";

import React, { useState, useEffect } from "react";
import { FileText, Search, RefreshCw, Lock, ShieldCheck, Clock } from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { ADMIN_NAV_ITEMS } from "@/components/admin/admin-nav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminAuditLogRecord } from "@/types/admin";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AdminAuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/audit-logs?limit=100");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setLogs(data.logs);
        }
      }
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <PortalLayout
      portalName="Admin Governance"
      portalRole="ADMIN"
      navItems={ADMIN_NAV_ITEMS}
      breadcrumbs={["Administration", "Administrative Audit Trail"]}
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-text-primary">
                Administrative Audit Trail & Provenance
              </h1>
              <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50">
                Tamper-Evident Log
              </Badge>
            </div>
            <p className="text-sm text-text-secondary mt-1">
              Immutable provenance record of all administrator actions, verification approvals, and role mutations
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchLogs}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Trail
          </Button>
        </div>

        <Card className="border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-border text-text-muted uppercase text-[11px] font-semibold">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Administrator</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-text-muted">
                      <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
                      Loading audit records...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-text-muted">
                      No administrative audit records found.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 whitespace-nowrap text-text-muted font-mono text-[11px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-text-primary">{log.adminName}</div>
                        <div className="text-[10px] text-text-muted">{log.adminId}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className="font-mono text-[10px] bg-slate-50 text-slate-800"
                        >
                          {log.action}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-medium text-text-primary">{log.targetName}</div>
                        <div className="text-[10px] text-text-muted font-mono">
                          {log.targetType} • {log.targetId}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-text-secondary max-w-md">
                        {log.details}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </PortalLayout>
  );
}
