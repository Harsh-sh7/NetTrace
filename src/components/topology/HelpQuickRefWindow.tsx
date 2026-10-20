import React from 'react';
import { HelpCircle, ShieldCheck, GitFork, Terminal, Compass, Zap, Cpu, Network } from 'lucide-react';
import { NetTraceWindow } from './NetTraceWindow';
import { useTopology } from '../../context/TopologyContext';

export const HelpQuickRefWindow: React.FC = () => {
  const { helpOpen, toggleHelp, theme } = useTopology();
  const isLight = theme === 'light';

  if (!helpOpen) return null;

  const titleNode = (
    <div className="flex items-center gap-2">
      <HelpCircle className={`w-3.5 h-3.5 ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
      <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>NetTrace &bull; Quick Reference & SCADA Ops</span>
    </div>
  );

  return (
    <NetTraceWindow
      id="help-quick-ref"
      title={titleNode}
      isOpen={helpOpen}
      onClose={() => toggleHelp(false)}
      initialX={window.innerWidth > 950 ? Math.floor(window.innerWidth / 2 - 250) : 40}
      initialY={100}
      initialWidth={500}
      initialHeight={480}
      zIndex={65}
    >
      <div className={`flex-1 overflow-y-auto p-4 space-y-3.5 text-xs font-sans ${isLight ? 'bg-slate-50 text-slate-800' : 'bg-[#09101d] text-slate-200'}`}>
        {/* Header section */}
        <div className={`p-3 rounded-lg border ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0d1627] border-[#1e2f4f]'}`}>
          <div className="flex items-center gap-2 text-sm font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className={isLight ? 'text-slate-900' : 'text-white'}>NetTrace Core Operating Principles</span>
          </div>
          <p className={`mt-1 leading-relaxed text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Built for mission-critical GAIL India Pipeline SCADA/OT networks. Enforces strict zero-discovery broadcast protocol compliance, preventing adversarial mapping while maintaining real-time topology intelligence.
          </p>
        </div>

        {/* Shortcuts & Interactions */}
        <div className={`p-3 rounded-lg border space-y-2 ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0d1627] border-[#1e2f4f]'}`}>
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-blue-600 dark:text-cyan-400">
            <Compass className="w-3.5 h-3.5" />
            <span>Interactive Controls</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className={`p-2 rounded border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#101b33] border-[#1b2c4e]'}`}>
              <strong className={isLight ? 'text-slate-900' : 'text-white'}>Left-Click Device</strong>
              <div className="text-slate-500 mt-0.5">Opens Device Inspector with interfaces, telemetry, and live traffic.</div>
            </div>
            <div className={`p-2 rounded border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#101b33] border-[#1b2c4e]'}`}>
              <strong className={isLight ? 'text-slate-900' : 'text-white'}>Right-Click Device</strong>
              <div className="text-slate-500 mt-0.5">Quick context menu: set route SRC/DST, SSH terminal, copy IP.</div>
            </div>
            <div className={`p-2 rounded border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#101b33] border-[#1b2c4e]'}`}>
              <strong className={isLight ? 'text-slate-900' : 'text-white'}>Left-Click Link</strong>
              <div className="text-slate-500 mt-0.5">Opens Link Inspector showing Endpoints A & Z, MAC, and throughput.</div>
            </div>
            <div className={`p-2 rounded border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#101b33] border-[#1b2c4e]'}`}>
              <strong className={isLight ? 'text-slate-900' : 'text-white'}>Bottom Search</strong>
              <div className="text-slate-500 mt-0.5">Search by hostname or IP to instantly locate and inspect devices.</div>
            </div>
          </div>
        </div>

        {/* Protocol Architecture */}
        <div className={`p-3 rounded-lg border space-y-2 ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0d1627] border-[#1e2f4f]'}`}>
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-amber-600 dark:text-amber-400">
            <Network className="w-3.5 h-3.5" />
            <span>Telemetry & Routing Specifications</span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
              <div>
                <strong className={isLight ? 'text-slate-900' : 'text-white'}>Zero CDP / Zero LLDP:</strong> No neighbor broadcast discovery packets are transmitted over the industrial OT bus.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 shrink-0" />
              <div>
                <strong className={isLight ? 'text-slate-900' : 'text-white'}>EIGRP AS 100 Routing:</strong> Deterministic composite metric: <code className="px-1 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">256 * (10^7/BW + Delay/10)</code>.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 shrink-0" />
              <div>
                <strong className={isLight ? 'text-slate-900' : 'text-white'}>SNMPv3 AuthPriv:</strong> Cryptographic SHA-256 HMAC authentication and AES-256 link encryption for all MIB polling.
              </div>
            </div>
          </div>
        </div>

        {/* Scenarios */}
        <div className={`p-3 rounded-lg border space-y-1.5 ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0d1627] border-[#1e2f4f]'}`}>
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-rose-600 dark:text-rose-400">
            <Zap className="w-3.5 h-3.5" />
            <span>Simulation Scenarios (Tools Menu)</span>
          </div>
          <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Use the <strong>Tools &rarr; Inject Scenarios</strong> menu to simulate live OT events: inject a Rogue Raspberry Pi tap, trigger a core gas pipeline trunk fiber cut with automatic EIGRP convergence, or simulate metering RTU telemetry loss.
          </p>
        </div>
      </div>
    </NetTraceWindow>
  );
};
