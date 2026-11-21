"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building,
  Save,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Globe,
  Mail,
  MapPin,
  Users,
  FileCheck,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { EMPLOYER_NAV } from "@/components/employer/employer-nav";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmployerOrganizationRecord } from "@/types/employer";
import { EducationalStream } from "@/types";

const ALL_STREAMS: { label: string; value: EducationalStream }[] = [
  { label: "Engineering & Technology (PCM)", value: "NON_MEDICAL_PCM" },
  { label: "Medicine & Health Sciences (PCB)", value: "MEDICAL_PCB" },
  { label: "Commerce, Banking & Finance", value: "COMMERCE" },
  { label: "Arts, Social Sciences & Humanities", value: "ARTS_HUMANITIES" },
  { label: "Law & Legal Services", value: "LAW" },
  { label: "Business Administration & Management", value: "MANAGEMENT" },
  { label: "Creative Arts, Media & Design", value: "CREATIVE_DESIGN" },
  { label: "Agriculture & Allied Sciences", value: "AGRICULTURE" },
  { label: "Vocational Trades & Crafts", value: "VOCATIONAL_TRADES" },
  { label: "Sports & Physical Education", value: "SPORTS_PHYSICAL_ED" },
  { label: "Hospitality & Tourism", value: "HOSPITALITY_TOURISM" },
  { label: "Interdisciplinary", value: "INTERDISCIPLINARY" },
];

export default function EmployerSettingsPage() {
  const [org, setOrg] = useState<EmployerOrganizationRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [sector, setSector] = useState("");
  const [website, setWebsite] = useState("");
  const [officialEmail, setOfficialEmail] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [size, setSize] = useState<any>("51-200");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [description, setDescription] = useState("");
  const [authorizedName, setAuthorizedName] = useState("");
  const [authorizedDesignation, setAuthorizedDesignation] = useState("");
  const [supportedStreams, setSupportedStreams] = useState<EducationalStream[]>([]);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoading(true);
    try {
      const res = await fetch("/api/employer/profile");
      const data = await res.json();
      if (data.success && data.organization) {
        const o = data.organization as EmployerOrganizationRecord;
        setOrg(o);
        setName(o.name);
        setIndustry(o.industry);
        setSector(o.sector);
        setWebsite(o.website || "");
        setOfficialEmail(o.officialEmail);
        setRegistrationNumber(o.registrationNumber || "");
        setSize(o.size);
        setCity(o.city);
        setState(o.state);
        setDescription(o.description);
        setAuthorizedName(o.authorizedPersonName);
        setAuthorizedDesignation(o.authorizedPersonDesignation);
        setSupportedStreams(o.supportedStreams || []);
      }
    } catch (err) {
      console.error("Failed to load organization settings", err);
    } finally {
      setLoading(false);
    }
  }

  const handleStreamToggle = (stream: EducationalStream) => {
    if (supportedStreams.includes(stream)) {
      setSupportedStreams(supportedStreams.filter((s) => s !== stream));
    } else {
      setSupportedStreams([...supportedStreams, stream]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/employer/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          industry,
          sector,
          website,
          officialEmail,
          registrationNumber,
          size,
          city,
          state,
          description,
          authorizedPersonName: authorizedName,
          authorizedPersonDesignation: authorizedDesignation,
          supportedStreams,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ type: "success", text: "Organization profile updated successfully!" });
        setOrg(data.organization);
      } else {
        setStatusMessage({ type: "error", text: data.error || "Failed to update profile." });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Network error occurred." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <PortalLayout
      portalName="Employer Console"
      portalRole="EMPLOYER"
      navItems={EMPLOYER_NAV}
      breadcrumbs={["Settings", "Organization Profile"]}
    >
      <div className="space-y-6 max-w-4xl mx-auto pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Building className="h-6 w-6 text-primary" />
              Organization Profile & Settings
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Manage corporate identity, verified registration details, and cross-stream recruitment preferences.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Status:</span>
            <Badge
              className={`text-xs ${
                org?.verificationStatus === "VERIFIED"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                  : "bg-amber-50 text-amber-800 border-amber-300"
              }`}
            >
              {org?.verificationStatus || "NOT_SUBMITTED"}
            </Badge>
          </div>
        </div>

        {statusMessage && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
              statusMessage.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {loading ? (
          <div className="py-24 text-center text-xs text-slate-500">Loading organization profile...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Entity Information */}
            <Card className="border-slate-200 shadow-sm bg-white">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-semibold text-slate-800">
                  1. Registered Entity Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Organization Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Official Corporate Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={officialEmail}
                      onChange={(e) => setOfficialEmail(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Industry</label>
                    <input
                      type="text"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Sector</label>
                    <input
                      type="text"
                      value={sector}
                      onChange={(e) => setSector(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Website URL</label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Registration Number (CIN / GSTIN / LLPIN)
                    </label>
                    <input
                      type="text"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Workforce Size</label>
                    <select
                      value={size}
                      onChange={(e) => setSize(e.target.value as any)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                    >
                      <option value="1-10">1-10 Employees (Startup)</option>
                      <option value="11-50">11-50 Employees</option>
                      <option value="51-200">51-200 Employees (Growth)</option>
                      <option value="201-500">201-500 Employees</option>
                      <option value="501-1000">501-1000 Employees</option>
                      <option value="1000+">1000+ Employees (Enterprise)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 2. Authorized Official */}
            <Card className="border-slate-200 shadow-sm bg-white">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-semibold text-slate-800">
                  2. Authorized Signatory / Recruiter Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Authorized Representative Name
                    </label>
                    <input
                      type="text"
                      value={authorizedName}
                      onChange={(e) => setAuthorizedName(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Official Designation
                    </label>
                    <input
                      type="text"
                      value={authorizedDesignation}
                      onChange={(e) => setAuthorizedDesignation(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3. Supported Streams */}
            <Card className="border-slate-200 shadow-sm bg-white">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-semibold text-slate-800">
                  3. Supported Educational Streams
                </CardTitle>
                <p className="text-xs text-slate-500">
                  Select the education disciplines for which your organization hires or accepts interns.
                </p>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {ALL_STREAMS.map((s) => {
                    const isChecked = supportedStreams.includes(s.value);
                    return (
                      <label
                        key={s.value}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                          isChecked
                            ? "bg-primary/5 border-primary text-primary font-medium"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleStreamToggle(s.value)}
                          className="rounded text-primary focus:ring-primary"
                        />
                        <span>{s.label}</span>
                      </label>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2">
                <Save className="h-4 w-4" />
                {saving ? "Saving Changes..." : "Save Organization Profile"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </PortalLayout>
  );
}
