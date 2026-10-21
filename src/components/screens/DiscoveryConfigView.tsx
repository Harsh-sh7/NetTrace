import React, { useState } from 'react';
import { 
  Sliders, 
  ShieldCheck, 
  Lock, 
  Clock, 
  Save, 
  CheckCircle2, 
  Layers, 
  AlertTriangle,
  Snowflake,
  Radio,
  Server,
  Activity
} from 'lucide-react';
import { useTopology } from '../../context/TopologyContext';
import { DiscoveryScope, Snmpv3Profile } from '../../types';

export const DiscoveryConfigView: React.FC = () => {
  const { config, updateConfig, freezeCurrentAsBaseline, theme } = useTopology();
  const isLight = theme === 'light';

  const [pollingInterval, setPollingInterval] = useState<number>(config.polling_interval_seconds);
  const [staleThreshold, setStaleThreshold] = useState<number>(config.stale_threshold_seconds);
  const [maintenanceWindow, setMaintenanceWindow] = useState<boolean>(config.maintenance_window_active);
  const [netflowEnabled, setNetflowEnabled] = useState<boolean>(config.netflow_enabled ?? true);
  const [netflowPort, setNetflowPort] = useState<number>(config.netflow_collector_port ?? 2055);
  const [syslogPort, setSyslogPort] = useState<number>(config.syslog_listener_port ?? 514);
  const [showSavedToast, setShowSavedToast] = useState<boolean>(false);
  const [showFreezeSuccess, setShowFreezeSuccess] = useState<boolean>(false);

  const handleSave = () => {
    updateConfig({
      polling_interval_seconds: pollingInterval,
      stale_threshold_seconds: staleThreshold,
      maintenance_window_active: maintenanceWindow,
      netflow_enabled: netflowEnabled,
      netflow_collector_port: netflowPort,
      syslog_listener_port: syslogPort,
    });
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  const handleFreezeBaseline = () => {
    freezeCurrentAsBaseline();
    setShowFreezeSuccess(true);
    setTimeout(() => setShowFreezeSuccess(false), 4000);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto overflow-y-auto max-h-[calc(100vh-64px)] select-none font-mono">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl font-bold tracking-tight flex items-center gap-2 ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            <Sliders className={`w-5 h-5 ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
            <span>Discovery Engine & Credential Configuration</span>
          </h1>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Configure authorized CIDR discovery scopes, SNMPv3 authPriv credentials, NetFlow/Syslog collectors, and baseline freezes.
          </p>
        </div>

        <button
          onClick={handleSave}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold shadow-lg transition active:scale-95 ${
            isLight
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
              : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-950/40'
          }`}
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {showSavedToast && (
        <div className={`p-3 rounded-lg text-xs flex items-center gap-2 border animate-in fade-in duration-200 ${
          isLight ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-emerald-950/80 border-emerald-700/60 text-emerald-300'
        }`}>
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Configuration saved successfully and applied to discovery engine.</span>
        </div>
      )}

      {showFreezeSuccess && (
        <div className={`p-3 rounded-lg text-xs flex items-center gap-2 border animate-in fade-in duration-200 ${
          isLight ? 'bg-blue-50 border-blue-300 text-blue-800' : 'bg-cyan-950/80 border-cyan-700/60 text-cyan-200'
        }`}>
          <Snowflake className={`w-4 h-4 ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
          <span>Official SCADA topology baseline frozen! Future deviations will trigger security anomalies.</span>
        </div>
      )}

      {/* Strict Zero-CDP / Zero-LLDP Security Policy Enforcement Card */}
      <div className={`border rounded-xl p-5 shadow-xl space-y-3 ${
        isLight ? 'bg-amber-50/60 border-amber-200' : 'bg-amber-950/20 border-amber-800/60'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-500" />
            <h3 className={`text-sm font-bold uppercase tracking-wider ${isLight ? 'text-amber-900' : 'text-amber-300'}`}>
              GAIL SCADA Section 15.3 Zero-Discovery Protocol Compliance
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white font-mono">
            STRICT ENFORCEMENT
          </span>
        </div>
        <p className={`text-xs font-sans leading-relaxed ${isLight ? 'text-amber-800' : 'text-amber-200/80'}`}>
          CDP (Cisco Discovery Protocol) and LLDP (Link Layer Discovery Protocol) are completely forbidden across the pipeline network due to broadcast leakage and unauthenticated neighbor advertisements. NetTrace strictly uses authorized management-plane polling (SNMPv3 USM authPriv), ARP cache inspection, switch bridge tables, NetFlow v9/IPFIX, and EIGRP routing MIBs.
        </p>
      </div>

      {/* Baseline Freeze & Maintenance Window Control */}
      <div className={`border rounded-xl p-5 shadow-xl space-y-4 ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0a101d] border-[#141f36]'
      }`}>
        <div className={`flex items-center justify-between pb-3 border-b ${
          isLight ? 'border-slate-200' : 'border-[#1b2b4d]'
        }`}>
          <div>
            <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              <Snowflake className={`w-4 h-4 ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
              <span>Approved SCADA Baseline Governance</span>
            </h3>
            <p className={`text-xs font-sans mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              The baseline is the authorized reference topology against which rogue devices and link additions are detected.
            </p>
          </div>

          <button
            onClick={handleFreezeBaseline}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold shadow transition active:scale-95 ${
              isLight ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-cyan-600 hover:bg-cyan-500 text-white'
            }`}
          >
            <Snowflake className="w-3.5 h-3.5" />
            <span>Freeze Current as Baseline</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className={`p-3 rounded-lg border space-y-1 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0e172a] border-[#1b2b4d]'
          }`}>
            <div className={isLight ? 'text-slate-500 text-[11px]' : 'text-slate-400 text-[11px]'}>Baseline Status:</div>
            <div className="text-emerald-500 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
              FROZEN & ENFORCED
            </div>
            <div className={`text-[10px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Last frozen: {config.baseline_last_updated}
            </div>
          </div>

          <div className={`p-3 rounded-lg border space-y-2 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0e172a] border-[#1b2b4d]'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Maintenance Window Mode</div>
                <div className={`text-[10px] font-sans ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Suspends rogue device alarms during authorized hardware maintenance.
                </div>
              </div>
              <input
                type="checkbox"
                checked={maintenanceWindow}
                onChange={(e) => setMaintenanceWindow(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Polling Timers & NetFlow/Syslog Collectors */}
      <div className={`border rounded-xl p-5 shadow-xl space-y-4 ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0a101d] border-[#141f36]'
      }`}>
        <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 pb-2 border-b ${
          isLight ? 'text-slate-900 border-slate-200' : 'text-white border-[#1b2b4d]'
        }`}>
          <Clock className={`w-4 h-4 ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
          <span>Polling Cadence & Telemetry Windows</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className={isLight ? 'text-slate-700 font-medium' : 'text-slate-300 font-medium'}>
                SNMPv3 Polling Interval
              </label>
              <span className={`font-bold ${isLight ? 'text-blue-600' : 'text-cyan-300'}`}>
                {pollingInterval} seconds
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={120}
              step={5}
              value={pollingInterval}
              onChange={(e) => setPollingInterval(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <p className={`text-[10px] font-sans ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Frequency of periodic `ifTable`, ARP, and EIGRP table queries.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className={isLight ? 'text-slate-700 font-medium' : 'text-slate-300 font-medium'}>
                Stale Device Threshold
              </label>
              <span className="text-amber-500 font-bold">{staleThreshold} seconds</span>
            </div>
            <input
              type="range"
              min={30}
              max={300}
              step={15}
              value={staleThreshold}
              onChange={(e) => setStaleThreshold(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <p className={`text-[10px] font-sans ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Grace period before missing telemetry marks an asset STALE (prevents false deletes).
            </p>
          </div>
        </div>

        {/* NetFlow & Syslog Configuration */}
        <div className={`pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4 ${
          isLight ? 'border-slate-200' : 'border-[#1b2b4d]'
        }`}>
          <div className={`p-3 rounded-lg border space-y-1.5 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0e172a] border-[#1b2b4d]'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>NetFlow Exporter</span>
              <input
                type="checkbox"
                checked={netflowEnabled}
                onChange={(e) => setNetflowEnabled(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
              />
            </div>
            <div className="text-[10px] text-slate-400">NetFlow v9 / IPFIX flow correlation</div>
          </div>

          <div className={`p-3 rounded-lg border space-y-1 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0e172a] border-[#1b2b4d]'
          }`}>
            <span className={`font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>NetFlow UDP Port</span>
            <input
              type="number"
              value={netflowPort}
              onChange={(e) => setNetflowPort(Number(e.target.value))}
              className={`w-full rounded px-2 py-1 text-xs border font-mono outline-none ${
                isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-[#060c18] border-[#1b2b4d] text-cyan-300'
              }`}
            />
          </div>

          <div className={`p-3 rounded-lg border space-y-1 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0e172a] border-[#1b2b4d]'
          }`}>
            <span className={`font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>Syslog UDP Port</span>
            <input
              type="number"
              value={syslogPort}
              onChange={(e) => setSyslogPort(Number(e.target.value))}
              className={`w-full rounded px-2 py-1 text-xs border font-mono outline-none ${
                isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-[#060c18] border-[#1b2b4d] text-cyan-300'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Authorized CIDR Scopes */}
      <div className={`border rounded-xl p-5 shadow-xl space-y-4 ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0a101d] border-[#141f36]'
      }`}>
        <div className={`flex items-center justify-between pb-2 border-b ${
          isLight ? 'border-slate-200' : 'border-[#1b2b4d]'
        }`}>
          <div>
            <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              <Layers className={`w-4 h-4 ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
              <span>Authorized Discovery Scopes (Permitted Subnets)</span>
            </h3>
            <p className={`text-xs font-sans mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              The engine will NEVER query any IP outside these authorized pipeline subnets.
            </p>
          </div>
        </div>

        <div className={`border rounded-lg overflow-hidden text-xs ${
          isLight ? 'border-slate-200' : 'border-[#1b2b4d]'
        }`}>
          <table className="w-full text-left">
            <thead className={`text-[10px] uppercase ${
              isLight ? 'bg-slate-100 text-slate-600' : 'bg-[#0e172a] text-slate-400'
            }`}>
              <tr>
                <th className="p-2.5">Scope Name</th>
                <th className="p-2.5">Subnet CIDR</th>
                <th className="p-2.5">Station Facility</th>
                <th className="p-2.5">Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y text-[11px] ${
              isLight ? 'divide-slate-200' : 'divide-[#1b2b4d]'
            }`}>
              {config.authorized_scopes.map(sc => (
                <tr key={sc.id} className={isLight ? 'hover:bg-slate-50' : 'hover:bg-white/5'}>
                  <td className={`p-2.5 font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{sc.name}</td>
                  <td className={`p-2.5 font-semibold ${isLight ? 'text-blue-600' : 'text-cyan-300'}`}>{sc.subnet_cidr}</td>
                  <td className={`p-2.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{sc.site_id}</td>
                  <td className="p-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      AUTHORIZED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SNMPv3 Security Credentials Profiles */}
      <div className={`border rounded-xl p-5 shadow-xl space-y-4 ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0a101d] border-[#141f36]'
      }`}>
        <div className={`flex items-center justify-between pb-2 border-b ${
          isLight ? 'border-slate-200' : 'border-[#1b2b4d]'
        }`}>
          <div>
            <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              <Lock className="w-4 h-4 text-emerald-500" />
              <span>SNMPv3 Cryptographic Security Profiles</span>
            </h3>
            <p className={`text-xs font-sans mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Uses AuthPriv with SHA-256 integrity and AES-256 encryption. Plaintext SNMPv1/v2c is rejected.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {config.snmp_profiles.map(prof => (
            <div key={prof.id} className={`p-3 rounded-lg border text-xs space-y-1 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0e172a] border-[#1b2b4d]'
            }`}>
              <div className="flex items-center justify-between font-bold">
                <span className={isLight ? 'text-blue-600' : 'text-cyan-300'}>{prof.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  {prof.security_level} (Highest Security)
                </span>
              </div>
              <div className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Auth: <strong className={isLight ? 'text-slate-800' : 'text-slate-200'}>{prof.auth_protocol}</strong> | Privacy Cipher: <strong className={isLight ? 'text-slate-800' : 'text-slate-200'}>{prof.priv_protocol}</strong> | User: <strong className={isLight ? 'text-slate-800' : 'text-slate-200'}>{prof.username}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
