"use client";

import React from "react";

export interface SkillRadarItem {
  label: string;
  value: number; // 0 to 100
  maxValue?: number;
}

export interface SkillRadarProps {
  skills: SkillRadarItem[];
  size?: number;
  className?: string;
  fillColor?: string;
  strokeColor?: string;
  levels?: number;
  showLabels?: boolean;
}

export function SkillRadar({
  skills,
  size = 280,
  className = "",
  fillColor = "rgba(65, 105, 225, 0.2)",
  strokeColor = "#4169E1",
  levels = 4,
  showLabels = true,
}: SkillRadarProps) {
  if (!skills || skills.length < 3) {
    return (
      <div className="flex items-center justify-center p-6 text-xs text-text-muted">
        Need at least 3 skills to render radar
      </div>
    );
  }

  const center = size / 2;
  const radius = center * 0.68; // Reserve 32% margin for text labels
  const total = skills.length;
  const angleStep = (Math.PI * 2) / total;

  // Helper to compute (x, y) given radius and index
  const getCoordinates = (valueNormalized: number, index: number) => {
    // Start from top (- PI / 2)
    const angle = index * angleStep - Math.PI / 2;
    const r = radius * valueNormalized;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Generate background concentric grid polygons
  const gridPolygons = Array.from({ length: levels }, (_, levelIdx) => {
    const factor = (levelIdx + 1) / levels;
    const points = skills.map((_, i) => {
      const { x, y } = getCoordinates(factor, i);
      return `${x},${y}`;
    }).join(" ");
    return { factor, points };
  });

  // Generate data polygon points
  const dataPoints = skills.map((item, i) => {
    const max = item.maxValue || 100;
    const normalized = Math.min(1, Math.max(0.1, item.value / max));
    return getCoordinates(normalized, i);
  });

  const dataPolygonString = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
      >
        {/* Concentric grid rings */}
        {gridPolygons.map((grid, idx) => (
          <polygon
            key={idx}
            points={grid.points}
            fill="none"
            stroke="#E8ECF4"
            strokeWidth={idx === levels - 1 ? "1.5" : "1"}
            strokeDasharray={idx === levels - 1 ? undefined : "3 3"}
          />
        ))}

        {/* Radial Axis Spokes */}
        {skills.map((_, i) => {
          const outer = getCoordinates(1, i);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={outer.x}
              y2={outer.y}
              stroke="#E8ECF4"
              strokeWidth="1"
            />
          );
        })}

        {/* Data Polygon Fill */}
        <polygon
          points={dataPolygonString}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth="2.5"
          className="transition-all duration-700 ease-out"
        />

        {/* Data Vertices */}
        {dataPoints.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="4.5"
            fill="#FFFFFF"
            stroke={strokeColor}
            strokeWidth="2.5"
            className="transition-all duration-700 hover:scale-125"
          />
        ))}

        {/* Labels */}
        {showLabels &&
          skills.map((item, i) => {
            const labelCoord = getCoordinates(1.22, i);
            const isLeft = labelCoord.x < center - 10;
            const isRight = labelCoord.x > center + 10;
            const textAnchor = isRight ? "start" : isLeft ? "end" : "middle";

            return (
              <g key={i}>
                <text
                  x={labelCoord.x}
                  y={labelCoord.y}
                  textAnchor={textAnchor}
                  dominantBaseline="central"
                  className="text-[10px] sm:text-[11px] font-semibold fill-text-primary"
                >
                  {item.label}
                </text>
                <text
                  x={labelCoord.x}
                  y={labelCoord.y + 11}
                  textAnchor={textAnchor}
                  dominantBaseline="central"
                  className="text-[9px] font-bold fill-primary"
                >
                  {Math.round(item.value)}%
                </text>
              </g>
            );
          })}
      </svg>
    </div>
  );
}
