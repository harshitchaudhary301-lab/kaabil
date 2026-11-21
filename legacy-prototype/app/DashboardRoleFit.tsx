import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid 
} from 'recharts';
import { 
  Sparkles, Award, AlertTriangle, ChevronDown, ChevronUp, Calculator, 
  ArrowRight, CheckCircle2, TrendingUp, Info, HelpCircle
} from 'lucide-react';
import { RoleFitScore } from '../../engine/scoringEngine';
import { AnimatedCounter } from '../motion/AnimatedCounter';
import { CareerRole } from '../../data/roles';

interface DashboardRoleFitProps {
  rankedRoles: RoleFitScore[];
  activeRoleScore: RoleFitScore;
  onSelectRole: (role: CareerRole) => void;
  onProceedToRoadmap: () => void;
}

export const DashboardRoleFit: React.FC<DashboardRoleFitProps> = ({
  rankedRoles,
  activeRoleScore,
  onSelectRole,
  onProceedToRoadmap
}) => {
  const [showMathDetails, setShowMathDetails] = useState(false);

  // Prepare data for Recharts horizontal grouped bar chart
  const chartData = activeRoleScore.breakdown.map(item => ({
    name: item.skill,
    Current: item.current,
    Required: item.required,
    gap: item.gap,
    priority: item.priority
  }));

  const top3Roles = rankedRoles.slice(0, 3);
  const remainingRoles = rankedRoles.slice(3);

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-border shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mint text-emerald text-xs font-semibold mb-2">
              <Award className="w-3.5 h-3.5 text-emerald" />
              <span>Step 2: Explainable Role Fit & Gap Analysis</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-navy font-display">
              Know your fit. See your gap.
            </h2>
            <p className="text-sm text-slate-body mt-1 max-w-2xl">
              We evaluated your skills across 8 Indian industry benchmarks. Click any role below to inspect its exact gap breakdown.
            </p>
          </div>

          <button
            onClick={onProceedToRoadmap}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald hover:bg-emerald-hover text-white text-xs md:text-sm font-bold shadow-glow-emerald transition-all shrink-0 cursor-pointer"
          >
            <span>Generate 4-Week Roadmap for {activeRoleScore.role.title}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Top 3 Role Matching Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {top3Roles.map((item, index) => {
            const isSelected = item.role.id === activeRoleScore.role.id;
            return (
              <motion.button
                key={item.role.id}
                onClick={() => onSelectRole(item.role)}
                layout
                whileHover={{ y: -3 }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                className={`text-left p-5 rounded-2xl border-2 transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald bg-white shadow-card-hover ring-2 ring-emerald/20'
                    : 'border-slate-border bg-canvas hover:border-slate-300'
                }`}
              >
                {/* Ranking Tag */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    index === 0 ? 'bg-gold/20 text-gold-600 border border-gold/30' : 'bg-slate-200 text-slate-dark'
                  }`}>
                    #{index + 1} Best Fit
                  </span>
                  <span className="text-xs font-semibold text-slate-body">
                    {item.role.averageFresherCTC}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-navy font-display line-clamp-1">
                    {item.role.title}
                  </h3>
                  <p className="text-xs text-slate-body line-clamp-2 mt-1">
                    {item.role.shortDescription}
                  </p>
                </div>

                {/* Spring Progress Bar */}
                <div className="mt-4 pt-3 border-t border-slate-border/80">
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-dark">Overall Role Fit</span>
                    <span className="text-2xl font-black text-emerald font-display tabular-nums">
                      <AnimatedCounter value={item.fitPercentage} suffix="%" />
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-emerald rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${item.fitPercentage}%` }}
                      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                    />
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <span className="flex h-2 w-2 rounded-full bg-emerald ring-4 ring-emerald/20" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Other Roles Dropdown/Pills */}
        {remainingRoles.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-border/80 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-body">Other roles evaluated:</span>
            {remainingRoles.map(item => {
              const isSelected = item.role.id === activeRoleScore.role.id;
              return (
                <button
                  key={item.role.id}
                  onClick={() => onSelectRole(item.role)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-navy text-white'
                      : 'bg-canvas hover:bg-slate-200 text-slate-dark border border-slate-border'
                  }`}
                >
                  {item.role.title} ({item.fitPercentage}%)
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Mint Explainability Card: "Why [Role]?" */}
      <div className="bg-mint rounded-3xl p-6 md:p-8 border border-emerald/20 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-emerald text-xs font-bold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald" />
              <span>Transparent AI Breakdown</span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-navy font-display">
              Why does {activeRoleScore.role.title} fit you at {activeRoleScore.fitPercentage}%?
            </h3>
            <p className="text-sm text-slate-dark leading-relaxed">
              KAABIL does not use an uninterpretable black box. Your fit is derived from a transparent weighted
              blend: <strong>70% skill coverage</strong> across entry requirements, <strong>20% resume corpus similarity</strong>, and <strong>10% interest affinity</strong>.
            </p>

            {/* Strengths vs Gaps Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-white/90 p-4 rounded-2xl border border-emerald/30 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald uppercase tracking-wider mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald" />
                  <span>Strongest Match Drivers</span>
                </div>
                {activeRoleScore.strongestSkills.length > 0 ? (
                  <ul className="space-y-1.5 text-xs text-slate-dark">
                    {activeRoleScore.strongestSkills.slice(0, 3).map(s => (
                      <li key={s.skill} className="flex justify-between font-medium">
                        <span>{s.skill}</span>
                        <span className="text-emerald font-bold tabular-nums">
                          {s.current} / {s.required} ({Math.round(s.cappedRatio * 100)}%)
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-body">Add more skills in Step 1 to populate drivers.</p>
                )}
              </div>

              <div className="bg-white/90 p-4 rounded-2xl border border-terracotta/30 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-terracotta uppercase tracking-wider mb-2">
                  <AlertTriangle className="w-4 h-4 text-terracotta" />
                  <span>Highest Priority Gaps</span>
                </div>
                {activeRoleScore.criticalGaps.length > 0 ? (
                  <ul className="space-y-1.5 text-xs text-slate-dark">
                    {activeRoleScore.criticalGaps.slice(0, 3).map(g => (
                      <li key={g.skill} className="flex justify-between font-medium">
                        <span>{g.skill}</span>
                        <span className="text-terracotta font-bold tabular-nums">
                          Gap: {g.gap} pts (Priority {g.priority})
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-emerald font-semibold">You meet or exceed all entry benchmarks!</p>
                )}
              </div>
            </div>
          </div>

          {/* Toggle Math Details Button */}
          <div className="shrink-0">
            <button
              onClick={() => setShowMathDetails(!showMathDetails)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-navy font-bold text-xs border border-slate-border shadow-sm transition-all cursor-pointer"
            >
              <Calculator className="w-3.5 h-3.5 text-emerald" />
              <span>{showMathDetails ? 'Hide the exact math' : 'See the exact math'}</span>
              {showMathDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Expandable Exact Math Drawer */}
        <AnimatePresence>
          {showMathDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-emerald/20 overflow-hidden"
            >
              <div className="bg-white rounded-2xl p-5 border border-slate-border">
                <div className="mb-4">
                  <h4 className="text-sm font-bold text-navy flex items-center gap-1.5">
                    <span>Mathematical Formula & Live Parameters</span>
                  </h4>
                  <div className="font-mono text-xs bg-canvas p-3 rounded-xl border border-slate-border mt-2 text-navy">
                    Fit = round((0.7 × {activeRoleScore.coverageScore.toFixed(3)} [Coverage] + 0.2 × {activeRoleScore.textSimilarityScore.toFixed(3)} [Text Cosine] + 0.1 × {activeRoleScore.interestScore.toFixed(3)} [Interests]) × 100) = <strong>{activeRoleScore.fitPercentage}%</strong>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-border text-slate-body font-semibold">
                        <th className="pb-2">Skill Component</th>
                        <th className="pb-2 text-center">Your Level</th>
                        <th className="pb-2 text-center">Required Target</th>
                        <th className="pb-2 text-center">Weight (w)</th>
                        <th className="pb-2 text-center">min(C/R, 1)</th>
                        <th className="pb-2 text-right">Contribution (w × ratio)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeRoleScore.breakdown.map(item => (
                        <tr key={item.skill} className="text-slate-dark">
                          <td className="py-2 font-bold">{item.skill}</td>
                          <td className="py-2 text-center tabular-nums">{item.current}</td>
                          <td className="py-2 text-center tabular-nums">{item.required}</td>
                          <td className="py-2 text-center tabular-nums font-mono">{item.weight.toFixed(2)}</td>
                          <td className="py-2 text-center tabular-nums font-mono">{item.cappedRatio.toFixed(2)}</td>
                          <td className="py-2 text-right tabular-nums font-mono font-bold text-emerald">
                            +{(item.contribution * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Skill-Gap Analysis: Recharts Horizontal Grouped Bar Chart + Priority List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Horizontal Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 border border-slate-border shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base md:text-lg font-bold text-navy font-display">
                Benchmark Comparison: Current vs Required
              </h3>
              <p className="text-xs text-slate-body">
                Required benchmark for entry-level hiring (#0F2544 Navy) vs Your proficiency (#117A65 Emerald)
              </p>
            </div>
          </div>

          <div className="h-[280px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ fontSize: 12, fill: '#0F2544', fontWeight: 600 }} 
                  width={110}
                />
                <Tooltip
                  formatter={(value: any, name: any) => [`${value} / 100`, name === 'Current' ? 'Your Level' : 'Benchmark']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px'
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }}
                />
                <Bar dataKey="Current" fill="#117A65" radius={[0, 6, 6, 0]} barSize={12} name="Current Level" />
                <Bar dataKey="Required" fill="#0F2544" radius={[0, 6, 6, 0]} barSize={12} name="Target Benchmark" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ranked Priority Gaps List (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 md:p-8 border border-slate-border shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base md:text-lg font-bold text-navy font-display flex items-center gap-2">
                <span>Ranked Priority Gaps</span>
                <span className="text-[11px] bg-terracotta-50 text-terracotta font-bold px-2 py-0.5 rounded-full border border-terracotta/20">
                  importance × gap
                </span>
              </h3>
            </div>
            <p className="text-xs text-slate-body mb-4">
              KAABIL orders your weekly roadmap by this exact priority formula to deliver the quickest interview-readiness gains.
            </p>

            <div className="space-y-3">
              {activeRoleScore.breakdown
                .sort((a, b) => b.priority - a.priority)
                .map(item => {
                  const isGap = item.gap > 0;
                  return (
                    <div
                      key={item.skill}
                      className="p-3.5 rounded-2xl bg-canvas border border-slate-border flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-navy">{item.skill}</span>
                          <span className="text-[10px] text-slate-body font-mono">
                            wt: {(item.weight * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="text-xs text-slate-body tabular-nums flex items-center gap-1.5 font-medium">
                          <span className="text-emerald font-bold">{item.current}</span>
                          <span>→</span>
                          <span className="text-navy font-bold">{item.required}</span>
                          <span className="text-slate-400">({isGap ? `-${item.gap} pt gap` : 'Target Met'})</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`inline-block px-2.5 py-1 rounded-xl text-xs font-extrabold font-mono tabular-nums ${
                          item.priority >= 12
                            ? 'bg-terracotta text-white shadow-xs'
                            : item.priority > 0
                            ? 'bg-terracotta-50 text-terracotta border border-terracotta/30'
                            : 'bg-mint text-emerald border border-emerald/20'
                        }`}>
                          {item.priority > 0 ? `P ${item.priority}` : 'Done'}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-border">
            <button
              onClick={onProceedToRoadmap}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald hover:bg-emerald-hover text-white text-xs md:text-sm font-bold flex items-center justify-center gap-2 shadow-glow-emerald transition-all cursor-pointer"
            >
              <span>Build My 4-Week Adaptive Plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
