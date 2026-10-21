import React from 'react';
import { 
  Server, 
  Network, 
  ShieldAlert, 
  Activity, 
  Clock, 
  ArrowRight, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle,
  Play,
  Layers,
  MapPin,
  RefreshCw,
  HardDrive
} from 'lucide-react';
import { useTopology } from '../../context/TopologyContext';

export const OverviewDashboard: React.FC = () => {
  const { 
    devices, 
    relationships, 
    alerts, 
    events, 
    setActiveScreen, 
    selectDevice,
    triggerManualPoll,
    lastPollTime,
    config,
    theme
  } = useTopology();

  const isLight = theme === 'light';

  const reachableDevices = devices.filter(d => d.monitoring_status === 'REACHABLE');
  const staleDevices = devices.filter(d => d.monitoring_status === 'STALE');
  const unreachableDevices = devices.filter(d => d.monitoring_status === 'UNREACHABLE');
  const rogueDevices = devices.filter(d => d.is_rogue);

  const physicalLinks = relationships.filter(r => r.relationship_type === 'PHYSICAL_CABLE' || r.relationship_type === 'SWITCH_PORT_FORWARD');
  const eigrpLinks = relationships.filter(r => r.relationship_type === 'EIGRP_ADJACENCY');
  const openAlerts = alerts.filter(a => a.investigation_status === 'OPEN');
  const criticalAlerts = openAlerts.filter(a => a.severity === 'CRITICAL');

  // Monitored pipeline stations across GAIL transmission network
  const stations = [
    { id: 'SITE-CCF', name: 'Central Control Hazira', km: 'KM 0.0', type: 'Supervisory Dispatch' },
    { id: 'SITE-CS01', name: 'CS-01 Vijaipur', km: 'KM 380.4', type: 'Compressor Turbine' },
    { id: 'SITE-VS04', name: 'VS-04 Auraiya', km: 'KM 620.1', type: 'Sectionalizing Block Valve' },
    { id: 'SITE-PS02', name: 'PS-02 Jhabua', km: 'KM 240.8', type: 'LPG Booster Pump' },
    { id: 'SITE-TS01', name: 'TS-01 Dadri Terminal', km: 'KM 890.5', type: 'Custody Gas Metering' },
  ];

  return (
    <div className={`p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto max-h-[calc(100vh-64px)] select-none ${
      isLight ? 'text-slate-800' : 'text-slate-100'
    }`}>
      {/* Top Banner: Protocol Constraint & Engine State */}
      <div className={`border rounded-xl p-5 shadow-xl relative overflow-hidden ${
        isLight 
          ? 'bg-gradient-to-r from-blue-50 via-white to-cyan-50 border-slate-200' 
          : 'bg-gradient-to-r from-scada-surface via-scada-card to-cyan-950/30 border-scada-border'
      }`}>
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-cyan-500/5 blur-3xl pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${
                isLight 
                  ? 'bg-blue-100 text-blue-800 border-blue-300' 
                  : 'bg-cyan-950 text-cyan-300 border-cyan-800'
              }`}>
                SCADA MISSION CONTROL
              </span>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                No CDP / No LLDP Enforced
              </span>
            </div>
            <h1 className={`text-2xl font-black tracking-tight ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              Pipeline Network Topology Intelligence System
            </h1>
            <p className={`text-xs max-w-2xl mt-1 leading-relaxed ${
              isLight ? 'text-slate-600' : 'text-slate-300'
            }`}>
              Real-time multi-source topology discovery using SNMPv3 authPriv, ARP/MAC tables, NetFlow v9/IPFIX, and EIGRP routing telemetry across pipeline operational facilities.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveScreen('topology')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-mono font-semibold shadow-lg transition active:scale-95 ${
                isLight 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20' 
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-950/50'
              }`}
            >
              <Network className="w-4 h-4" />
              <span>LAUNCH TOPOLOGY CANVAS</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
        {/* Total Assets */}
        <div 
          onClick={() => setActiveScreen('inventory')}
          className={`border p-4 rounded-xl cursor-pointer transition shadow-lg group ${
            isLight 
              ? 'bg-white border-slate-200 hover:border-blue-400' 
              : 'bg-scada-card/80 border-scada-border hover:border-cyan-500/60'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[11px] font-mono font-semibold uppercase ${isLight ? 'text-slate-500' : 'text-scada-subtle'}`}>Total Assets</span>
            <Server className={`w-4 h-4 group-hover:scale-110 transition ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
          </div>
          <div className={`text-2xl font-black font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>{devices.length}</div>
          <div className={`text-[10px] mt-1 font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            {reachableDevices.length} Reachable | {staleDevices.length} Stale
          </div>
        </div>

        {/* Physical Links */}
        <div 
          onClick={() => setActiveScreen('topology')}
          className={`border p-4 rounded-xl cursor-pointer transition shadow-lg group ${
            isLight 
              ? 'bg-white border-slate-200 hover:border-emerald-400' 
              : 'bg-scada-card/80 border-scada-border hover:border-emerald-500/60'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[11px] font-mono font-semibold uppercase ${isLight ? 'text-slate-500' : 'text-scada-subtle'}`}>Physical Links</span>
            <HardDrive className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition" />
          </div>
          <div className={`text-2xl font-black font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>{physicalLinks.length}</div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-mono font-semibold">
            MAC & Switch Port Verified
          </div>
        </div>

        {/* EIGRP Adjacencies */}
        <div 
          onClick={() => setActiveScreen('topology')}
          className={`border p-4 rounded-xl cursor-pointer transition shadow-lg group ${
            isLight 
              ? 'bg-white border-slate-200 hover:border-blue-400' 
              : 'bg-scada-card/80 border-scada-border hover:border-blue-500/60'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[11px] font-mono font-semibold uppercase ${isLight ? 'text-slate-500' : 'text-scada-subtle'}`}>EIGRP Peers</span>
            <Cpu className={`w-4 h-4 group-hover:scale-110 transition ${isLight ? 'text-blue-600' : 'text-blue-400'}`} />
          </div>
          <div className={`text-2xl font-black font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>{eigrpLinks.length}</div>
          <div className={`text-[10px] mt-1 font-mono font-semibold ${isLight ? 'text-blue-600' : 'text-blue-400'}`}>
            AS 100 Dynamic Routing
          </div>
        </div>

        {/* Active Alerts */}
        <div 
          onClick={() => setActiveScreen('alerts')}
          className={`border p-4 rounded-xl cursor-pointer transition shadow-lg group ${
            criticalAlerts.length > 0 
              ? isLight ? 'bg-rose-50 border-rose-300' : 'bg-rose-950/60 border-rose-600/80' 
              : openAlerts.length > 0 
                ? isLight ? 'bg-amber-50 border-amber-300' : 'bg-amber-950/40 border-amber-600/60'
                : isLight ? 'bg-white border-slate-200' : 'bg-scada-card/80 border-scada-border'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[11px] font-mono font-semibold uppercase ${isLight ? 'text-slate-500' : 'text-scada-subtle'}`}>Security Alerts</span>
            <ShieldAlert className={`w-4 h-4 ${criticalAlerts.length > 0 ? 'text-rose-500 animate-bounce' : 'text-amber-500'}`} />
          </div>
          <div className={`text-2xl font-black font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>{openAlerts.length}</div>
          <div className="text-[10px] text-rose-500 mt-1 font-mono font-semibold">
            {criticalAlerts.length} Critical Incident{criticalAlerts.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Rogues Detected */}
        <div 
          onClick={() => setActiveScreen('alerts')}
          className={`border p-4 rounded-xl cursor-pointer transition shadow-lg group ${
            rogueDevices.length > 0 
              ? isLight ? 'bg-rose-100 border-rose-400 ring-2 ring-rose-400/40' : 'bg-rose-950/80 border-rose-500 ring-2 ring-rose-500/40' 
              : isLight ? 'bg-white border-slate-200' : 'bg-scada-card/80 border-scada-border'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[11px] font-mono font-semibold uppercase ${isLight ? 'text-slate-500' : 'text-scada-subtle'}`}>Rogue Assets</span>
            <AlertTriangle className={`w-4 h-4 ${rogueDevices.length > 0 ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`} />
          </div>
          <div className={`text-2xl font-black font-mono ${rogueDevices.length > 0 ? 'text-rose-600' : isLight ? 'text-slate-900' : 'text-white'}`}>
            {rogueDevices.length}
          </div>
          <div className={`text-[10px] mt-1 font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            {rogueDevices.length > 0 ? 'Action Required' : '0 Unauthorized'}
          </div>
        </div>

        {/* Data Freshness */}
        <div className={`border p-4 rounded-xl shadow-lg ${
          isLight ? 'bg-white border-slate-200' : 'bg-scada-card/80 border-scada-border'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[11px] font-mono font-semibold uppercase ${isLight ? 'text-slate-500' : 'text-scada-subtle'}`}>Discovery Cycle</span>
            <Clock className={`w-4 h-4 ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
          </div>
          <div className={`text-sm font-bold font-mono truncate ${isLight ? 'text-slate-900' : 'text-white'}`} title={lastPollTime}>
            {lastPollTime.split(' ')[1] || 'Active'}
          </div>
          <div className={`text-[10px] mt-1 font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Every {config.polling_interval_seconds}s (SNMPv3)
          </div>
        </div>
      </div>

      {/* Pipeline Corridor Station Health */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className={`text-sm font-bold uppercase tracking-wider font-mono flex items-center gap-2 ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            <MapPin className={`w-4 h-4 ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
            <span>Monitored Pipeline Stations & SCADA Facilities</span>
          </h2>
          <span className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            GAIL Gas Grid Chainage Hazira - Dadri
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {stations.map(st => {
            const stationDevices = devices.filter(d => d.site_id === st.id);
            const hasRogue = stationDevices.some(d => d.is_rogue);
            const hasStale = stationDevices.some(d => d.monitoring_status === 'STALE');

            return (
              <div 
                key={st.id}
                className={`p-3.5 rounded-xl border transition shadow-lg ${
                  hasRogue 
                    ? isLight ? 'bg-rose-50 border-rose-300 shadow-rose-100' : 'bg-rose-950/40 border-rose-500/80 shadow-rose-950/30' 
                    : hasStale 
                      ? isLight ? 'bg-amber-50 border-amber-300' : 'bg-amber-950/30 border-amber-600/60' 
                      : isLight ? 'bg-white border-slate-200 hover:border-blue-300' : 'bg-scada-surface border-scada-border hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1 font-mono">
                  <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{st.id}</span>
                  <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-scada-subtle'}`}>{st.km}</span>
                </div>
                <div className={`text-xs font-semibold truncate ${isLight ? 'text-slate-800' : 'text-slate-200'}`} title={st.name}>
                  {st.name}
                </div>
                <div className={`text-[10px] font-mono mt-0.5 truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {st.type}
                </div>

                <div className={`mt-3 pt-2 border-t flex items-center justify-between text-[11px] font-mono ${
                  isLight ? 'border-slate-200' : 'border-scada-border/60'
                }`}>
                  <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>{stationDevices.length} Assets</span>
                  {hasRogue ? (
                    <span className="text-rose-500 font-bold animate-pulse">ROGUE DETECTED</span>
                  ) : hasStale ? (
                    <span className="text-amber-500 font-bold">STALE WARNING</span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">NORMAL</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Section: Recent Topology Events & Security Anomalies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Topology Events */}
        <div className={`border rounded-xl p-4 shadow-xl space-y-3 ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-scada-surface border-scada-border'
        }`}>
          <div className={`flex items-center justify-between pb-2 border-b ${
            isLight ? 'border-slate-200' : 'border-scada-border'
          }`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-2 ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              <Activity className={`w-4 h-4 ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
              <span>Real-Time Discovery & Topology Events</span>
            </h3>
            <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-scada-subtle'}`}>
              {events.length} Recorded
            </span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {events.slice(0, 6).map(evt => (
              <div key={evt.event_id} className={`p-2.5 rounded-lg border text-xs font-mono space-y-1 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-scada-card border-scada-border'
              }`}>
                <div className="flex items-center justify-between text-[10px]">
                  <span className={`font-bold ${isLight ? 'text-blue-600' : 'text-cyan-300'}`}>{evt.event_type}</span>
                  <span className={isLight ? 'text-slate-500' : 'text-slate-500'}>{evt.detected_at}</span>
                </div>
                <p className={`text-[11px] font-sans leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  {evt.description}
                </p>
                <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                  Affected: <span className={isLight ? 'text-slate-800' : 'text-slate-300'}>{evt.affected_resources.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Security Alerts */}
        <div className={`border rounded-xl p-4 shadow-xl space-y-3 ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-scada-surface border-scada-border'
        }`}>
          <div className={`flex items-center justify-between pb-2 border-b ${
            isLight ? 'border-slate-200' : 'border-scada-border'
          }`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-2 ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <span>Priority Anomalies & Baseline Deviations</span>
            </h3>
            <button 
              onClick={() => setActiveScreen('alerts')}
              className={`text-[10px] font-mono hover:underline flex items-center gap-1 ${
                isLight ? 'text-blue-600' : 'text-cyan-400'
              }`}
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {alerts.length === 0 ? (
              <div className={`p-8 text-center text-xs font-mono ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500/50" />
                No active security anomalies. Network matches frozen baseline.
              </div>
            ) : (
              alerts.slice(0, 5).map(alert => (
                <div 
                  key={alert.alert_id}
                  className={`p-2.5 rounded-lg border text-xs font-mono space-y-1 ${
                    alert.severity === 'CRITICAL' 
                      ? isLight ? 'bg-rose-50 border-rose-300' : 'bg-rose-950/40 border-rose-600/70' 
                      : alert.severity === 'HIGH'
                        ? isLight ? 'bg-amber-50 border-amber-300' : 'bg-amber-950/30 border-amber-600/60'
                        : isLight ? 'bg-slate-50 border-slate-200' : 'bg-scada-card border-scada-border'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className={`font-bold px-1.5 py-0.2 rounded ${
                      alert.severity === 'CRITICAL' ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>{alert.created_at}</span>
                  </div>
                  <div className={`text-[11px] font-bold font-sans ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {alert.description}
                  </div>
                  <div className={`text-[10px] truncate ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    Evidence: {alert.evidence}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
