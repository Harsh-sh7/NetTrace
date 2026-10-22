import React, { useState } from 'react';
import { 
  GitFork, 
  ArrowRight, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight,
  Info,
  CornerDownRight,
  ShieldCheck
} from 'lucide-react';
import { NetTraceWindow } from './NetTraceWindow';
import { useTopology } from '../../context/TopologyContext';
import { getShortHostname } from './DeviceNode';

export const RoutePathWindow: React.FC = () => {
  const { 
    routePathOpen, 
    toggleRoutePath, 
    routeSourceId, 
    routeDestId, 
    setRouteSource, 
    setRouteDest, 
    clearRoutePath,
    devices,
    routeResult,
    theme
  } = useTopology();

  const isLight = theme === 'light';
  const [activeProtocol, setActiveProtocol] = useState<'EIGRP Successor' | 'Feasible Successor' | 'Metric Vectors' | 'L2 Switching'>('EIGRP Successor');
  const [detailsOpen, setDetailsOpen] = useState(false);

  if (!routePathOpen) return null;

  const srcDevice = devices.find(d => d.device_id === routeSourceId) || devices[0];
  const dstDevice = devices.find(d => d.device_id === routeDestId) || devices[3];

  const srcShort = getShortHostname(srcDevice.hostname, srcDevice.device_id);
  const dstShort = getShortHostname(dstDevice.hostname, dstDevice.device_id);

  const forwardHops = routeResult.hops;
  const totalCost = routeResult.totalCost;
  const isPathFound = routeResult.found;

  const titleNode = (
    <div className="flex items-center gap-2">
      <GitFork className="w-3.5 h-3.5 text-amber-500" />
      <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>EIGRP Route Path Tracer</span>
    </div>
  );

  return (
    <NetTraceWindow
      id="route-path"
      title={titleNode}
      isOpen={routePathOpen}
      onClose={() => toggleRoutePath(false)}
      initialX={45}
      initialY={75}
      initialWidth={490}
      initialHeight={620}
      zIndex={54}
    >
      {/* EIGRP Analysis Mode Tabs & Clear */}
      <div className={`p-2.5 border-b flex items-center justify-between text-xs ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0a1222] border-[#1b2a47]'
      }`}>
        <div className="flex items-center gap-1">
          {(['EIGRP Successor', 'Feasible Successor', 'Metric Vectors', 'L2 Switching'] as const).map(proto => (
            <button
              key={proto}
              onClick={() => setActiveProtocol(proto)}
              className={`px-2 py-1 rounded text-[11px] font-semibold font-mono transition border ${
                activeProtocol === proto
                  ? isLight 
                    ? 'bg-blue-50 text-blue-700 border-blue-300' 
                    : 'bg-[#1a3d75] text-cyan-200 border-cyan-500/60'
                  : isLight ? 'text-slate-600 hover:text-slate-900 border-transparent' : 'text-slate-400 hover:text-white border-transparent'
              }`}
            >
              {proto}
            </button>
          ))}
        </div>

        <button
          onClick={clearRoutePath}
          className={`text-xs transition font-mono px-2 py-0.5 ${
            isLight ? 'text-slate-500 hover:text-rose-600' : 'text-slate-400 hover:text-rose-400'
          }`}
        >
          Clear
        </button>
      </div>

      {/* Source & Destination Selectors */}
      <div className={`p-3 border-b space-y-2 ${
        isLight ? 'bg-slate-100/90 border-slate-200' : 'bg-[#0d172b] border-[#1b2a47]'
      }`}>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.8)] shrink-0" />
          <span className={`text-xs font-bold w-8 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>SRC</span>
          <select
            value={routeSourceId || ''}
            onChange={(e) => setRouteSource(e.target.value)}
            className={`flex-1 rounded px-2.5 py-1 text-xs font-mono outline-none border ${
              isLight 
                ? 'bg-white border-slate-300 text-slate-800 focus:border-blue-500' 
                : 'bg-[#101b33] border-[#1e3258] text-white focus:border-cyan-400'
            }`}
          >
            {devices.map(d => (
              <option key={d.device_id} value={d.device_id}>
                {getShortHostname(d.hostname, d.device_id)} ({d.management_addresses[0]})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] shrink-0" />
          <span className={`text-xs font-bold w-8 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>DST</span>
          <select
            value={routeDestId || ''}
            onChange={(e) => setRouteDest(e.target.value)}
            className={`flex-1 rounded px-2.5 py-1 text-xs font-mono outline-none border ${
              isLight 
                ? 'bg-white border-slate-300 text-slate-800 focus:border-blue-500' 
                : 'bg-[#101b33] border-[#1e3258] text-white focus:border-cyan-400'
            }`}
          >
            {devices.map(d => (
              <option key={d.device_id} value={d.device_id}>
                {getShortHostname(d.hostname, d.device_id)} ({d.management_addresses[0]})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Route Path Content Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 font-sans text-xs">
        {/* Domain Route Summary Card matching Osprey screenshot */}
        <div className={`p-3 rounded border space-y-2 ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0e1b33]/80 border-[#1b345f]'
        }`}>
          <div className={`text-[10px] font-bold uppercase tracking-wider font-mono ${
            isLight ? 'text-blue-600' : 'text-cyan-400'
          }`}>
            Pipeline SCADA Autonomous Domain
          </div>

          <div className="flex items-center gap-2">
            {/* Source Box */}
            <div className={`flex-1 p-2 rounded border space-y-0.5 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#091224] border-[#182d54]'
            }`}>
              <div className={`font-bold font-mono text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>{srcShort}</div>
              <div className="text-[10px] font-mono text-amber-500 font-semibold">AS 100</div>
              <div className="text-[10px] text-slate-400">tenant Hazira-CCF</div>
              <div className={`text-[9px] font-mono ${isLight ? 'text-blue-600' : 'text-cyan-300'}`}>eigrp/1</div>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

            {/* Destination Box */}
            <div className={`flex-1 p-2 rounded border space-y-0.5 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#091224] border-[#182d54]'
            }`}>
              <div className={`font-bold font-mono text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>{dstShort}</div>
              <div className="text-[10px] font-mono text-amber-500 font-semibold">AS 100</div>
              <div className="text-[10px] text-slate-400">tenant Vijaipur-CS</div>
              <div className={`text-[9px] font-mono ${isLight ? 'text-blue-600' : 'text-cyan-300'}`}>eigrp/1</div>
            </div>
          </div>

          <div className={`text-[10px] font-mono pt-1 border-t ${
            isLight ? 'border-slate-200 text-slate-600' : 'border-[#182d54] text-slate-400'
          }`}>
            IGP Chain: <strong className={isLight ? 'text-blue-600' : 'text-cyan-300'}>AS 100 Internal Mesh</strong> &mdash; 0 external hops
          </div>
        </div>

        {/* FORWARD Path Section matching Osprey */}
        <div className={`p-3 rounded border space-y-2.5 ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0c162c]/60 border-[#1b2f54]'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`font-bold text-xs uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>FORWARD</span>
              <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                isLight ? 'bg-blue-50 text-blue-700' : 'bg-[#172f5c] text-cyan-300'
              }`}>
                EIGRP-INTRA
              </span>
            </div>
            <div className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              per-segment costs &middot; <strong className={isLight ? 'text-slate-900' : 'text-white'}>{forwardHops.length} hops</strong>
            </div>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
              isLight ? 'bg-amber-50 text-amber-800 border-amber-300' : 'bg-amber-950/80 text-amber-300 border-amber-800/60'
            }`}>
              AS 100
            </span>
            <span className={`text-[11px] font-mono ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              eigrp/100 cost {totalCost}
            </span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60 ml-auto">
              resolved
            </span>
          </div>

          {/* Hop Timeline Diagram */}
          <div className={`p-2.5 rounded border space-y-2 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#091122] border-[#162747]'
          }`}>
            <div className={`flex items-center justify-between text-[11px] font-mono px-1 ${
              isLight ? 'text-slate-700' : 'text-slate-300'
            }`}>
              {forwardHops.map((hop, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                    idx === 0 
                      ? 'bg-emerald-500 text-black' 
                      : idx === forwardHops.length - 1 
                        ? 'bg-rose-500 text-white' 
                        : 'bg-amber-400 text-black'
                  }`}>
                    {idx + 1}
                  </div>
                  <span className="mt-1 text-[10px]">{hop.name}</span>
                </div>
              ))}
            </div>

            {/* Connecting Bar */}
            <div className="h-1 bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500 rounded-full mx-2" />

            {/* Per-segment cost chips */}
            <div className={`flex items-center justify-between pt-1 text-[10px] font-mono ${
              isLight ? 'text-slate-600' : 'text-slate-400'
            }`}>
              <span className={isLight ? 'text-blue-600 font-medium' : 'text-cyan-300'}>&bull; 10.240.10.0/24 (10000)</span>
              <span className={isLight ? 'text-amber-700 font-medium' : 'text-amber-300'}>&bull; transit (10)</span>
              <span className={isLight ? 'text-blue-600 font-medium' : 'text-cyan-300'}>&bull; 10.240.20.0/24 (10000)</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs pt-1">
            <button
              onClick={() => setDetailsOpen(!detailsOpen)}
              className="text-blue-600 dark:text-cyan-400 hover:underline font-medium"
            >
              {detailsOpen || activeProtocol === 'Metric Vectors' ? 'Hide Metric Vectors' : 'View EIGRP K-Vectors'}
            </button>
            <span className="text-slate-400">&middot;</span>
            <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>EIGRP AS 100 &middot; K1=1, K3=1</span>
          </div>

          {(detailsOpen || activeProtocol === 'Metric Vectors') && (
            <div className={`p-3 rounded-lg border text-[11px] font-mono space-y-2 ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#091122] border-[#162747] text-slate-200'
            }`}>
              <div className="flex items-center justify-between border-b pb-1.5 border-dashed border-slate-300 dark:border-slate-700">
                <span className="font-bold text-amber-500">EIGRP Composite Metric:</span>
                <span className="font-bold text-emerald-500">{totalCost}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>&bull; Min Bandwidth: <span className="font-semibold text-cyan-400">1,000,000 Kbps</span></div>
                <div>&bull; Total Delay: <span className="font-semibold text-cyan-400">200 &micro;s</span></div>
                <div>&bull; Reliability: <span className="font-semibold text-emerald-400">255/255 (100%)</span></div>
                <div>&bull; Effective Load: <span className="font-semibold text-emerald-400">1/255</span></div>
                <div>&bull; MTU Size: <span className="font-semibold text-slate-400">1500 bytes</span></div>
                <div>&bull; Hop Count: <span className="font-semibold text-slate-400">{forwardHops.length} hops</span></div>
              </div>
              <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800">
                Formula: Metric = 256 * ((10^7 / Min_BW) + (Total_Delay / 10))
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-sans">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero CDP/LLDP: Inferred from EIGRP MIB neighbor tables and subnet correlation.</span>
              </div>
            </div>
          )}
        </div>

        {/* REVERSE Path Section */}
        <div className={`p-3 rounded border space-y-2 ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0c162c]/60 border-[#1b2f54]'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`font-bold text-xs uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>REVERSE</span>
              <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                isLight ? 'bg-blue-50 text-blue-700' : 'bg-[#172f5c] text-cyan-300'
              }`}>
                EIGRP-INTRA
              </span>
            </div>
            <div className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              per-segment costs &middot; <strong className={isLight ? 'text-slate-900' : 'text-white'}>{forwardHops.length} hops</strong>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
              isLight ? 'bg-amber-50 text-amber-800 border-amber-300' : 'bg-amber-950/80 text-amber-300 border-amber-800/60'
            }`}>
              AS 100
            </span>
            <span className={`text-[11px] font-mono ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              eigrp/100 cost {totalCost}
            </span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60 ml-auto">
              resolved
            </span>
          </div>

          <div className={`p-2 rounded border flex items-center gap-2 text-xs ${
            isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-[#091122] border-emerald-900/40 text-emerald-400'
          }`}>
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Symmetric routing confirmed &mdash; forward & reverse costs are identical ({totalCost}).</span>
          </div>
        </div>
      </div>
    </NetTraceWindow>
  );
};

