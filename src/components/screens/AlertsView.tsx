import React from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  Network 
} from 'lucide-react';
import { useTopology } from '../../context/TopologyContext';

export const AlertsView: React.FC = () => {
  const { alerts, acknowledgeAlert, resolveAlert, selectDevice, setActiveScreen, theme } = useTopology();
  const isLight = theme === 'light';

  const locateInTopology = (deviceId: string) => {
    selectDevice(deviceId);
    setActiveScreen('topology');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4 select-none font-mono">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <h1 className={`text-base font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Security & Topology Alerts
          </h1>
          <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>({alerts.length} total)</span>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className={`border rounded-xl p-8 text-center text-xs ${
            isLight ? 'bg-white border-slate-200 text-slate-500 shadow-sm' : 'bg-scada-surface border-scada-border/80 text-slate-400'
          }`}>
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
            <div className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>No Active Anomalies</div>
            <p className={`mt-1 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
              All telemetry matches the approved SCADA network baseline.
            </p>
          </div>
        ) : (
          alerts.map(alert => {
            const isCritical = alert.severity === 'CRITICAL';
            const isOpen = alert.investigation_status === 'OPEN';

            return (
              <div
                key={alert.alert_id}
                className={`p-4 rounded-xl border text-xs space-y-2.5 transition ${
                  isCritical 
                    ? isLight ? 'bg-rose-50/80 border-rose-300 shadow-sm' : 'bg-rose-950/30 border-rose-600/70' 
                    : isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-scada-surface border-scada-border/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isCritical ? 'bg-rose-600 text-white animate-pulse' : isLight ? 'bg-slate-100 text-slate-700 border border-slate-200' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className={`font-bold ${isLight ? 'text-blue-700' : 'text-cyan-300'}`}>{alert.alert_type}</span>
                  </div>
                  <span className={`text-[10px] flex items-center gap-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    <Clock className="w-3 h-3" />
                    {alert.created_at}
                  </span>
                </div>

                <div className={`font-sans text-xs font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {alert.description}
                </div>

                <div className={`p-2.5 rounded border text-[11px] font-sans ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-scada-card/60 border-scada-border/60 text-slate-300'
                }`}>
                  <span className={`font-bold font-mono text-[10px] uppercase block mb-0.5 ${isLight ? 'text-slate-500' : 'text-scada-subtle'}`}>Evidence:</span>
                  {alert.evidence}
                </div>

                {/* Actions */}
                <div className={`flex items-center justify-between pt-1 border-t text-xs ${isLight ? 'border-slate-200' : 'border-scada-border/60'}`}>
                  <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                    Status: <strong className={isOpen ? 'text-amber-500' : 'text-emerald-500'}>{alert.investigation_status}</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    {alert.affected_device_ids[0] && (
                      <button
                        onClick={() => locateInTopology(alert.affected_device_ids[0])}
                        className={`px-2 py-1 rounded text-[11px] flex items-center gap-1 transition border ${
                          isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-transparent'
                        }`}
                      >
                        <Network className={`w-3 h-3 ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
                        <span>Locate</span>
                      </button>
                    )}

                    {isOpen && (
                      <button
                        onClick={() => acknowledgeAlert(alert.alert_id)}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                          isLight ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm' : 'bg-cyan-700 hover:bg-cyan-600 text-white'
                        }`}
                      >
                        Acknowledge
                      </button>
                    )}

                    {alert.investigation_status !== 'RESOLVED' && (
                      <button
                        onClick={() => resolveAlert(alert.alert_id)}
                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold shadow-sm"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
