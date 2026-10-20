import React, { useState } from 'react';
import { Activity, ShieldCheck, AlertCircle, RefreshCw, Radio, Terminal, FileText } from 'lucide-react';
import { NetTraceWindow } from './NetTraceWindow';
import { useTopology } from '../../context/TopologyContext';

export const ActivityLogWindow: React.FC = () => {
  const { activityLogOpen, toggleActivityLog, events, devices, theme } = useTopology();
  const isLight = theme === 'light';
  const [filterMode, setFilterMode] = useState<'events' | 'syslog' | 'netflow'>('events');

  if (!activityLogOpen) return null;

  // Generate realistic SCADA syslog stream
  const syslogMessages = [
    { id: 'SYS-1', time: '13:20:00', host: 'RTR-CCF-CORE01', facility: 'DUAL-5-NBRCHANGE', msg: 'IP-EIGRP(0) 100: Neighbor 10.240.100.2 (Gi0/0/1) is up: new adjacency' },
    { id: 'SYS-2', time: '13:19:42', host: 'SW-CCF-DIST01', facility: 'LINK-3-UPDOWN', msg: 'Interface TenGigabitEthernet1/1, changed state to up' },
    { id: 'SYS-3', time: '13:18:15', host: 'RTR-CS01-01', facility: 'SNMP-5-COLDSTART', msg: 'SNMPv3 agent initialized with USM authPriv SHA-256/AES-256 user scada_audit_mgr' },
    { id: 'SYS-4', time: '13:16:30', host: 'SW-VS04-01', facility: 'SEC-4-PORT_SECURITY', msg: 'Strict zero CDP/LLDP policy active. Ingress packet filtered on Gi1/1' },
    { id: 'SYS-5', time: '13:15:00', host: 'RTR-PS02-01', facility: 'DUAL-5-NBRCHANGE', msg: 'IP-EIGRP(0) 100: Neighbor 10.240.100.10 (Gi0/0/1) is up: new adjacency' },
    { id: 'SYS-6', time: '13:12:20', host: 'RTR-TS01-01', facility: 'SYS-5-CONFIG_I', msg: 'Configured from console by admin on vty0 (SSHv2 encrypted)' },
  ];

  // Aggregate all netflow records
  const allNetflow = devices.flatMap(d => d.netflow_records || []);

  const titleNode = (
    <div className="flex items-center gap-2">
      <Activity className={`w-3.5 h-3.5 ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
      <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
        SCADA Telemetry & Activity Stream
      </span>
    </div>
  );

  return (
    <NetTraceWindow
      id="activity-log"
      title={titleNode}
      isOpen={activityLogOpen}
      onClose={() => toggleActivityLog(false)}
      initialX={window.innerWidth > 900 ? window.innerWidth - 490 : 50}
      initialY={window.innerHeight - 380}
      initialWidth={480}
      initialHeight={340}
      zIndex={56}
    >
      {/* Stream Tabs */}
      <div className={`p-2 border-b flex items-center justify-between text-xs ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#080f1e] border-[#162747]'
      }`}>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilterMode('events')}
            className={`px-2 py-0.5 rounded text-[11px] font-mono transition border ${
              filterMode === 'events'
                ? isLight ? 'bg-blue-50 text-blue-700 border-blue-300 font-bold' : 'bg-[#18396d] text-cyan-200 border-cyan-600 font-bold'
                : isLight ? 'text-slate-600 hover:text-slate-900 border-transparent' : 'text-slate-400 hover:text-white border-transparent'
            }`}
          >
            Topology Events ({events.length})
          </button>
          <button
            onClick={() => setFilterMode('syslog')}
            className={`px-2 py-0.5 rounded text-[11px] font-mono transition border ${
              filterMode === 'syslog'
                ? isLight ? 'bg-blue-50 text-blue-700 border-blue-300 font-bold' : 'bg-[#18396d] text-cyan-200 border-cyan-600 font-bold'
                : isLight ? 'text-slate-600 hover:text-slate-900 border-transparent' : 'text-slate-400 hover:text-white border-transparent'
            }`}
          >
            Syslog Stream ({syslogMessages.length})
          </button>
          <button
            onClick={() => setFilterMode('netflow')}
            className={`px-2 py-0.5 rounded text-[11px] font-mono transition border ${
              filterMode === 'netflow'
                ? isLight ? 'bg-blue-50 text-blue-700 border-blue-300 font-bold' : 'bg-[#18396d] text-cyan-200 border-cyan-600 font-bold'
                : isLight ? 'text-slate-600 hover:text-slate-900 border-transparent' : 'text-slate-400 hover:text-white border-transparent'
            }`}
          >
            NetFlow Flows ({allNetflow.length})
          </button>
        </div>

        <span className="text-[10px] text-emerald-500 font-mono flex items-center gap-1 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          LIVE
        </span>
      </div>

      {/* Body Content */}
      <div className={`flex-1 overflow-y-auto p-3 font-mono text-xs space-y-2 ${
        isLight ? 'bg-slate-50' : 'bg-[#080f1e]'
      }`}>
        {filterMode === 'events' && events.map((evt, idx) => (
          <div 
            key={evt.event_id || idx}
            className={`p-2.5 rounded border space-y-1 transition ${
              isLight
                ? 'bg-white border-slate-200 hover:border-blue-400 shadow-sm'
                : 'bg-[#0d182e]/80 border-[#1b2f56] hover:border-cyan-500/50'
            }`}
          >
            <div className="flex items-center justify-between text-[10px]">
              <span className={`font-bold px-1.5 py-0.5 rounded ${
                evt.severity === 'CRITICAL' || evt.severity === 'HIGH'
                  ? isLight 
                    ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                  : isLight 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'bg-[#152e59] text-cyan-300 border border-[#204582]'
              }`}>
                {evt.event_type}
              </span>
              <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>
                {evt.detected_at.split(' ')[1] || evt.detected_at}
              </span>
            </div>
            <p className={`font-sans text-xs leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              {evt.description}
            </p>
            <div className={`text-[10px] font-mono flex items-center gap-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              <span>Target: {evt.affected_resources.join(', ')}</span>
              <span>&bull;</span>
              <span className={isLight ? 'text-emerald-700 font-semibold' : 'text-emerald-400'}>
                Verified No-CDP
              </span>
            </div>
          </div>
        ))}

        {filterMode === 'syslog' && syslogMessages.map(sys => (
          <div 
            key={sys.id}
            className={`p-2.5 rounded border space-y-1 text-[11px] ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#0c162c] border-[#1b2c4e]'
            }`}
          >
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-bold text-amber-500">%{sys.facility}</span>
              <span className="text-slate-400">{sys.time}</span>
            </div>
            <div className={`font-mono text-xs ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              <strong className={isLight ? 'text-blue-600' : 'text-cyan-300'}>{sys.host}:</strong> {sys.msg}
            </div>
          </div>
        ))}

        {filterMode === 'netflow' && allNetflow.map(flow => (
          <div 
            key={flow.flow_id}
            className={`p-2 rounded border space-y-0.5 text-[11px] ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#0c162c] border-[#1b2c4e]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`font-bold ${isLight ? 'text-blue-600' : 'text-cyan-300'}`}>
                {flow.source_ip}:{flow.source_port} &rarr; {flow.destination_ip}:{flow.destination_port}
              </span>
              <span className="text-[10px] px-1 rounded bg-slate-800 text-slate-300">
                {flow.protocol}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center justify-between">
              <span>{flow.bytes.toLocaleString()} bytes ({flow.packets} pkts)</span>
              <span>In: {flow.input_interface} &rarr; Out: {flow.output_interface}</span>
            </div>
          </div>
        ))}
      </div>
    </NetTraceWindow>
  );
};
