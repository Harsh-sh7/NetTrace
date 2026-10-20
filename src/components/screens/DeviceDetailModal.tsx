import React, { useState } from 'react';
import { 
  X, 
  Server, 
  HardDrive, 
  Cpu, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  FileText,
  Network,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { Device } from '../../types';

interface DeviceDetailModalProps {
  device: Device | null;
  onClose: () => void;
  onLocateInTopology?: (deviceId: string) => void;
}

export const DeviceDetailModal: React.FC<DeviceDetailModalProps> = ({ 
  device, 
  onClose,
  onLocateInTopology
}) => {
  const [activeTab, setActiveTab] = useState<'interfaces' | 'eigrp' | 'arp_mac' | 'telemetry'>('interfaces');

  if (!device) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="bg-scada-surface border border-scada-border rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-scada-border bg-scada-card/60 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${
              device.is_rogue 
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' 
                : 'bg-cyan-950/80 text-cyan-300 border border-cyan-800'
            }`}>
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-mono tracking-tight">
                  {device.hostname}
                </h2>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  device.is_rogue 
                    ? 'bg-rose-600 text-white animate-pulse' 
                    : device.monitoring_status === 'REACHABLE'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}>
                  {device.monitoring_status}
                </span>
                {device.approved_in_baseline && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                    APPROVED BASELINE
                  </span>
                )}
              </div>
              <p className="text-xs text-scada-subtle font-mono mt-0.5">
                {device.vendor} {device.model} | Station: {device.site_name} ({device.site_id})
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-5 border-b border-scada-border bg-scada-card/20 text-xs font-mono">
          <button
            onClick={() => setActiveTab('interfaces')}
            className={`py-2.5 px-3 border-b-2 font-medium transition flex items-center gap-1.5 ${
              activeTab === 'interfaces'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Interfaces ({device.interfaces.length})</span>
          </button>

          {device.eigrp_neighbors && (
            <button
              onClick={() => setActiveTab('eigrp')}
              className={`py-2.5 px-3 border-b-2 font-medium transition flex items-center gap-1.5 ${
                activeTab === 'eigrp'
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>EIGRP AS 100 ({device.eigrp_neighbors.length})</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('arp_mac')}
            className={`py-2.5 px-3 border-b-2 font-medium transition flex items-center gap-1.5 ${
              activeTab === 'arp_mac'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>ARP & Forwarding Tables</span>
          </button>

          <button
            onClick={() => setActiveTab('telemetry')}
            className={`py-2.5 px-3 border-b-2 font-medium transition flex items-center gap-1.5 ${
              activeTab === 'telemetry'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Identity & Provenance</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 font-mono text-xs">
          {/* TAB 1: Interfaces */}
          {activeTab === 'interfaces' && (
            <div className="space-y-3">
              <div className="text-slate-400 text-xs">
                Network interfaces collected via authenticated SNMPv3 `ifTable` / `ifXTable`:
              </div>
              <div className="overflow-x-auto border border-scada-border rounded-lg">
                <table className="w-full text-left">
                  <thead className="bg-scada-card text-[11px] text-scada-subtle uppercase">
                    <tr>
                      <th className="p-2.5">Port Name</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">IP Addresses</th>
                      <th className="p-2.5">MAC Address</th>
                      <th className="p-2.5">Speed</th>
                      <th className="p-2.5">VLAN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-scada-border/60 text-[11px]">
                    {device.interfaces.map(iface => (
                      <tr key={iface.interface_id} className="hover:bg-scada-card/40">
                        <td className="p-2.5 font-bold text-white">{iface.interface_name}</td>
                        <td className="p-2.5">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                            iface.interface_status === 'UP' ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-300'
                          }`}>
                            {iface.interface_status}
                          </span>
                        </td>
                        <td className="p-2.5 text-cyan-300">{iface.ip_addresses.join(', ') || '—'}</td>
                        <td className="p-2.5 text-slate-300">{iface.mac_address || '—'}</td>
                        <td className="p-2.5 text-slate-400">{iface.speed_mbps ? `${iface.speed_mbps} Mbps` : '—'}</td>
                        <td className="p-2.5 text-slate-400">{iface.vlan || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: EIGRP Telemetry */}
          {activeTab === 'eigrp' && device.eigrp_neighbors && (
            <div className="space-y-3">
              <div className="text-slate-400 text-xs">
                EIGRP routing neighbor adjacencies from Cisco EIGRP MIB (`cEigrpNbrTable`):
              </div>
              <div className="overflow-x-auto border border-scada-border rounded-lg">
                <table className="w-full text-left">
                  <thead className="bg-scada-card text-[11px] text-scada-subtle uppercase">
                    <tr>
                      <th className="p-2.5">Neighbor IP</th>
                      <th className="p-2.5">Local Interface</th>
                      <th className="p-2.5">AS Number</th>
                      <th className="p-2.5">Holdtime</th>
                      <th className="p-2.5">Smooth RTT</th>
                      <th className="p-2.5">State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-scada-border/60 text-[11px]">
                    {device.eigrp_neighbors.map((nbr, idx) => (
                      <tr key={idx} className="hover:bg-scada-card/40">
                        <td className="p-2.5 font-bold text-cyan-300">{nbr.neighbor_ip}</td>
                        <td className="p-2.5 text-slate-200">{nbr.local_interface}</td>
                        <td className="p-2.5 text-purple-300 font-bold">{nbr.as_number}</td>
                        <td className="p-2.5 text-slate-400">{nbr.hold_time_seconds}s</td>
                        <td className="p-2.5 text-emerald-400">{nbr.smooth_rtt_ms} ms</td>
                        <td className="p-2.5">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                            nbr.state === 'UP' ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-300'
                          }`}>
                            {nbr.state}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ARP & MAC Forwarding */}
          {activeTab === 'arp_mac' && (
            <div className="space-y-4">
              {device.mac_forwarding_table && device.mac_forwarding_table.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Switch Port Forwarding Database (FDB / dot1qTpFdbTable)
                  </h4>
                  <div className="border border-scada-border rounded-lg overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-scada-card text-[10px] text-scada-subtle uppercase">
                        <tr>
                          <th className="p-2">Port</th>
                          <th className="p-2">Learned MAC Address</th>
                          <th className="p-2">VLAN</th>
                          <th className="p-2">Type</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-scada-border/60 text-[11px]">
                        {device.mac_forwarding_table.map((m, idx) => (
                          <tr key={idx} className="hover:bg-scada-card/40">
                            <td className="p-2 font-bold text-white">{m.port}</td>
                            <td className="p-2 text-cyan-300">{m.mac_address}</td>
                            <td className="p-2 text-slate-400">{m.vlan}</td>
                            <td className="p-2 text-slate-400">{m.type}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {device.arp_cache && device.arp_cache.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    ARP Cache (ipNetToMediaTable)
                  </h4>
                  <div className="border border-scada-border rounded-lg overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-scada-card text-[10px] text-scada-subtle uppercase">
                        <tr>
                          <th className="p-2">IP Address</th>
                          <th className="p-2">Resolved MAC Address</th>
                          <th className="p-2">Interface</th>
                          <th className="p-2">Binding Type</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-scada-border/60 text-[11px]">
                        {device.arp_cache.map((arp, idx) => (
                          <tr key={idx} className="hover:bg-scada-card/40">
                            <td className="p-2 font-bold text-cyan-300">{arp.ip_address}</td>
                            <td className="p-2 text-slate-300">{arp.mac_address}</td>
                            <td className="p-2 text-slate-400">{arp.interface_name}</td>
                            <td className="p-2 text-slate-400">{arp.type}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Identity & Provenance */}
          {activeTab === 'telemetry' && (
            <div className="space-y-3">
              <div className="p-3 bg-scada-card/80 border border-scada-border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-scada-subtle font-semibold">Identity Resolution Confidence</span>
                  <span className="text-emerald-400 font-bold">{device.identity_confidence}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${device.identity_confidence}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="p-3 bg-scada-card rounded-lg border border-scada-border space-y-1">
                  <div className="text-scada-subtle">First Discovered:</div>
                  <div className="text-white font-semibold">{device.first_seen}</div>
                </div>
                <div className="p-3 bg-scada-card rounded-lg border border-scada-border space-y-1">
                  <div className="text-scada-subtle">Last Successful Poll:</div>
                  <div className="text-white font-semibold">{device.last_seen}</div>
                </div>
              </div>

              {device.notes && (
                <div className="p-3 bg-scada-card rounded-lg border border-scada-border space-y-1">
                  <div className="text-scada-subtle font-bold">Operational Context:</div>
                  <p className="text-slate-300 text-xs font-sans leading-relaxed">{device.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-scada-border bg-scada-card/30 flex items-center justify-between">
          <button
            onClick={() => {
              if (onLocateInTopology) onLocateInTopology(device.device_id);
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-mono font-medium transition"
          >
            <Network className="w-3.5 h-3.5" />
            <span>Locate on Topology Canvas</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
