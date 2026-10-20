import React, { useState, useMemo } from 'react';
import { 
  Server, 
  Search, 
  Eye, 
  Network 
} from 'lucide-react';
import { useTopology } from '../../context/TopologyContext';
import { Device } from '../../types';
import { DeviceDetailModal } from './DeviceDetailModal';

export const DeviceInventoryView: React.FC = () => {
  const { devices, selectDevice, setActiveScreen, theme } = useTopology();
  const isLight = theme === 'light';
  const [search, setSearch] = useState<string>('');
  const [inspectingDevice, setInspectingDevice] = useState<Device | null>(null);

  const filteredDevices = useMemo(() => {
    if (!search.trim()) return devices;
    const q = search.toLowerCase();
    return devices.filter(d => 
      d.hostname.toLowerCase().includes(q) ||
      d.management_addresses.some(ip => ip.includes(q)) ||
      d.device_type.toLowerCase().includes(q) ||
      d.site_name.toLowerCase().includes(q)
    );
  }, [devices, search]);

  const locateInTopology = (deviceId: string) => {
    selectDevice(deviceId);
    setActiveScreen('topology');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4 select-none font-mono">
      {/* Header & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Server className={`w-4 h-4 ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
          <h1 className={`text-base font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Device Inventory
          </h1>
          <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>({devices.length} assets)</span>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter hostname, IP, role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`border rounded-lg pl-8 pr-3 py-1.5 text-xs outline-none w-64 transition ${
              isLight 
                ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 shadow-sm' 
                : 'bg-scada-surface border-scada-border text-slate-200 focus:border-cyan-500'
            }`}
          />
        </div>
      </div>

      {/* Clean Inventory Table */}
      <div className={`border rounded-xl overflow-hidden shadow-lg ${
        isLight ? 'bg-white border-slate-200' : 'bg-scada-surface border-scada-border/80'
      }`}>
        <table className="w-full text-left text-xs">
          <thead className={`text-[11px] uppercase border-b ${
            isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-scada-card/60 text-scada-subtle border-scada-border'
          }`}>
            <tr>
              <th className="p-3">Device Hostname</th>
              <th className="p-3">Role</th>
              <th className="p-3">IP Address</th>
              <th className="p-3">Station Facility</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-scada-border/60'}`}>
            {filteredDevices.map(device => (
              <tr key={device.device_id} className={`transition ${isLight ? 'hover:bg-slate-50' : 'hover:bg-scada-card/40'}`}>
                <td className={`p-3 font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {device.hostname}
                </td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-sans ${
                    isLight ? 'bg-slate-100 text-slate-700 border border-slate-200' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {device.device_type}
                  </span>
                </td>
                <td className={`p-3 font-mono ${isLight ? 'text-blue-600 font-semibold' : 'text-cyan-300'}`}>
                  {device.management_addresses[0] || '—'}
                </td>
                <td className={`p-3 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  {device.site_name}
                </td>
                <td className="p-3">
                  {device.is_rogue ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white animate-pulse">
                      ROGUE
                    </span>
                  ) : device.monitoring_status === 'STALE' ? (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      isLight ? 'bg-amber-50 text-amber-800 border-amber-300' : 'bg-amber-950 text-amber-300 border-amber-700'
                    }`}>
                      STALE
                    </span>
                  ) : (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      isLight ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}>
                      ONLINE
                    </span>
                  )}
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => setInspectingDevice(device)}
                      className={`px-2.5 py-1 rounded transition text-[11px] flex items-center gap-1 border ${
                        isLight 
                          ? 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-sm' 
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-transparent'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      <span>Inspect</span>
                    </button>
                    <button
                      onClick={() => locateInTopology(device.device_id)}
                      className={`px-2 py-1 rounded transition text-[11px] border ${
                        isLight 
                          ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200' 
                          : 'bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800'
                      }`}
                    >
                      <Network className="w-3 h-3" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DeviceDetailModal
        device={inspectingDevice}
        onClose={() => setInspectingDevice(null)}
        onLocateInTopology={locateInTopology}
      />
    </div>
  );
};
