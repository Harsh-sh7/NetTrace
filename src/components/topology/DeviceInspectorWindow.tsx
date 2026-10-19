import React, { useState } from 'react';
import { 
  Terminal, 
  MapPin, 
  Navigation, 
  RefreshCw, 
  ChevronRight, 
  ChevronDown,
  Layers,
  Network,
  Cpu,
  ShieldCheck,
  Activity,
  HardDrive
} from 'lucide-react';
import { NetTraceWindow } from './NetTraceWindow';
import { useTopology } from '../../context/TopologyContext';
import { getShortHostname } from './DeviceNode';

export const DeviceInspectorWindow: React.FC = () => {
  const { 
    deviceInspectorOpen, 
    inspectedDeviceId, 
    closeDeviceInspector, 
    devices, 
    openSshTerminal,
    setRouteSource,
    setRouteDest,
    triggerManualPoll,
    routeSourceId,
    routeDestId,
    theme
  } = useTopology();

  const isLight = theme === 'light';
  const [activeTab, setActiveTab] = useState<'overview' | 'interfaces' | 'neighbors' | 'netflow' | 'traffic'>('overview');
  const [alertsExpanded, setAlertsExpanded] = useState(false);
  const [eventsExpanded, setEventsExpanded] = useState(false);

  const device = devices.find(d => d.device_id === inspectedDeviceId) || devices[0];

  if (!deviceInspectorOpen || !device) return null;

  const shortName = getShortHostname(device.hostname, device.device_id);
  const mgmtIp = device.management_addresses[0] || '10.240.10.1';
  const isRouter = device.device_type === 'ROUTER';
  const isSwitch = device.device_type === 'SWITCH';

  const isCurrentSrc = routeSourceId === device.device_id;
  const isCurrentDst = routeDestId === device.device_id;

  const titleNode = (
    <div className="flex items-center gap-2">
      <span className={`font-mono font-bold ${isLight ? 'text-blue-600' : 'text-cyan-300'}`}>{shortName}</span>
      <span className={`text-[11px] font-normal ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Device Inspector</span>
    </div>
  );

  return (
    <NetTraceWindow
      id="device-inspector"
      title={titleNode}
      isOpen={deviceInspectorOpen}
      onClose={closeDeviceInspector}
      initialX={45}
      initialY={140}
      initialWidth={390}
      initialHeight={550}
      zIndex={50}
    >
      {/* Device Header Banner */}
      <div className={`p-3 border-b flex items-center justify-between ${
        isLight ? 'bg-slate-100/90 border-slate-200' : 'bg-[#0d172b] border-[#1b2a47]'
      }`}>
        <div className="flex items-center gap-2.5">
          {/* Mini 3D Cylinder Icon */}
          <div className="relative w-8 h-8 rounded-full bg-gradient-to-b from-blue-600 to-blue-900 border border-blue-400 flex items-center justify-center shadow-md">
            <Network className="w-4 h-4 text-cyan-200" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#0d172b]" />
          </div>

          <div>
            <div className={`text-sm font-bold tracking-tight flex items-center gap-1.5 ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              <span>{shortName}</span>
              <span className={`text-[11px] font-normal ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                ({device.hostname.replace('.gail.ot', '')})
              </span>
            </div>
            <div className={`text-[11px] font-mono flex items-center gap-1 ${
              isLight ? 'text-blue-600' : 'text-cyan-400'
            }`}>
              <span>{mgmtIp}</span>
              <span className={`text-[9px] px-1 py-0.2 rounded font-sans ${
                isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'
              }`}>loopback</span>
            </div>
          </div>
        </div>

        {/* Badges on right matching Osprey screenshot */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1">
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
              isLight ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-[#173059] text-cyan-300 border-[#234882]'
            }`}>
              EIGRP
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
              isLight ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-[#382b0e] text-amber-300 border-[#6b5217]'
            }`}>
              AS 100
            </span>
          </div>
          <span className={`text-[9px] font-sans ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            No CDP/LLDP
          </span>
        </div>
      </div>

      {/* Tabs matching Osprey */}
      <div className={`flex items-center border-b text-xs font-sans ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0c1527] border-[#1b2a47]'
      }`}>
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2 text-center font-medium transition relative ${
            activeTab === 'overview'
              ? isLight 
                ? 'text-blue-600 font-bold after:absolute after:bottom-0 after:left-2 after:right-2 after:h-[2px] after:bg-blue-600'
                : 'text-cyan-300 font-semibold after:absolute after:bottom-0 after:left-2 after:right-2 after:h-[2px] after:bg-cyan-400'
              : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('interfaces')}
          className={`flex-1 py-2 text-center font-medium transition relative ${
            activeTab === 'interfaces'
              ? isLight 
                ? 'text-blue-600 font-bold after:absolute after:bottom-0 after:left-2 after:right-2 after:h-[2px] after:bg-blue-600'
                : 'text-cyan-300 font-semibold after:absolute after:bottom-0 after:left-2 after:right-2 after:h-[2px] after:bg-cyan-400'
              : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Interfaces ({device.interfaces.length})
        </button>
        <button
          onClick={() => setActiveTab('neighbors')}
          className={`flex-1 py-2 text-center font-medium transition relative ${
            activeTab === 'neighbors'
              ? isLight 
                ? 'text-blue-600 font-bold after:absolute after:bottom-0 after:left-2 after:right-2 after:h-[2px] after:bg-blue-600'
                : 'text-cyan-300 font-semibold after:absolute after:bottom-0 after:left-2 after:right-2 after:h-[2px] after:bg-cyan-400'
              : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Neighbors ({device.eigrp_neighbors?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('netflow')}
          className={`flex-1 py-2 text-center font-medium transition relative ${
            activeTab === 'netflow'
              ? isLight 
                ? 'text-blue-600 font-bold after:absolute after:bottom-0 after:left-2 after:right-2 after:h-[2px] after:bg-blue-600'
                : 'text-cyan-300 font-semibold after:absolute after:bottom-0 after:left-2 after:right-2 after:h-[2px] after:bg-cyan-400'
              : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          NetFlow ({device.netflow_records?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('traffic')}
          className={`flex-1 py-2 text-center font-medium transition relative ${
            activeTab === 'traffic'
              ? isLight 
                ? 'text-blue-600 font-bold after:absolute after:bottom-0 after:left-2 after:right-2 after:h-[2px] after:bg-blue-600'
                : 'text-cyan-300 font-semibold after:absolute after:bottom-0 after:left-2 after:right-2 after:h-[2px] after:bg-cyan-400'
              : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Traffic
        </button>
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 font-sans text-xs">
        {activeTab === 'overview' && (
          <div className="space-y-3">
            {/* IDENTITY */}
            <div>
              <div className={`text-[10px] font-bold tracking-wider uppercase mb-1.5 flex items-center justify-between ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}>
                <span>IDENTITY</span>
                <span className={`text-[9px] font-mono ${isLight ? 'text-emerald-600 font-bold' : 'text-emerald-400'}`}>
                  Confidence: {device.identity_confidence}%
                </span>
              </div>
              <div className={`grid grid-cols-2 gap-y-1.5 p-2.5 rounded border font-sans ${
                isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0e192f]/60 border-[#1b2c4e]'
              }`}>
                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Router ID</span>
                <span className={`text-right font-mono font-bold ${isLight ? 'text-blue-600' : 'text-cyan-300'}`}>{mgmtIp}</span>

                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Management IP</span>
                <span className={`text-right font-mono flex items-center justify-end gap-1 ${isLight ? 'text-slate-800' : 'text-white'}`}>
                  {mgmtIp}
                  <span className={`text-[9px] px-1 py-0.2 rounded font-sans ${
                    isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-300'
                  }`}>loopback</span>
                </span>

                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Site Facility</span>
                <span className={`text-right ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{device.site_name}</span>

                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Status</span>
                <span className="text-right font-semibold text-emerald-500">{device.monitoring_status}</span>
              </div>
            </div>

            {/* PROTOCOLS & AREAS */}
            <div>
              <div className={`text-[10px] font-bold tracking-wider uppercase mb-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                PROTOCOLS & TELEMETRY
              </div>
              <div className={`space-y-1.5 p-2.5 rounded border ${
                isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0e192f]/60 border-[#1b2c4e]'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={isLight ? 'text-slate-700' : 'text-slate-300'}>EIGRP - AS 100</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                    isLight ? 'bg-amber-50 text-amber-800 border-amber-300' : 'bg-amber-950 text-amber-300 border-amber-800/60'
                  }`}>
                    Autonomous System 100
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                    isLight ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-[#172e54] text-cyan-200 border-cyan-800/40'
                  }`}>
                    10.240.0.0/16
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                    isLight ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-[#172e54] text-cyan-200 border-cyan-800/40'
                  }`}>
                    Area 0.0.0.0
                  </span>
                </div>
                <div className={`pt-1.5 border-t flex items-center justify-between text-[11px] ${isLight ? 'border-slate-200' : 'border-[#1b2c4e]'}`}>
                  <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>CDP / LLDP</span>
                  <span className="text-rose-500 font-mono font-semibold">DISABLED (Strict No-CDP)</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Telemetry Engine</span>
                  <span className={`font-mono font-medium ${isLight ? 'text-blue-600' : 'text-cyan-300'}`}>SNMPv3 AuthPriv (AES-256)</span>
                </div>
              </div>
            </div>

            {/* HARDWARE */}
            <div>
              <div className={`text-[10px] font-bold tracking-wider uppercase mb-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                HARDWARE & SPECIFICATION
              </div>
              <div className={`grid grid-cols-2 gap-y-1.5 p-2.5 rounded border ${
                isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0e192f]/60 border-[#1b2c4e]'
              }`}>
                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Type</span>
                <span className={`text-right font-medium ${isLight ? 'text-slate-800' : 'text-white'}`}>{device.device_type}</span>

                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Vendor</span>
                <span className={`text-right ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{device.vendor}</span>

                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Platform</span>
                <span className={`text-right font-mono font-medium ${isLight ? 'text-blue-600' : 'text-cyan-200'}`}>{device.model}</span>

                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Software</span>
                <span className={`text-right font-mono ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Cisco IOS-XE 17.6.3a</span>

                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Evidence</span>
                <span className="text-right text-emerald-500 font-mono">SNMPv3 + EIGRP + MAC</span>

                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>First Seen</span>
                <span className="text-right text-slate-400">1mo ago</span>

                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Last Seen</span>
                <span className="text-right text-slate-400">7m ago</span>
              </div>
            </div>

            {/* Expandable Alerts & Events */}
            <div className="space-y-1">
              <button
                onClick={() => setAlertsExpanded(!alertsExpanded)}
                className={`w-full flex items-center justify-between p-2 rounded border transition ${
                  isLight 
                    ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700' 
                    : 'bg-[#0e192f]/40 hover:bg-[#142340] border-[#1b2c4e] text-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {alertsExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                  <span className="font-bold text-[10px] uppercase tracking-wider">ALERTS</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.2 rounded ${isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-400'}`}>
                  0 Active
                </span>
              </button>

              <button
                onClick={() => setEventsExpanded(!eventsExpanded)}
                className={`w-full flex items-center justify-between p-2 rounded border transition ${
                  isLight 
                    ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700' 
                    : 'bg-[#0e192f]/40 hover:bg-[#142340] border-[#1b2c4e] text-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {eventsExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                  <span className="font-bold text-[10px] uppercase tracking-wider">EVENTS</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.2 rounded ${isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-400'}`}>
                  3 Logged
                </span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'interfaces' && (
          <div className="space-y-2">
            <div className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Network Ports ({device.interfaces.length})
            </div>
            <div className="space-y-1.5">
              {device.interfaces.map(iface => (
                <div 
                  key={iface.interface_id} 
                  className={`p-2.5 rounded border flex items-center justify-between transition ${
                    isLight 
                      ? 'bg-white border-slate-200 hover:border-blue-400 shadow-sm' 
                      : 'bg-[#0e192f]/60 border-[#1b2c4e] hover:border-cyan-500/50'
                  }`}
                >
                  <div>
                    <div className={`font-mono font-semibold text-xs flex items-center gap-1.5 ${
                      isLight ? 'text-blue-700' : 'text-cyan-300'
                    }`}>
                      <span>{iface.interface_name}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60 font-sans">
                        {iface.interface_status}
                      </span>
                    </div>
                    <div className={`text-[10px] font-mono mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      IP: {iface.ip_addresses[0] || 'Unnumbered / L2'}
                    </div>
                    <div className="text-[9px] font-mono text-slate-400">
                      MAC: {iface.mac_address}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-mono font-bold block ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                      {iface.speed_mbps ? `${iface.speed_mbps} Mbps` : '1 Gbps'}
                    </span>
                    <span className="text-[9px] text-slate-400 block">Full Duplex</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'neighbors' && (
          <div className="space-y-3">
            <div>
              <div className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center justify-between ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}>
                <span>EIGRP AS 100 Adjacencies</span>
                <span className={`text-[9px] font-mono ${isLight ? 'text-blue-600 font-bold' : 'text-cyan-400'}`}>No CDP/LLDP</span>
              </div>
              {device.eigrp_neighbors && device.eigrp_neighbors.length > 0 ? (
                <div className="space-y-1.5">
                  {device.eigrp_neighbors.map((nbr, idx) => (
                    <div key={idx} className={`p-2.5 rounded border space-y-1 ${
                      isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0e192f]/60 border-[#1b2c4e]'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`font-mono font-bold ${isLight ? 'text-blue-700' : 'text-cyan-300'}`}>
                          {nbr.neighbor_ip}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[9px] font-bold">
                          {nbr.state}
                        </span>
                      </div>
                      <div className={`text-[10px] flex items-center justify-between ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        <span>via {nbr.local_interface}</span>
                        <span>SRTT: {nbr.smooth_rtt_ms} ms</span>
                      </div>
                      <div className="text-[9px] text-slate-400 font-mono">
                        Holdtime: {nbr.hold_time_seconds}s | Uptime: {Math.floor(nbr.uptime_seconds / 3600)}h
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`p-3 rounded border text-center text-xs ${
                  isLight ? 'bg-white border-slate-200 text-slate-500' : 'bg-[#0e192f]/40 border-[#1b2c4e] text-slate-400'
                }`}>
                  No direct EIGRP adjacencies configured on this endpoint.
                </div>
              )}
            </div>

            {/* ARP Cache */}
            {device.arp_cache && device.arp_cache.length > 0 && (
              <div>
                <div className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Resolved ARP Cache ({device.arp_cache.length})
                </div>
                <div className="space-y-1">
                  {device.arp_cache.map((arp, idx) => (
                    <div key={idx} className={`p-2 rounded border flex items-center justify-between text-[11px] font-mono ${
                      isLight ? 'bg-white border-slate-200' : 'bg-[#0e192f]/40 border-[#1b2c4e]'
                    }`}>
                      <span className={isLight ? 'text-blue-700 font-bold' : 'text-cyan-300'}>{arp.ip_address}</span>
                      <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>{arp.mac_address}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'traffic' && (
          <div className="space-y-3">
            <div className={`p-3 rounded border space-y-2 ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0e192f]/80 border-[#1b2c4e]'
            }`}>
              <div className="flex items-center justify-between text-xs">
                <span className={`font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Throughput (E0/0)</span>
                <span className="font-mono text-emerald-500 font-bold">3.4 Kbps</span>
              </div>

              {/* Simulated Live SVG Sparkline */}
              <div className="h-20 w-full relative flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 200 60" fill="none">
                  <path
                    d="M 0 45 L 20 40 L 40 48 L 60 30 L 80 35 L 100 15 L 120 28 L 140 20 L 160 35 L 180 18 L 200 25"
                    stroke="#22c55e"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 0 45 L 20 40 L 40 48 L 60 30 L 80 35 L 100 15 L 120 28 L 140 20 L 160 35 L 180 18 L 200 25 L 200 60 L 0 60 Z"
                    fill="url(#sparkGrad)"
                    opacity="0.15"
                  />
                  <defs>
                    <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <div className={`grid grid-cols-3 gap-2 pt-2 border-t text-center font-mono text-[10px] ${
                isLight ? 'border-slate-200' : 'border-[#1b2c4e]'
              }`}>
                <div>
                  <div className="text-slate-400">Peak</div>
                  <div className={`font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>482.1K</div>
                </div>
                <div>
                  <div className="text-slate-400">Rate</div>
                  <div className="text-emerald-500 font-bold">1 pps</div>
                </div>
                <div>
                  <div className="text-slate-400">Drops</div>
                  <div className={isLight ? 'text-slate-700' : 'text-slate-300'}>0%</div>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'netflow' && (
          <div className="space-y-3 font-mono">
            <div className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#0e192f]/70 border-[#1b2c4e]'
            }`}>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                NETFLOW V9 / IPFIX EXPORTER FLOWS
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>

            {device.netflow_records && device.netflow_records.length > 0 ? (
              <div className="space-y-2">
                {device.netflow_records.map(flow => (
                  <div key={flow.flow_id} className={`p-2.5 rounded border space-y-1 text-xs ${
                    isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0e192f]/50 border-[#1b2c4e]'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`font-bold ${isLight ? 'text-blue-600' : 'text-cyan-300'}`}>
                        {flow.source_ip}:{flow.source_port} &rarr; {flow.destination_ip}:{flow.destination_port}
                      </span>
                      <span className="px-1 rounded bg-slate-800 text-[9px] text-slate-300">
                        {flow.protocol}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{flow.bytes.toLocaleString()} bytes &middot; {flow.packets} pkts</span>
                      <span>Next-Hop: {flow.next_hop}</span>
                    </div>
                    <div className="text-[9px] text-slate-500">
                      In: {flow.input_interface} &rarr; Out: {flow.output_interface}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`p-4 rounded border text-center text-xs ${
                isLight ? 'bg-white border-slate-200 text-slate-500' : 'bg-[#0e192f]/40 border-[#1b2c4e] text-slate-400'
              }`}>
                No active NetFlow flow exports captured on this device.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Action Buttons */}
      <div className={`p-2.5 border-t flex items-center gap-2 ${
        isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#0d172b] border-[#1b2a47]'
      }`}>
        <button
          onClick={() => openSshTerminal(device.device_id)}
          className={`flex-1 py-1.5 px-3 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition border ${
            isLight
              ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
              : 'bg-[#13274c] hover:bg-[#1b366a] text-cyan-300 hover:text-white border-cyan-800/40'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>SSH</span>
        </button>

        <button
          onClick={() => setRouteSource(device.device_id)}
          className={`flex-1 py-1.5 px-3 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition border ${
            isCurrentSrc 
              ? 'bg-emerald-600 text-white border-emerald-500 font-bold shadow-md' 
              : isLight
                ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                : 'bg-[#13274c] hover:bg-[#1b366a] text-slate-200 hover:text-white border-[#223961]'
          }`}
        >
          <Navigation className="w-3.5 h-3.5 text-emerald-500" />
          <span>Route Src</span>
        </button>

        <button
          onClick={() => setRouteDest(device.device_id)}
          className={`flex-1 py-1.5 px-3 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition border ${
            isCurrentDst 
              ? 'bg-rose-600 text-white border-rose-500 font-bold shadow-md' 
              : isLight
                ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                : 'bg-[#13274c] hover:bg-[#1b366a] text-slate-200 hover:text-white border-[#223961]'
          }`}
        >
          <MapPin className="w-3.5 h-3.5 text-rose-500" />
          <span>Route Dst</span>
        </button>
      </div>
    </NetTraceWindow>
  );
};
