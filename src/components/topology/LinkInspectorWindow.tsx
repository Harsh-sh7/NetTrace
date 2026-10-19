import React, { useState } from 'react';
import { 
  Cable, 
  Layers, 
  Activity, 
  ExternalLink, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { NetTraceWindow } from './NetTraceWindow';
import { useTopology } from '../../context/TopologyContext';
import { getShortHostname } from './DeviceNode';

export const LinkInspectorWindow: React.FC = () => {
  const { 
    linkInspectorOpen, 
    inspectedRelationshipId, 
    closeLinkInspector, 
    relationships, 
    devices,
    openDeviceInspector,
    theme
  } = useTopology();

  const isLight = theme === 'light';
  const [activeTab, setActiveTab] = useState<'physical' | 'eigrp'>('physical');

  const rel = relationships.find(r => r.relationship_id === inspectedRelationshipId) || relationships[0];

  if (!linkInspectorOpen || !rel) return null;

  const srcDevice = devices.find(d => d.device_id === rel.source_device_id) || devices[0];
  const dstDevice = devices.find(d => d.device_id === rel.destination_device_id) || devices[1];

  const srcShort = getShortHostname(srcDevice.hostname, srcDevice.device_id);
  const dstShort = getShortHostname(dstDevice.hostname, dstDevice.device_id);

  const srcIp = srcDevice.management_addresses[0] || '10.240.10.1';
  const dstIp = dstDevice.management_addresses[0] || '10.240.20.1';

  const srcInterface = rel.source_interface_name || srcDevice.interfaces[1]?.interface_name || 'GigabitEthernet0/0/1';
  const dstInterface = rel.destination_interface_name || dstDevice.interfaces[0]?.interface_name || 'GigabitEthernet0/0/0';

  const titleNode = (
    <div className="flex items-center gap-2">
      <span className={`font-mono font-bold ${isLight ? 'text-blue-600' : 'text-cyan-300'}`}>
        {srcShort} &rarr; {dstShort}
      </span>
    </div>
  );

  return (
    <NetTraceWindow
      id="link-inspector"
      title={titleNode}
      isOpen={linkInspectorOpen}
      onClose={closeLinkInspector}
      initialX={window.innerWidth > 1200 ? window.innerWidth - 420 : 800}
      initialY={75}
      initialWidth={390}
      initialHeight={580}
      zIndex={52}
    >
      {/* Link Header */}
      <div className={`p-3 border-b ${isLight ? 'bg-slate-100/90 border-slate-200' : 'bg-[#0d172b] border-[#1b2a47]'}`}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <span className={`text-sm font-bold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {srcShort} &rarr; {dstShort}
          </span>
        </div>
        <div className={`text-[11px] font-mono mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          {srcIp} &harr; {dstIp}
        </div>
      </div>

      {/* Tabs matching Osprey */}
      <div className={`flex items-center gap-1 p-2 border-b text-xs ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0a1222] border-[#1b2a47]'
      }`}>
        <button
          onClick={() => setActiveTab('physical')}
          className={`px-3 py-1 rounded text-xs font-semibold transition ${
            activeTab === 'physical'
              ? isLight 
                ? 'bg-blue-50 text-blue-700 border border-blue-300' 
                : 'bg-[#18396d] text-cyan-200 border border-cyan-600/50'
              : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
          }`}
        >
          Physical
        </button>
        <button
          onClick={() => setActiveTab('eigrp')}
          className={`px-3 py-1 rounded text-xs font-semibold transition ${
            activeTab === 'eigrp'
              ? isLight 
                ? 'bg-blue-50 text-blue-700 border border-blue-300' 
                : 'bg-[#18396d] text-cyan-200 border border-cyan-600/50'
              : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
          }`}
        >
          EIGRP AS 100
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 font-sans text-xs">
        <div className={`text-[10px] font-mono tracking-wider uppercase ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          TRANSIT PATH
        </div>

        {/* PROTOCOLS Card */}
        <div className={`p-2.5 rounded border space-y-2 ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0e192f]/70 border-[#1b2c4e]'
        }`}>
          <div className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            PROTOCOLS
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-mono">
              <span className={`w-1.5 h-1.5 rounded-full ${isLight ? 'bg-blue-600' : 'bg-cyan-400'}`} />
              <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>EIGRP AS 100</span>
              <span className={`px-1.5 py-0.2 rounded text-[9px] ${
                isLight ? 'bg-blue-50 text-blue-700' : 'bg-[#172c50] text-cyan-300'
              }`}>Autonomous System 100</span>
            </div>
            <span className={`font-mono text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>cost 10000</span>
          </div>

          <div className={`flex items-center justify-between pt-1.5 border-t text-[10px] font-mono ${
            isLight ? 'border-slate-200' : 'border-[#1b2c4e]'
          }`}>
            <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Discovery Engine:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Verified (No CDP/LLDP)
            </span>
          </div>
        </div>

        {/* Endpoint A */}
        <div className={`p-2.5 rounded border space-y-1 ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0e192f]/60 border-[#1b2c4e]'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className={`w-4 h-4 rounded font-bold text-[10px] flex items-center justify-center font-mono ${
                isLight ? 'bg-blue-100 text-blue-700' : 'bg-[#173059] text-cyan-300'
              }`}>
                A
              </span>
              <span className={`font-bold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>{srcShort}</span>
              <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{srcIp}</span>
            </div>
            <span className={`text-[10px] font-mono font-bold ${isLight ? 'text-blue-600' : 'text-cyan-400'}`}>1000M</span>
          </div>

          <div className={`text-[11px] font-mono pl-5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            {srcInterface} &mdash; 10.240.100.1/30
          </div>
          <div className="text-[10px] font-mono text-slate-400 pl-5">
            MAC: 00:1A:E8:22:90:02
          </div>
          <div className={`text-[10px] pl-5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            to {dstShort} &middot; since 23 Jul 2026
          </div>
        </div>

        {/* Endpoint Z */}
        <div className={`p-2.5 rounded border space-y-1 ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0e192f]/60 border-[#1b2c4e]'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className={`w-4 h-4 rounded font-bold text-[10px] flex items-center justify-center font-mono ${
                isLight ? 'bg-blue-100 text-blue-700' : 'bg-[#173059] text-cyan-300'
              }`}>
                Z
              </span>
              <span className={`font-bold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>{dstShort}</span>
              <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{dstIp}</span>
            </div>
            <span className={`text-[10px] font-mono font-bold ${isLight ? 'text-blue-600' : 'text-cyan-400'}`}>1000M</span>
          </div>

          <div className={`text-[11px] font-mono pl-5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            {dstInterface} &mdash; 10.240.100.2/30
          </div>
          <div className="text-[10px] font-mono text-slate-400 pl-5">
            MAC: 00:24:14:44:88:01
          </div>
          <div className={`text-[10px] pl-5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            to {srcShort} &middot; since 23 Jul 2026
          </div>
        </div>

        {/* Live Traffic Sparkline matching Osprey */}
        <div className={`p-2.5 rounded border space-y-2 ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0e192f]/80 border-[#1b2c4e]'
        }`}>
          <div className="flex items-center justify-between text-xs">
            <span className={`font-mono ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>{srcShort} &rarr; {dstShort}</span>
            <div className="text-right">
              <span className="text-emerald-500 font-bold font-mono">2.0 Kbps</span>
              <span className={`font-mono text-[10px] ml-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>448.7K</span>
            </div>
          </div>

          {/* SVG Animated Sparkline */}
          <div className="h-14 w-full relative">
            <svg className="w-full h-full" viewBox="0 0 200 40" fill="none">
              <path
                d="M 0 30 L 30 30 L 45 28 L 60 12 L 75 28 L 90 28 L 120 28 L 135 15 L 150 28 L 180 28 L 200 30"
                stroke="#22c55e"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            1 pps
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={`p-2.5 border-t space-y-2 ${
        isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#0d172b] border-[#1b2a47]'
      }`}>
        <div className="flex items-center gap-2">
          <button className={`flex-1 py-1.5 px-2 rounded text-[11px] font-mono transition border ${
            isLight 
              ? 'bg-white hover:bg-slate-50 text-blue-700 border-slate-300' 
              : 'bg-[#122444] hover:bg-[#1a3462] text-cyan-200 border-[#1e3a6c]'
          }`}>
            Traffic {srcInterface.substring(0, 4)}
          </button>
          <button className={`flex-1 py-1.5 px-2 rounded text-[11px] font-mono transition border ${
            isLight 
              ? 'bg-white hover:bg-slate-50 text-blue-700 border-slate-300' 
              : 'bg-[#122444] hover:bg-[#1a3462] text-cyan-200 border-[#1e3a6c]'
          }`}>
            Traffic {dstInterface.substring(0, 4)}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openDeviceInspector(srcDevice.device_id)}
            className={`flex-1 py-1.5 px-2 rounded text-xs font-semibold transition border ${
              isLight 
                ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600' 
                : 'bg-[#152747] hover:bg-[#1c3766] text-white border-[#23437a]'
            }`}
          >
            Inspect {srcShort}
          </button>
          <button
            onClick={() => openDeviceInspector(dstDevice.device_id)}
            className={`flex-1 py-1.5 px-2 rounded text-xs font-semibold transition border ${
              isLight 
                ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600' 
                : 'bg-[#152747] hover:bg-[#1c3766] text-white border-[#23437a]'
            }`}
          >
            Inspect {dstShort}
          </button>
        </div>
      </div>
    </NetTraceWindow>
  );
};
