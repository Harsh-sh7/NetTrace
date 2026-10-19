import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { useTopology } from '../../context/TopologyContext';
import { Device } from '../../types';

export interface DeviceNodeData {
  device: Device;
  isSelected?: boolean;
}

// Convert full FQDN to clean Osprey-style short name
export const getShortHostname = (hostname: string, deviceId: string): string => {
  const lower = hostname.toLowerCase();
  if (deviceId === 'DEV-ROGUE-01') return 'rogue-pi1';
  if (lower.includes('rtr-ccf')) return 'ccf-core1';
  if (lower.includes('sw-ccf')) return 'ccf-sw1';
  if (lower.includes('srv-scada') || lower.includes('scada-master')) return 'scada-srv1';
  if (lower.includes('rtr-cs01')) return 'cs01-rtr1';
  if (lower.includes('sw-cs01')) return 'cs01-sw1';
  if (lower.includes('plc-comp')) return 'cs01-plc1';
  if (lower.includes('rtu-cs01')) return 'cs01-rtu1';
  if (lower.includes('rtr-vs04')) return 'vs04-rtr1';
  if (lower.includes('sw-vs04')) return 'vs04-sw1';
  if (lower.includes('rtu-vs04')) return 'vs04-rtu1';
  if (lower.includes('rtr-ps02')) return 'ps02-rtr1';
  if (lower.includes('plc-pump')) return 'ps02-plc1';
  if (lower.includes('rtr-ts01')) return 'ts01-rtr1';
  if (lower.includes('rtu-meter')) return 'ts01-rtu1';
  if (lower.includes('cp-mon')) return 'cp-mon1';
  if (lower.includes('rtr-vs07')) return 'vs07-rtr1';

  // Fallback to first dot segment or deviceId
  const firstPart = hostname.split('.')[0].toLowerCase();
  return firstPart || deviceId.toLowerCase();
};

export const DeviceNode: React.FC<NodeProps> = memo(({ id, data, selected }) => {
  const nodeData = data as unknown as DeviceNodeData;
  const { device } = nodeData;

  const { 
    openDeviceInspector, 
    openSshTerminal, 
    setRouteSource, 
    setRouteDest, 
    routeSourceId, 
    routeDestId,
    routePathActive,
    activeRouteNodeIds,
    toggles,
    theme
  } = useTopology();

  const isLight = theme === 'light';

  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);

  const isRogue = device.is_rogue;
  const isStale = device.monitoring_status === 'STALE';
  const isDown = device.monitoring_status === 'UNREACHABLE';

  const isRouteSource = routeSourceId === device.device_id;
  const isRouteDest = routeDestId === device.device_id;
  
  // Highlight if it's on the dynamically calculated active route path
  const isOnActiveRoute = routePathActive && (
    isRouteSource || 
    isRouteDest || 
    Boolean(activeRouteNodeIds?.has(device.device_id))
  );

  const shortName = getShortHostname(device.hostname, device.device_id);
  const ipAddress = device.management_addresses[0] || '10.240.10.1';

  // Determine cylinder color palette matching Osprey reference screenshot
  // Blue: Core Routers (iad2-cr1, dfw2-cr2, etc.)
  // Green: Gateways / Distribution (dfw2-gw2, mia1-gw1)
  // Yellow/Amber: Secondary / Remote RTU / PLC (iad2-dr2)
  // Red: Rogue / Alert nodes (ams1-gw2, rogue-pi1)
  const diskPalette = (() => {
    if (isRogue || isDown) {
      return {
        topGradientStart: '#ef4444',
        topGradientEnd: '#b91c1c',
        sideGradientStart: '#991b1b',
        sideGradientEnd: '#450a0a',
        glowColor: 'rgba(239, 68, 68, 0.7)',
        strokeColor: '#fca5a5',
      };
    }
    if (device.device_type === 'ROUTER') {
      return {
        topGradientStart: '#2574e8',
        topGradientEnd: '#1751a8',
        sideGradientStart: '#133e82',
        sideGradientEnd: '#092147',
        glowColor: 'rgba(37, 116, 232, 0.7)',
        strokeColor: '#93c5fd',
      };
    }
    if (device.device_type === 'SWITCH' || device.device_type === 'SCADA_SERVER') {
      return {
        topGradientStart: '#22c55e',
        topGradientEnd: '#15803d',
        sideGradientStart: '#14532d',
        sideGradientEnd: '#052e16',
        glowColor: 'rgba(34, 197, 94, 0.7)',
        strokeColor: '#86efac',
      };
    }
    // RTU & PLC in Yellow / Amber
    return {
      topGradientStart: '#f59e0b',
      topGradientEnd: '#b45309',
      sideGradientStart: '#78350f',
      sideGradientEnd: '#451a03',
      glowColor: 'rgba(245, 158, 11, 0.7)',
      strokeColor: '#fde68a',
    };
  })();

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  };

  const closeContextMenu = () => {
    setContextMenuPos(null);
  };

  const isSwitch = device.device_type === 'SWITCH';

  return (
    <div 
      className="relative flex flex-col items-center justify-center select-none group cursor-pointer"
      onContextMenu={handleContextMenu}
      onClick={() => openDeviceInspector(device.device_id)}
      style={{ width: '84px' }}
    >
      {/* Centered Hidden Handles for Flow Edges */}
      <Handle 
        type="target" 
        position={Position.Top} 
        style={{ left: '42px', top: '16px', opacity: 0, width: '4px', height: '4px' }} 
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        style={{ left: '42px', top: '22px', opacity: 0, width: '4px', height: '4px' }} 
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        style={{ left: '14px', top: '19px', opacity: 0, width: '4px', height: '4px' }} 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        style={{ left: '70px', top: '19px', opacity: 0, width: '4px', height: '4px' }} 
      />

      {/* Route Source / Destination / Path Halo Rings */}
      {isRouteSource && (
        <div className="absolute top-1 w-16 h-10 rounded-full border-2 border-emerald-400 bg-emerald-500/20 shadow-[0_0_16px_rgba(52,211,153,0.8)] animate-pulse pointer-events-none" />
      )}
      {isRouteDest && (
        <div className="absolute top-1 w-16 h-10 rounded-full border-2 border-rose-500 bg-rose-500/20 shadow-[0_0_16px_rgba(244,63,94,0.8)] animate-pulse pointer-events-none" />
      )}
      {isOnActiveRoute && !isRouteSource && !isRouteDest && (
        <div className="absolute top-1 w-16 h-10 rounded-full border-2 border-amber-400 bg-amber-400/20 shadow-[0_0_14px_rgba(251,191,36,0.8)] pointer-events-none" />
      )}
      {selected && !isRouteSource && !isRouteDest && (
        <div className="absolute top-1 w-16 h-10 rounded-full border-2 border-cyan-400 shadow-[0_0_18px_rgba(0,210,255,0.8)] pointer-events-none" />
      )}

      {/* 3D Isometric Cylinder Disk SVG */}
      <div className={`relative transition-transform duration-150 ${selected ? 'scale-110' : 'group-hover:scale-105'}`}>
        <svg 
          width="56" 
          height="38" 
          viewBox="0 0 56 38" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible"
        >
          <defs>
            {/* Top Disc Gradient */}
            <radialGradient id={`topGrad-${id}`} cx="45%" cy="35%" r="65%">
              <stop offset="0%" stopColor={diskPalette.topGradientStart} />
              <stop offset="100%" stopColor={diskPalette.topGradientEnd} />
            </radialGradient>

            {/* Cylinder Wall Side Gradient */}
            <linearGradient id={`sideGrad-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={diskPalette.sideGradientStart} />
              <stop offset="50%" stopColor={diskPalette.sideGradientEnd} />
              <stop offset="100%" stopColor={diskPalette.sideGradientStart} />
            </linearGradient>

            {/* Shadow beneath disk */}
            <filter id={`dropShadow-${id}`} x="-20%" y="-20%" width="140%" height="160%">
              <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#000000" floodOpacity={isLight ? "0.28" : "0.75"} />
            </filter>
          </defs>

          {/* Under-cylinder drop shadow */}
          <ellipse 
            cx="28" 
            cy="27" 
            rx="25" 
            ry="9" 
            fill="black" 
            fillOpacity={isLight ? "0.2" : "0.45"} 
            filter={`url(#dropShadow-${id})`} 
          />

          {/* 3D Cylinder Wall (Body) */}
          <path
            d="M 3 13 A 25 10 0 0 0 53 13 L 53 23 A 25 10 0 0 1 3 23 Z"
            fill={`url(#sideGrad-${id})`}
            stroke={isLight ? "#94a3b8" : "#0a101d"}
            strokeWidth="0.5"
          />

          {/* Bottom bevel curve */}
          <path
            d="M 3 23 A 25 10 0 0 0 53 23"
            fill="none"
            stroke="rgba(0, 0, 0, 0.6)"
            strokeWidth="1.2"
          />

          {/* Top Elliptical Disc */}
          <ellipse
            cx="28"
            cy="13"
            rx="25"
            ry="10"
            fill={`url(#topGrad-${id})`}
            stroke={diskPalette.strokeColor}
            strokeWidth={selected || isOnActiveRoute ? "1.5" : "0.75"}
            strokeOpacity={selected ? "0.9" : "0.5"}
          />

          {/* Inner highlight rim */}
          <ellipse
            cx="28"
            cy="12.5"
            rx="23.5"
            ry="8.5"
            fill="none"
            stroke="#ffffff"
            strokeWidth="0.5"
            strokeOpacity="0.3"
          />

          {/* Authentic Cisco 4-Arrow Glyph on Top Disc */}
          {!isSwitch ? (
            // Router 4-Arrow Cross
            <g transform="translate(28, 13)" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" opacity="0.95">
              {/* Horizontal Line with Arrowheads */}
              <line x1="-12" y1="0" x2="12" y2="0" strokeWidth="1.5" />
              <polyline points="-9,-2.5 -12,0 -9,2.5" strokeWidth="1.4" fill="none" />
              <polyline points="9,-2.5 12,0 9,2.5" strokeWidth="1.4" fill="none" />

              {/* Vertical Line in Perspective with Arrowheads */}
              <line x1="0" y1="-5.5" x2="0" y2="5.5" strokeWidth="1.5" />
              <polyline points="-2.5,-3.5 0,-5.5 2.5,-3.5" strokeWidth="1.4" fill="none" />
              <polyline points="-2.5,3.5 0,5.5 2.5,3.5" strokeWidth="1.4" fill="none" />
            </g>
          ) : (
            // Switch Opposing Direction Arrows
            <g transform="translate(28, 13)" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" opacity="0.95">
              {/* Top arrow pointing right */}
              <line x1="-10" y1="-2.5" x2="10" y2="-2.5" strokeWidth="1.4" />
              <polyline points="7,-4.5 10,-2.5 7,-0.5" strokeWidth="1.4" fill="none" />

              {/* Bottom arrow pointing left */}
              <line x1="10" y1="2.5" x2="-10" y2="2.5" strokeWidth="1.4" />
              <polyline points="-7,0.5 -10,2.5 -7,4.5" strokeWidth="1.4" fill="none" />
            </g>
          )}
        </svg>

        {/* Small Status / Role Pip Badge */}
        {isRouteSource && (
          <span className="absolute -top-1 -left-2 bg-emerald-500 text-black text-[9px] font-black px-1 rounded-sm shadow-md">
            SRC
          </span>
        )}
        {isRouteDest && (
          <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] font-black px-1 rounded-sm shadow-md">
            DST
          </span>
        )}
      </div>

      {/* Osprey Clean Centered Hostname */}
      <div className="mt-1 flex flex-col items-center pointer-events-none">
        <span 
          className={`text-[11px] font-sans font-medium tracking-tight whitespace-nowrap transition-colors ${
            isLight ? 'drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]' : 'drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]'
          } ${
            isOnActiveRoute 
              ? isLight ? 'text-amber-700 font-black' : 'text-amber-300 font-bold' 
              : selected 
                ? isLight ? 'text-blue-700 font-black' : 'text-cyan-300 font-bold' 
                : isLight ? 'text-slate-900 font-bold group-hover:text-black' : 'text-slate-200 group-hover:text-white'
          }`}
        >
          {shortName}
        </span>
        
        {toggles.labels && (
          <span className={`text-[9px] font-mono ${
            isLight ? 'text-slate-600 font-medium' : 'text-slate-400 opacity-80 group-hover:opacity-100 group-hover:text-cyan-300'
          }`}>
            {ipAddress}
          </span>
        )}
      </div>

      {/* Right-Click Osprey Context Menu */}
      {contextMenuPos && (
        <div 
          className={`fixed z-50 rounded-md shadow-2xl p-1 text-xs font-sans min-w-[170px] border ${
            isLight
              ? 'bg-white border-slate-300 text-slate-800 shadow-xl'
              : 'bg-[#0d1627] border-[#1e2f4f] text-slate-200'
          }`}
          style={{ top: `${contextMenuPos.y}px`, left: `${contextMenuPos.x}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border-b ${
            isLight ? 'text-slate-500 border-slate-200' : 'text-slate-400 border-[#1e2f4f]'
          }`}>
            {shortName} ({ipAddress})
          </div>
          <button
            onClick={() => {
              setRouteSource(device.device_id);
              closeContextMenu();
            }}
            className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between text-emerald-600 dark:text-emerald-400 ${
              isLight ? 'hover:bg-emerald-50' : 'hover:bg-[#1a325a]'
            }`}
          >
            <span>Set as route source</span>
            <span className="text-[10px] text-emerald-500 font-mono">SRC</span>
          </button>
          <button
            onClick={() => {
              setRouteDest(device.device_id);
              closeContextMenu();
            }}
            className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between text-rose-600 dark:text-rose-400 ${
              isLight ? 'hover:bg-rose-50' : 'hover:bg-[#1a325a]'
            }`}
          >
            <span>Set as route destination</span>
            <span className="text-[10px] text-rose-500 font-mono">DST</span>
          </button>
          <button
            onClick={() => {
              openSshTerminal(device.device_id);
              closeContextMenu();
            }}
            className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between ${
              isLight ? 'text-blue-600 hover:bg-blue-50' : 'text-cyan-300 hover:bg-[#1a325a]'
            }`}
          >
            <span>Open SSH Terminal</span>
            <span className="text-[10px] font-mono opacity-80">CLI</span>
          </button>
          <button
            onClick={() => {
              openDeviceInspector(device.device_id);
              closeContextMenu();
            }}
            className={`w-full text-left px-2.5 py-1.5 rounded transition ${
              isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-[#1a325a] text-slate-300 hover:text-white'
            }`}
          >
            <span>Inspect Device Details</span>
          </button>
          <div className={`my-1 border-t ${isLight ? 'border-slate-200' : 'border-[#1e2f4f]'}`} />
          <button
            onClick={() => {
              navigator.clipboard?.writeText(ipAddress);
              closeContextMenu();
            }}
            className={`w-full text-left px-2.5 py-1 rounded text-[11px] ${
              isLight ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-[#1a325a] text-slate-400 hover:text-slate-200'
            }`}
          >
            Copy IP Address
          </button>
          <button
            onClick={closeContextMenu}
            className={`w-full text-left px-2.5 py-1 rounded text-[11px] ${
              isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
});

DeviceNode.displayName = 'DeviceNode';
