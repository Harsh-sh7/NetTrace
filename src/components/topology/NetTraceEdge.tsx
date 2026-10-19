import React from 'react';
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath } from '@xyflow/react';
import { Relationship } from '../../types';
import { useTopology } from '../../context/TopologyContext';

export const NetTraceEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
  data,
  selected
}) => {
  const { routePathActive, activeRouteEdgeIds, openLinkInspector, theme } = useTopology();
  const isLight = theme === 'light';

  // Smooth curved path matching NetTrace / Osprey visual aesthetic
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    curvature: 0.1,
  });

  const rel = (data as any)?.relationship as Relationship | undefined;
  const isDown = rel?.status === 'DOWN';
  const isEigrp = rel?.relationship_type === 'EIGRP_ADJACENCY';

  // Dynamic Route Path Edge check
  const isRouteEdge = routePathActive && (
    activeRouteEdgeIds?.has(rel?.relationship_id || '') || 
    activeRouteEdgeIds?.has(id)
  );

  const strokeColor = (() => {
    if (isRouteEdge) return isLight ? '#ea580c' : '#f97316'; // Vibrant Orange for Active Route Path
    if (isDown) return isLight ? '#dc2626' : '#ef4444';
    if (selected) return isLight ? '#0284c7' : '#38bdf8';
    if (isEigrp) return isLight ? '#d97706' : '#f59e0b'; // Amber / Gold for EIGRP
    return isLight ? '#2563eb' : '#1d65c1'; // Solid blue for transit in NetTrace
  })();

  const strokeWidth = isRouteEdge ? 3.5 : selected ? 2.5 : isEigrp ? 1.8 : 1.5;
  const opacity = routePathActive && !isRouteEdge ? 0.22 : isLight ? 0.95 : 0.85;

  return (
    <>
      {/* Background glow when edge is selected or part of route */}
      {(isRouteEdge || selected) && (
        <BaseEdge
          id={`${id}-glow`}
          path={edgePath}
          style={{
            stroke: isRouteEdge ? 'rgba(249, 115, 22, 0.45)' : 'rgba(56, 189, 248, 0.45)',
            strokeWidth: strokeWidth + 6,
            strokeLinecap: 'round',
          }}
        />
      )}

      {/* Main Edge Path */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: strokeColor,
          strokeWidth,
          strokeDasharray: isEigrp ? '6,4' : undefined,
          opacity,
          cursor: 'pointer',
        }}
      />

      {/* Interface & Metric Pill along edge */}
      {(selected || isRouteEdge || isDown) && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (rel) openLinkInspector(rel.relationship_id);
            }}
            className="cursor-pointer select-none"
          >
            <div className={`px-2 py-0.5 rounded text-[9px] font-mono shadow-md border backdrop-blur-md flex items-center gap-1 ${
              isRouteEdge
                ? isLight 
                  ? 'bg-amber-100 text-amber-900 border-amber-400 font-bold shadow-md' 
                  : 'bg-amber-950/90 text-amber-300 border-amber-600 font-bold'
                : isDown
                  ? isLight 
                    ? 'bg-rose-100 text-rose-800 border-rose-400 font-bold shadow-md animate-pulse' 
                    : 'bg-rose-950/90 text-rose-300 border-rose-700 animate-pulse font-bold'
                  : isLight 
                    ? 'bg-white/95 text-slate-800 border-slate-300 shadow-md font-semibold' 
                    : 'bg-[#0d182e]/90 text-cyan-300 border-[#1f3764]'
            }`}>
              {isRouteEdge ? (
                <span>cost {isEigrp ? '10000' : '10'} &middot; EIGRP AS 100</span>
              ) : isDown ? (
                <span>ADJACENCY DOWN</span>
              ) : (
                <span>{rel?.relationship_type === 'EIGRP_ADJACENCY' ? 'EIGRP AS 100' : '1000M Full'}</span>
              )}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

// Aliased export for compatibility
export const OspreyEdge = NetTraceEdge;
