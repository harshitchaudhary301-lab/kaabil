import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UploadCloud, FileText, Sparkles, Check, Trash2, Plus, 
  Clock, Heart, HelpCircle, ArrowRight, RefreshCw, AlertCircle
} from 'lucide-react';
import { 
  extractSkillsFromText, 
  extractTextFromFile, 
  SAMPLE_RESUME_TEXT, 
  ExtractedSkill 
} from '../../engine/nlpExtractor';
import { ALL_INTEREST_TAGS } from '../../data/roles';
import { CANONICAL_SKILLS } from '../../data/skillAliases';
import { UserSkillProfile } from '../../engine/scoringEngine';

interface ProfileOnboardingProps {
  skills: UserSkillProfile;
  rawText: string;
  selectedInterests: string[];
  weeklyHours: number;
  onUpdateSkills: (skills: UserSkillProfile) => void;
  onUpdateRawText: (text: string) => void;
  onUpdateInterests: (interests: string[]) => void;
  onUpdateWeeklyHours: (hours: number) => void;
  onProceedToFit: () => void;
}

export const ProfileOnboarding: React.FC<ProfileOnboardingProps> = ({
  skills,
  rawText,
  selectedInterests,
  weeklyHours,
  onUpdateSkills,
  onUpdateRawText,
  onUpdateInterests,
  onUpdateWeeklyHours,
  onProceedToFit
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedMeta, setExtractedMeta] = useState<Record<string, { token: string; stage: string }>>({});
  const [newSkillInput, setNewSkillInput] = useState('');
  const [fileFeedback, setFileFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      await processUploadedFile(file);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await processUploadedFile(file);
    }
  };

  const processUploadedFile = async (file: File) => {
    setIsExtracting(true);
    setFileFeedback(`Reading ${file.name}...`);
    try {
      const text = await extractTextFromFile(file);
      onUpdateRawText(text);
      runExtraction(text);
      setFileFeedback(`Extracted text from ${file.name} successfully.`);
    } catch (err) {
      console.error(err);
      setFileFeedback(`Failed to parse file. You can paste your resume text below.`);
    } finally {
      setIsExtracting(false);
    }
  };

  const runExtraction = (textToProcess: string) => {
    setIsExtracting(true);
    setTimeout(() => {
      const results: ExtractedSkill[] = extractSkillsFromText(textToProcess);
      const newSkillsMap: UserSkillProfile = { ...skills };
      const metaMap: Record<string, { token: string; stage: string }> = { ...extractedMeta };

      results.forEach(res => {
        // If skill isn't already set, or default
        if (newSkillsMap[res.skill] === undefined) {
          newSkillsMap[res.skill] = res.currentProficiency;
        }
        metaMap[res.skill] = {
          token: res.matchedToken,
          stage: res.stage === 'alias' ? 'Direct Alias' : `Fuzzy Match (${Math.round(res.similarity * 100)}%)`
        };
      });

      onUpdateSkills(newSkillsMap);
      setExtractedMeta(metaMap);
      setIsExtracting(false);
    }, 300);
  };

  const handleInsertSample = () => {
    onUpdateRawText(SAMPLE_RESUME_TEXT);
    // Preset sample profile: Python 60/80, SQL 45/80, Statistics 35/70, Communication 55/70, Projects 30/60, 10 hrs/week
    const sampleSkills: UserSkillProfile = {
      'Python': 60,
      'SQL': 45,
      'Statistics': 35,
      'Communication': 55,
      'Projects': 30,
      'Excel': 50
    };
    onUpdateSkills(sampleSkills);
    setExtractedMeta({
      'Python': { token: 'python 3, pandas', stage: 'Direct Alias' },
      'SQL': { token: 'sql queries, postgresql', stage: 'Direct Alias' },
      'Statistics': { token: 'eda, hypothesis testing', stage: 'Direct Alias' },
      'Communication': { token: 'business communication', stage: 'Direct Alias' },
      'Projects': { token: 'academic capstone', stage: 'Direct Alias' },
      'Excel': { token: 'ms excel, vlookup', stage: 'Direct Alias' }
    });
    onUpdateInterests(['Data & Analytics', 'Problem Solving', 'Dashboards']);
    onUpdateWeeklyHours(10);
    setFileFeedback('Loaded sample Data Analyst profile for Aarav Mehta.');
  };

  const handleSliderChange = (skill: string, value: number) => {
    onUpdateSkills({
      ...skills,
      [skill]: value
    });
  };

  const handleRemoveSkill = (skill: string) => {
    const next = { ...skills };
    delete next[skill];
    onUpdateSkills(next);
  };

  const handleAddCustomSkill = (skillName: string) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;
    // Check if canonical skill exists
    const matched = CANONICAL_SKILLS.find(
      s => s.name.toLowerCase() === trimmed.toLowerCase() || s.aliases.includes(trimmed.toLowerCase())
    );
    const canonicalName = matched ? matched.name : trimmed;

    if (skills[canonicalName] === undefined) {
      onUpdateSkills({
        ...skills,
        [canonicalName]: matched ? matched.defaultProficiency : 50
      });
      setExtractedMeta({
        ...extractedMeta,
        [canonicalName]: { token: trimmed, stage: 'User Added' }
      });
    }
    setNewSkillInput('');
  };

  const toggleInterest = (tag: string) => {
    if (selectedInterests.includes(tag)) {
      onUpdateInterests(selectedInterests.filter(t => t !== tag));
    } else {
      onUpdateInterests([...selectedInterests, tag]);
    }
  };

  const activeSkillsList = Object.entries(skills);

  return (
    <div className="space-y-8">
      {/* Intro Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-border shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mint text-emerald text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald" />
              <span>Step 1: Skill Extraction & Profile Calibration</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-navy font-display">
              Feed your resume or select your current skills
            </h2>
            <p className="text-sm text-slate-body mt-1 max-w-2xl">
              KAABIL uses alias normalization and 3-gram fuzzy similarity to extract technical & soft skills.
              Every extracted proficiency is 100% editable by you.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInsertSample}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-emerald bg-mint hover:bg-emerald/10 border border-emerald/20 transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Insert Sample Resume</span>
            </button>
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[170px] ${
              isDragging
                ? 'border-emerald bg-mint/50 scale-[1.01]'
                : 'border-slate-border hover:border-emerald/60 hover:bg-slate-50/80 bg-white'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf,.txt,.doc,.docx"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-mint flex items-center justify-center text-emerald mb-3 shadow-sm">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-navy">
              Drop resume here (.pdf or .txt)
            </p>
            <p className="text-xs text-slate-body mt-1">
              or <span className="text-emerald font-semibold underline">browse file</span> from your laptop
            </p>
            <span className="text-[11px] text-slate-400 mt-2">
              Privacy-first · 100% client-side parse · Never uploaded to any server
            </span>
          </div>

          {/* Paste Text Area */}
          <div className="flex flex-col">
            <div className="relative flex-1">
              <textarea
                value={rawText}
                onChange={e => onUpdateRawText(e.target.value)}
                placeholder="Or paste your resume bullets, LinkedIn bio, or coursework syllabus here..."
                rows={5}
                className="w-full h-full p-3.5 text-xs rounded-2xl border border-slate-border focus:border-emerald focus:ring-2 focus:ring-emerald/20 outline-none resize-none font-mono bg-canvas"
              />
              {rawText && (
                <button
                  onClick={() => runExtraction(rawText)}
                  disabled={isExtracting}
                  className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-emerald text-white text-xs font-semibold hover:bg-emerald-hover transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3 h-3 ${isExtracting ? 'animate-spin' : ''}`} />
                  <span>Re-extract Skills</span>
                </button>
              )}
            </div>
            {fileFeedback && (
              <p className="text-xs text-emerald font-medium mt-1.5 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                {fileFeedback}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Extracted Skills Sliders & Normalization Chips */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-border shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-border gap-2">
          <div>
            <h3 className="text-lg font-bold text-navy font-display flex items-center gap-2">
              <span>Calibrate Your Skill Proficiencies (0 – 100)</span>
              <span className="text-xs font-semibold bg-canvas text-navy px-2.5 py-0.5 rounded-full border border-slate-border">
                {activeSkillsList.length} skills active
              </span>
            </h3>
            <p className="text-xs text-slate-body mt-0.5">
              Drag sliders to reflect your actual comfort level. Benchmark for entry-level roles is usually 70–85.
            </p>
          </div>

          {/* Quick Add Custom Skill */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newSkillInput}
              onChange={e => setNewSkillInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddCustomSkill(newSkillInput)}
              placeholder="Add skill (e.g. Git, React)"
              className="text-xs px-3 py-1.5 rounded-xl border border-slate-border focus:border-emerald outline-none w-44"
            />
            <button
              onClick={() => handleAddCustomSkill(newSkillInput)}
              className="px-2.5 py-1.5 rounded-xl bg-navy text-white text-xs font-medium hover:bg-navy-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Skill Cards Grid */}
        {activeSkillsList.length === 0 ? (
          <div className="py-12 text-center">
            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-dark">No skills extracted yet</p>
            <p className="text-xs text-slate-body mt-1">
              Upload a resume above, or click below to load the recommended starter skills.
            </p>
            <button
              onClick={handleInsertSample}
              className="mt-4 px-4 py-2 rounded-xl bg-emerald text-white text-xs font-bold hover:bg-emerald-hover transition-colors shadow-sm"
            >
              Load Starter Profile (Data Analyst Aspirant)
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <AnimatePresence>
              {activeSkillsList.map(([skillName, score]) => {
                const meta = extractedMeta[skillName];
                return (
                  <motion.div
                    key={skillName}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-4 rounded-2xl bg-canvas border border-slate-border/80 hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-navy">{skillName}</span>
                        {meta && (
                          <span
                            title={`Matched from token: "${meta.token}" via ${meta.stage}`}
                            className="inline-flex items-center text-[10px] font-medium bg-mint text-emerald px-2 py-0.5 rounded-md border border-emerald/20"
                          >
                            {meta.token} → {skillName}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald tabular-nums">
                          {score}/100
                        </span>
                        <button
                          onClick={() => handleRemoveSkill(skillName)}
                          aria-label={`Remove ${skillName}`}
                          className="p-1 rounded-md text-slate-400 hover:text-terracotta hover:bg-white transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Proficiency Slider */}
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={score}
                        onChange={e => handleSliderChange(skillName, parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
                      <span>Beginner (0-30)</span>
                      <span>Intermediate (40-65)</span>
                      <span>Industry Ready (70-85+)</span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Career Interests & Weekly Study Hours */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Interests Multi-Select (2 cols) */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 md:p-8 border border-slate-border shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-4 h-4 text-emerald" />
            <h3 className="text-base font-bold text-navy font-display">
              Target Domains & Passion Areas
            </h3>
          </div>
          <p className="text-xs text-slate-body mb-4">
            Select the domains you enjoy. This adds a 10% interest weighting to match you with roles you will love working in.
          </p>

          <div className="flex flex-wrap gap-2">
            {ALL_INTEREST_TAGS.map(tag => {
              const isSelected = selectedInterests.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleInterest(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-emerald text-white shadow-sm'
                      : 'bg-canvas text-slate-dark hover:bg-slate-200/70 border border-slate-border'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                  <span>{tag}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Weekly Hours Commitment (1 col) */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-border shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-emerald" />
              <h3 className="text-base font-bold text-navy font-display">
                Weekly Study Time
              </h3>
            </div>
            <p className="text-xs text-slate-body mb-4">
              Your 4-week roadmap will automatically scale weekly drills to fit your schedule.
            </p>

            <div className="text-center py-2 bg-mint/50 rounded-2xl border border-emerald/20 mb-4">
              <span className="text-3xl font-extrabold text-navy tabular-nums">
                {weeklyHours}
              </span>
              <span className="text-xs text-slate-body ml-1 font-semibold">hours / week</span>
            </div>

            <input
              type="range"
              min="5"
              max="30"
              step="1"
              value={weeklyHours}
              onChange={e => onUpdateWeeklyHours(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
              <span>5h (Light)</span>
              <span>10-15h (Balanced)</span>
              <span>25h+ (Intensive)</span>
            </div>
          </div>

          {/* Proceed Button */}
          <div className="mt-6 pt-4 border-t border-slate-border">
            <button
              onClick={onProceedToFit}
              disabled={activeSkillsList.length === 0}
              className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all duration-200 ${
                activeSkillsList.length > 0
                  ? 'bg-emerald hover:bg-emerald-hover text-white shadow-glow-emerald cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Calculate Role Fit & Gaps</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
