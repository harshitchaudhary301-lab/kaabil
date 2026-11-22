// ==============================================================================
// KAABIL (काबिल) — Learning Preferences Modal Component
// Customize weekly learning time commitment (5, 10, 15, 20 hrs) and budget preference
// ==============================================================================

"use client";

import React, { useState } from "react";
import {
  X,
  Clock,
  Coins,
  Sparkles,
  Zap,
  Check,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LearningPlanPreferences } from "@/types/learning-plan";

interface LearningPreferencesModalProps {
  currentPreferences: LearningPlanPreferences;
  isOpen: boolean;
  language: "en" | "hi" | "hinglish";
  onClose: () => void;
  onSavePreferences: (prefs: Partial<LearningPlanPreferences>) => Promise<void>;
}

export function LearningPreferencesModal({
  currentPreferences,
  isOpen,
  language,
  onClose,
  onSavePreferences,
}: LearningPreferencesModalProps) {
  const [weeklyHours, setWeeklyHours] = useState<5 | 10 | 15 | 20>(
    currentPreferences.weeklyTimeCommitmentHours || 10
  );
  const [budget, setBudget] = useState<"FREE_ONLY" | "AFFORDABLE_PAID" | "ANY">(
    currentPreferences.budgetPreference || "FREE_ONLY"
  );
  const [pace, setPace] = useState<"STEADY" | "ACCELERATED" | "WEEKEND_FOCUS">(
    currentPreferences.learningPace || "STEADY"
  );
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSavePreferences({
        weeklyTimeCommitmentHours: weeklyHours,
        budgetPreference: budget,
        learningPace: pace,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const timeOptions: {
    value: 5 | 10 | 15 | 20;
    label: string;
    sublabel: string;
    daily: string;
    isRecommended?: boolean;
  }[] = [
    {
      value: 5,
      label: "5 Hours / Week",
      sublabel: "School & Work Balance",
      daily: "~30 mins / day (Mon-Fri)",
    },
    {
      value: 10,
      label: "10 Hours / Week",
      sublabel: "Recommended Pace",
      daily: "~45 mins / day (Mon-Fri)",
      isRecommended: true,
    },
    {
      value: 15,
      label: "15 Hours / Week",
      sublabel: "Career Accelerated",
      daily: "~60 mins / day (Mon-Fri)",
    },
    {
      value: 20,
      label: "20 Hours / Week",
      sublabel: "Immersive Sprint",
      daily: "~90 mins / day (Mon-Fri)",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl border border-purple-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-gradient-to-r from-purple-50/80 to-indigo-50/50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Customize Learning Routine
            </h3>
            <p className="text-xs text-gray-500">
              Adjust your schedule and resource budget anytime.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Weekly Time Budget */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-purple-700 mb-2">
              Weekly Learning Commitment
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {timeOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => setWeeklyHours(opt.value)}
                  className={`relative rounded-xl border p-3 cursor-pointer transition-all ${
                    weeklyHours === opt.value
                      ? "border-purple-600 bg-purple-50/60 shadow-xs"
                      : "border-gray-200 hover:border-purple-200 bg-white"
                  }`}
                >
                  {opt.isRecommended && (
                    <span className="absolute top-2 right-2 rounded bg-purple-600 px-1.5 py-0.2 text-[9px] font-bold text-white uppercase">
                      Recommended
                    </span>
                  )}
                  <div className="text-sm font-bold text-gray-900">{opt.label}</div>
                  <div className="text-xs text-gray-500">{opt.sublabel}</div>
                  <div className="mt-1 text-[11px] font-medium text-purple-700">{opt.daily}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Budget Preference */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-purple-700 mb-2">
              Resource Budget Preference
            </label>
            <div className="space-y-2">
              {[
                {
                  id: "FREE_ONLY" as const,
                  title: "100% Free Public Portals (Recommended)",
                  desc: "Prioritize Swayam, NPTEL, Khan Academy, ICAR, MedlinePlus, and open-source materials.",
                },
                {
                  id: "AFFORDABLE_PAID" as const,
                  title: "Affordable / Subsidized",
                  desc: "Include low-cost textbooks, student discounts, and affordable micro-certifications.",
                },
                {
                  id: "ANY" as const,
                  title: "Any / Open",
                  desc: "Show all high-quality verified resources regardless of cost structure.",
                },
              ].map((b) => (
                <div
                  key={b.id}
                  onClick={() => setBudget(b.id)}
                  className={`flex items-start space-x-3 rounded-xl border p-3 cursor-pointer transition-all ${
                    budget === b.id
                      ? "border-purple-600 bg-purple-50/60 shadow-xs"
                      : "border-gray-200 hover:border-purple-200 bg-white"
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-xs ${
                      budget === b.id
                        ? "border-purple-600 bg-purple-600 text-white"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {budget === b.id && <Check className="h-2.5 w-2.5" />}
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-900">{b.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-100 bg-gray-50 px-6 py-3 flex items-center justify-end space-x-2">
          <Button variant="outline" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold"
          >
            {isSaving ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </div>
    </div>
  );
}
