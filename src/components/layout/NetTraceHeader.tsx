import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal, 
  GitFork, 
  Radio, 
  Sun, 
  Moon,
  HelpCircle,
  Activity,
  ShieldCheck,
  Wrench,
  ChevronDown,
  RotateCcw,
  CheckCircle2,
  SlidersHorizontal,
  Eye
} from 'lucide-react';
import { useTopology } from '../../context/TopologyContext';
import { SCENARIO_DEFINITIONS } from '../../engine/simulationEngine';

export const NetTraceHeader: React.FC = () => {
  const { 
    alerts, 
    triggerScenario, 
    resetToInitial, 
    freezeCurrentAsBaseline,
    triggerManualPoll,
    toggleRoutePath,
    openSshTerminal,
    activeScenario,
    setActiveScreen,
    activeScreen,
    toggles,
    setToggle,
    theme,
    toggleTheme,
    toggleHelp,
    fitView
  } = useTopology();

  const isLight = theme === 'light';
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const openAlertsCount = alerts.filter(a => a.investigation_status === 'OPEN').length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (menuName: string) => {
    setActiveMenu(prev => prev === menuName ? null : menuName);
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'topology', label: 'Topology', icon: GitFork },
    { id: 'inventory', label: 'Inventory' },
    { id: 'alerts', label: 'Alerts', badge: openAlertsCount },
    { id: 'history', label: 'Diff' },
    { id: 'reports', label: 'Reports' },
    { id: 'configuration', label: 'Config' },
  ];

  return (
    <header 
      ref={headerRef}
      className={`h-14 px-5 border-b flex items-center justify-between select-none z-40 text-xs font-sans transition-colors duration-200 ${
        isLight 
          ? 'bg-white/95 border-slate-200/90 text-slate-800 shadow-sm backdrop-blur-md' 
          : 'bg-[#090f1d]/95 border-[#15233c] text-slate-100 shadow-lg backdrop-blur-md'
      }`}
    >
      {/* Left: NetTrace Clean Brand Identity */}
      <div className="flex items-center gap-3">
        <div 
          className="flex items-center gap-2.5 cursor-pointer group" 
          onClick={() => setActiveScreen('topology')}
          title="NetTrace SCADA Topology Intelligence"
        >
          {/* Brand Icon */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.4)] group-hover:shadow-[0_0_18px_rgba(6,182,212,0.7)] transition-all duration-300">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="6" r="3" />
              <circle cx="18" cy="18" r="3" />
              <path d="M8.7 16.3l6.6-8.6" />
              <path d="M8.7 18h6.6" />
            </svg>
          </div>

          {/* Brand Name & Tag in clean single row */}
          <div className="flex items-center gap-2">
            <span className={`text-base font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              NetTrace
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              SCADA / OT
            </span>
          </div>
        </div>
      </div>

      {/* Center: Spacious, Modern Segmented Navigation Bar */}
      <nav className={`flex items-center gap-1 p-1 rounded-xl border transition-colors ${
        isLight ? 'bg-slate-100/80 border-slate-200/80' : 'bg-[#060c18]/90 border-[#15233c]'
      }`}>
        {navItems.map((item) => {
          const isActive = activeScreen === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveScreen(item.id as any)}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                isActive
                  ? isLight 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'bg-[#18325a] text-cyan-300 shadow-md'
                  : isLight 
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-white/60' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{item.label}</span>
              {typeof item.badge === 'number' && item.badge > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-mono text-[9px] font-bold shadow-sm">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Right: Clean, Uncluttered Utility Controls */}
      <div className="flex items-center gap-2.5">
        {/* Topology Tools Dropdown (Combined Tools & Diagnostic Actions) */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('tools')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
              activeMenu === 'tools'
                ? isLight 
                  ? 'bg-slate-100 text-blue-600 border-slate-300 shadow-sm' 
                  : 'bg-[#152749] text-cyan-300 border-[#223d6f] shadow'
                : isLight 
                  ? 'border-slate-200 hover:bg-slate-100 text-slate-700' 
                  : 'border-[#1b2b48] hover:bg-[#121f37] text-slate-300'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-blue-500 dark:text-cyan-400" />
            <span>Tools</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {activeMenu === 'tools' && (
            <div className={`absolute right-0 mt-2 w-64 rounded-xl shadow-2xl p-1.5 z-50 text-xs border ${
              isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0c1629] border-[#1d2f50] text-slate-200'
            }`}>
              <div className="px-2.5 py-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                Diagnostics & CLI
              </div>
              <button
                onClick={() => {
                  toggleRoutePath(true);
                  setActiveMenu(null);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded text-amber-500 font-medium flex items-center gap-2 transition ${isLight ? 'hover:bg-amber-50' : 'hover:bg-[#18325a]'}`}
              >
                <GitFork className="w-3.5 h-3.5" />
                <span>EIGRP Route Path Analyzer</span>
              </button>
              <button
                onClick={() => {
                  openSshTerminal('DEV-RTR-CCF-01');
                  setActiveMenu(null);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded text-cyan-600 dark:text-cyan-300 font-medium flex items-center gap-2 transition ${isLight ? 'hover:bg-cyan-50' : 'hover:bg-[#18325a]'}`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>SSH Terminal Console</span>
              </button>
              <button
                onClick={() => {
                  triggerManualPoll();
                  setActiveMenu(null);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded flex items-center gap-2 transition ${isLight ? 'hover:bg-slate-100' : 'hover:bg-[#18325a]'}`}
              >
                <Radio className="w-3.5 h-3.5 text-emerald-500" />
                <span>Force SNMPv3 Discovery Poll</span>
              </button>
              <button
                onClick={() => {
                  freezeCurrentAsBaseline();
                  setActiveMenu(null);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded text-emerald-600 dark:text-emerald-400 flex items-center justify-between transition ${isLight ? 'hover:bg-emerald-50' : 'hover:bg-[#18325a]'}`}
              >
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Freeze Baseline Snapshot</span>
                </span>
              </button>

              <div className={`my-1 border-t ${isLight ? 'border-slate-200' : 'border-[#1d2f50]'}`} />
              <div className="px-2.5 py-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                View & Canvas Options
              </div>
              <button
                onClick={() => {
                  setToggle('labels');
                  setActiveMenu(null);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between transition ${isLight ? 'hover:bg-slate-100' : 'hover:bg-[#18325a]'}`}
              >
                <span className="flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>IP Address Labels</span>
                </span>
                <span className="font-mono text-cyan-500 font-bold">{toggles.labels ? 'ON' : 'OFF'}</span>
              </button>
              <button
                onClick={() => {
                  setToggle('l2');
                  setActiveMenu(null);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between transition ${isLight ? 'hover:bg-slate-100' : 'hover:bg-[#18325a]'}`}
              >
                <span className="flex items-center gap-2">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                  <span>L2 Switch Links</span>
                </span>
                <span className="font-mono text-cyan-500 font-bold">{toggles.l2 ? 'ON' : 'OFF'}</span>
              </button>
              <button
                onClick={() => {
                  fitView();
                  setActiveMenu(null);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between transition ${isLight ? 'hover:bg-slate-100' : 'hover:bg-[#18325a]'}`}
              >
                <span>Fit Canvas to Viewport</span>
              </button>

              <div className={`my-1 border-t ${isLight ? 'border-slate-200' : 'border-[#1d2f50]'}`} />
              <div className="px-2.5 py-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                Simulation Scenarios
              </div>
              {SCENARIO_DEFINITIONS.map(sc => (
                <button
                  key={sc.id}
                  onClick={() => {
                    triggerScenario(sc.id);
                    setActiveMenu(null);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] flex items-center justify-between transition ${
                    activeScenario === sc.id 
                      ? 'bg-blue-600 text-white font-bold' 
                      : isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-[#18325a] text-slate-300'
                  }`}
                >
                  <span>{sc.title}</span>
                  <span className={`text-[9px] px-1 rounded font-mono ${isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-900 text-slate-400'}`}>
                    {sc.badge}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* SCADA Ops Help Quick Guide */}
        <button
          onClick={() => toggleHelp(true)}
          className={`w-8 h-8 rounded-lg flex items-center justify-center border transition cursor-pointer ${
            isLight
              ? 'border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900'
              : 'border-[#1b2b48] hover:bg-[#121f37] text-slate-400 hover:text-white'
          }`}
          title="Open SCADA Ops Quick Reference & Architecture Guide"
        >
          <HelpCircle className="w-4 h-4 text-blue-500 dark:text-cyan-400" />
        </button>

        {/* Minimalist Theme Toggle (Clean Icon Button - No Giant Banner) */}
        <button
          onClick={toggleTheme}
          title={isLight ? "Switch to Dark Blueprint Theme" : "Switch to Light Engineering Theme"}
          className={`w-8 h-8 rounded-lg flex items-center justify-center border transition cursor-pointer ${
            isLight
              ? 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-amber-600 shadow-sm'
              : 'border-[#1b2b48] bg-[#0c1629] hover:bg-[#14233e] text-cyan-400'
          }`}
        >
          {isLight ? (
            <Sun className="w-4 h-4 text-amber-500" />
          ) : (
            <Moon className="w-4 h-4 text-cyan-400" />
          )}
        </button>

        {/* Admin System Profile Menu */}
        <div className="relative pl-1">
          <button
            onClick={() => toggleDropdown('admin')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition cursor-pointer text-xs ${
              activeMenu === 'admin'
                ? isLight 
                  ? 'bg-slate-100 border-slate-300 text-slate-900' 
                  : 'bg-[#152749] border-[#223d6f] text-cyan-300'
                : isLight 
                  ? 'border-slate-200 hover:bg-slate-100 text-slate-700' 
                  : 'border-[#1b2b48] hover:bg-[#121f37] text-slate-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold">admin</span>
            <ChevronDown className="w-3 h-3 text-slate-400 opacity-60" />
          </button>

          {activeMenu === 'admin' && (
            <div className={`absolute right-0 mt-2 w-64 rounded-xl shadow-2xl p-3 z-50 text-xs space-y-2 border ${
              isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0c1629] border-[#1d2f50] text-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-cyan-600 dark:text-cyan-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>NetTrace System</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                  ONLINE
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                GAIL SCADA Pipeline Network Discovery Engine
              </div>
              <div className={`my-1 border-t ${isLight ? 'border-slate-200' : 'border-[#1d2f50]'}`} />
              <div className="text-[11px] space-y-1 text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Policy:</span>
                  <strong className="text-amber-500">Zero CDP / LLDP</strong>
                </div>
                <div className="flex justify-between">
                  <span>Routing:</span>
                  <strong className="text-blue-500 dark:text-blue-400">EIGRP AS 100</strong>
                </div>
                <div className="flex justify-between">
                  <span>Security:</span>
                  <strong className="text-emerald-500">SNMPv3 AuthPriv</strong>
                </div>
              </div>
              <div className={`my-1 border-t ${isLight ? 'border-slate-200' : 'border-[#1d2f50]'}`} />
              <button
                onClick={() => {
                  setActiveScreen('configuration');
                  setActiveMenu(null);
                }}
                className={`w-full text-left px-2 py-1.5 rounded text-cyan-600 dark:text-cyan-400 font-semibold transition ${isLight ? 'hover:bg-cyan-50' : 'hover:bg-[#18325a]'}`}
              >
                Configuration & Credentials &rarr;
              </button>
              <button
                onClick={() => {
                  resetToInitial();
                  setActiveMenu(null);
                }}
                className={`w-full text-left px-2 py-1.5 rounded text-rose-500 flex items-center gap-1.5 transition ${isLight ? 'hover:bg-rose-50' : 'hover:bg-slate-800'}`}
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Clean Topology</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

