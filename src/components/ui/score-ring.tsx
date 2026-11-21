"use client";

import React, { useEffect, useState } from "react";

export interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  showPercent?: boolean;
  className?: string;
  animate?: boolean;
  colorScheme?: "auto" | "primary" | "secondary" | "emerald";
}

export function ScoreRing({
  score,
  size = 88,
  strokeWidth = 8,
  label,
  sublabel,
  showPercent = true,
  className = "",
  animate = true,
  colorScheme = "auto",
}: ScoreRingProps) {
  const [currentScore, setCurrentScore] = useState(animate ? 0 : score);

  useEffect(() => {
    if (!animate) {
      setCurrentScore(score);
      return;
    }
    const timer = setTimeout(() => {
      setCurrentScore(Math.min(100, Math.max(0, score)));
    }, 100);
    return () => clearTimeout(timer);
  }, [score, animate]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedScore = Math.min(100, Math.max(0, currentScore));
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  const getColor = () => {
    if (colorScheme === "primary") return "#4169E1";
    if (colorScheme === "secondary") return "#7952D9";
    if (colorScheme === "emerald") return "#10B981";

    // Auto by score bracket
    if (normalizedScore >= 75) return "#10B981"; // Emerald
    if (normalizedScore >= 60) return "#4169E1"; // Royal Blue
    return "#F59E0B"; // Amber
  };

  const activeColor = getColor();

  return (
    <div className={`inline-flex flex-col items-center justify-center ${className}`}>
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="rotate-[-90deg] transition-all"
        >
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#E8ECF4"
            strokeWidth={strokeWidth}
          />
          {/* Active Progress Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={activeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Centered Score Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span
            className="font-heading font-extrabold text-text-primary leading-none"
            style={{ fontSize: `${Math.max(14, Math.round(size * 0.28))}px` }}
          >
            {Math.round(currentScore)}
            {showPercent && (
              <span
                className="font-medium text-text-secondary"
                style={{ fontSize: `${Math.max(10, Math.round(size * 0.16))}px` }}
              >
                %
              </span>
            )}
          </span>
          {sublabel && (
            <span
              className="text-text-secondary uppercase tracking-wider font-semibold mt-0.5"
              style={{ fontSize: `${Math.max(8, Math.round(size * 0.11))}px` }}
            >
              {sublabel}
            </span>
          )}
        </div>
      </div>

      {label && (
        <span className="mt-2 text-xs font-semibold text-text-primary text-center">
          {label}
        </span>
      )}
    </div>
  );
}
