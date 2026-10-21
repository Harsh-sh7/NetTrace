import React, { useState } from 'react';
import { 
  ChevronDown, 
  Search, 
  Clock, 
  Activity, 
  AlertTriangle,
  GitFork,
  CheckCircle2,
  Grid
} from 'lucide-react';
import { useTopology } from '../../context/TopologyContext';
import { getShortHostname } from '../topology/DeviceNode';

export const NetTraceFooter: React.FC = () => {
  const { 
    devices, 
    relationships, 
    alerts, 
    layoutMode, 
    setLayoutMode, 
    toggles, 
    setToggle, 
    toggleRoutePath, 
    toggleActivityLog,
    openDeviceInspector,
    theme,
    lastPollTime
  } = useTopology();

  const isLight = theme === 'light';
  const [layoutDropdownOpen, setLayoutDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const openAlertsCount = alerts.filter(a => a.investigation_status === 'OPEN').length;
  const isHealthy = openAlertsCount === 0;

  const filteredDevices = searchQuery
    ? devices.filter(d => 
        d.hostname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.management_addresses.some(ip => ip.includes(searchQuery)) ||
        d.model.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <footer className={`h-9 px-5 border-t flex items-center justify-between select-none z-30 text-xs font-sans transition-colors duration-200 ${
      isLight ? 'bg-slate-50/90 border-slate-200 text-slate-700' : 'bg-[#090f1d] border-[#141f36] text-slate-300'
    }`}>
      {/* Left Section: Layout Selector, Search Input, Quick Toggles */}
      <div className="flex items-center gap-3">
        {/* Layout Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setLayoutDropdownOpen(!layoutDropdownOpen)}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-xs transition border cursor-pointer ${
              isLight 
                ? 'bg-white border-slate-300 hover:bg-slate-50 text-slate-800' 
                : 'bg-[#10192e] border-[#1b2b4d] hover:bg-[#162544] text-slate-200'
            }`}
          >
            <span>
              {layoutMode === 'force-directed' ? 'Force-Directed' : layoutMode === 'radial' ? 'Radial Topology' : 'Hierarchical'}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {layoutDropdownOpen && (
            <div className={`absolute bottom-full mb-1 left-0 w-44 rounded shadow-2xl p-1 z-50 text-xs border ${
              isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0c1629] border-[#1e3054] text-slate-200'
            }`}>
              <button
                onClick={() => {
                  setLayoutMode('force-directed');
                  setLayoutDropdownOpen(false);
                }}
                className={`w-full text-left px-2 py-1.5 rounded transition ${
                  layoutMode === 'force-directed' 
                    ? 'bg-blue-600 text-white font-bold' 
                    : isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-[#152749]'
                }`}
              >
                Force-Directed
              </button>
              <button
                onClick={() => {
                  setLayoutMode('radial');
                  setLayoutDropdownOpen(false);
                }}
                className={`w-full text-left px-2 py-1.5 rounded transition ${
                  layoutMode === 'radial' 
                    ? 'bg-blue-600 text-white font-bold' 
                    : isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-[#152749]'
                }`}
              >
                Radial Topology
              </button>
              <button
                onClick={() => {
                  setLayoutMode('hierarchical');
                  setLayoutDropdownOpen(false);
                }}
                className={`w-full text-left px-2 py-1.5 rounded transition ${
                  layoutMode === 'hierarchical' 
                    ? 'bg-blue-600 text-white font-bold' 
                    : isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-[#152749]'
                }`}
              >
                Hierarchical Mesh
              </button>
            </div>
          )}
        </div>

        {/* Search Input for fast OT node discovery */}
        <div className="relative">
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded w-48 text-xs border ${
            isLight 
              ? 'bg-white border-slate-300 text-slate-800 focus-within:border-blue-500' 
              : 'bg-[#10192e] border-[#1b2b4d] text-slate-300 focus-within:border-cyan-500'
          }`}>
            <Search className="w-3 h-3 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              placeholder="Search devices, IPs..."
              className={`bg-transparent border-none outline-none w-full text-xs font-mono placeholder:text-slate-400 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            />
          </div>

          {searchFocused && filteredDevices.length > 0 && (
            <div className={`absolute bottom-full mb-1 left-0 w-64 rounded shadow-2xl p-1 z-50 text-xs font-sans max-h-56 overflow-y-auto border ${
              isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0c1629] border-[#1e3054] text-slate-200'
            }`}>
              {filteredDevices.map(d => (
                <button
                  key={d.device_id}
                  onClick={() => {
                    openDeviceInspector(d.device_id);
                    setSearchQuery('');
                  }}
                  className={`w-full text-left p-1.5 rounded flex items-center justify-between transition cursor-pointer ${
                    isLight ? 'hover:bg-slate-100' : 'hover:bg-[#152749]'
                  }`}
                >
                  <div>
                    <span className={`font-bold ${isLight ? 'text-blue-600' : 'text-cyan-300'}`}>
                      {getShortHostname(d.hostname, d.device_id)}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">{d.management_addresses[0]}</span>
                  </div>
                  <span className={`text-[9px] px-1 rounded font-mono ${
                    isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {d.device_type}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Essential Quick Toggles: Snap, Path, L2, Labels (Clean & Workable - no dead controls) */}
        <div className={`flex items-center gap-1.5 pl-2 border-l ${isLight ? 'border-slate-300' : 'border-[#192644]'}`}>
          <button
            onClick={() => setToggle('snap')}
            title="Toggle Grid Snapping"
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition border cursor-pointer ${
              toggles.snap 
                ? isLight 
                  ? 'bg-blue-50 text-blue-700 font-bold border-blue-300' 
                  : 'bg-[#183460] text-cyan-300 font-bold border-cyan-700/50' 
                : isLight ? 'text-slate-600 hover:text-slate-900 border-transparent' : 'text-slate-400 hover:text-white border-transparent'
            }`}
          >
            <span className={`w-2 h-2 rounded-sm ${isLight ? 'bg-blue-600' : 'bg-cyan-400'}`} />
            <span>Snap</span>
          </button>

          <button
            onClick={() => toggleRoutePath()}
            title="Toggle EIGRP Route Path Analyzer"
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition border cursor-pointer ${
              toggles.path 
                ? isLight
                  ? 'bg-amber-100 text-amber-800 font-bold border-amber-300'
                  : 'bg-amber-950 text-amber-300 font-bold border-amber-600/50' 
                : isLight ? 'text-slate-600 hover:text-slate-900 border-transparent' : 'text-slate-400 hover:text-white border-transparent'
            }`}
          >
            <GitFork className="w-3 h-3 text-amber-500" />
            <span>Path</span>
          </button>

          <button
            onClick={() => setToggle('l2')}
            title="Toggle Layer 2 Switch Port Links"
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition border cursor-pointer ${
              toggles.l2 
                ? isLight
                  ? 'bg-blue-50 text-blue-700 font-bold border-blue-300'
                  : 'bg-[#183460] text-cyan-300 font-bold border-cyan-700/50' 
                : isLight ? 'text-slate-600 hover:text-slate-900 border-transparent' : 'text-slate-400 hover:text-white border-transparent'
            }`}
          >
            <span>L2 Links</span>
          </button>

          <button
            onClick={() => setToggle('labels')}
            title="Toggle IP and Interface Labels"
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition border cursor-pointer ${
              toggles.labels 
                ? isLight
                  ? 'bg-blue-50 text-blue-700 font-bold border-blue-300'
                  : 'bg-[#183460] text-cyan-300 font-bold border-cyan-700/50' 
                : isLight ? 'text-slate-600 hover:text-slate-900 border-transparent' : 'text-slate-400 hover:text-white border-transparent'
            }`}
          >
            <span>Labels</span>
          </button>
        </div>
      </div>

      {/* Right Section: Telemetry Counters, Health Status, Time Travel, Activity Toggle */}
      <div className="flex items-center gap-3">
        {/* Device & Link Count */}
        <div className={`text-[11px] font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
          <span>4 GAIL Areas</span>
          <span className="mx-1">&middot;</span>
          <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{devices.length} devices</span>
          <span className="mx-1">&middot;</span>
          <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{relationships.length} links</span>
          <span className="mx-1">&middot;</span>
          <span className={isLight ? 'text-blue-600 font-medium' : 'text-cyan-400'}>100% SNMPv3</span>
        </div>

        {/* Health Indicator */}
        <div className={`flex items-center gap-1 text-[11px] pl-2 border-l ${isLight ? 'border-slate-300' : 'border-[#192644]'}`}>
          {isHealthy ? (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold font-sans">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              Healthy
            </span>
          ) : (
            <span className="flex items-center gap-1 text-rose-500 font-semibold animate-pulse font-sans">
              <AlertTriangle className="w-3 h-3 text-rose-500" />
              {openAlertsCount} Alert{openAlertsCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Last Poll / Telemetry status */}
        <div className={`flex items-center gap-1 text-[11px] font-mono pl-2 border-l ${isLight ? 'border-slate-300 text-slate-600' : 'border-[#192644] text-slate-400'}`}>
          <Clock className="w-3 h-3 text-slate-400" />
          <span>{lastPollTime.split(' ')[1] || 'Live'}</span>
        </div>

        {/* Activity Drawer Toggle */}
        <button
          onClick={() => toggleActivityLog()}
          className={`flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[11px] transition border cursor-pointer ${
            isLight
              ? 'bg-white hover:bg-slate-50 border-slate-300 text-blue-600'
              : 'bg-[#10192e] hover:bg-[#172646] border-[#1b2b4d] text-cyan-300'
          }`}
          title="Toggle NetTrace Activity & Event Stream"
        >
          <Activity className={`w-3 h-3 ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
          <span>Activity</span>
          <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
        </button>
      </div>
    </footer>
  );
};
