import React, { useMemo, useState } from 'react';
import { 
  History, 
  GitCompare, 
  CheckCircle2, 
  Snowflake,
  Plus
} from 'lucide-react';
import { useTopology } from '../../context/TopologyContext';
import { compareSnapshots } from '../../engine/changeDetection';
import { TopologySnapshot } from '../../types';

export const HistoryDiffView: React.FC = () => {
  const { snapshots, baselineSnapshot, devices, relationships, alerts, freezeCurrentAsBaseline, theme } = useTopology();
  const isLight = theme === 'light';

  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string>(baselineSnapshot?.snapshot_id || (snapshots[0]?.snapshot_id ?? ''));
  const [freezeToast, setFreezeToast] = useState(false);

  const currentSnapshot: TopologySnapshot = useMemo(() => {
    return {
      snapshot_id: 'SNAP-CURRENT-LIVE',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      label: 'Live Discovered State',
      device_count: devices.length,
      relationship_count: relationships.length,
      devices: JSON.parse(JSON.stringify(devices)),
      relationships: JSON.parse(JSON.stringify(relationships)),
      alerts_count: alerts.filter(a => a.investigation_status === 'OPEN').length
    };
  }, [devices, relationships, alerts]);

  const baseSnapshot = snapshots.find(s => s.snapshot_id === selectedSnapshotId) || baselineSnapshot || currentSnapshot;
  const diff = useMemo(() => compareSnapshots(currentSnapshot, baseSnapshot), [currentSnapshot, baseSnapshot]);

  const handleFreeze = () => {
    freezeCurrentAsBaseline();
    setFreezeToast(true);
    setTimeout(() => setFreezeToast(false), 3000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4 select-none font-mono">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <History className={`w-4 h-4 ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
          <h1 className={`text-base font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Baseline Comparison & Diff
          </h1>
        </div>

        <button
          onClick={handleFreeze}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            isLight ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm' : 'bg-cyan-600 hover:bg-cyan-500 text-white'
          }`}
        >
          <Snowflake className="w-3.5 h-3.5" />
          <span>Freeze Baseline</span>
        </button>
      </div>

      {freezeToast && (
        <div className={`p-2.5 rounded-lg text-xs flex items-center gap-2 border ${
          isLight ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-emerald-950/80 border-emerald-700/60 text-emerald-300'
        }`}>
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Current network state frozen as official baseline!</span>
        </div>
      )}

      {/* Snapshot Selector */}
      <div className={`border rounded-xl p-3 flex items-center justify-between gap-3 text-xs ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-scada-surface border-scada-border/80'
      }`}>
        <div className={`flex items-center gap-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
          <GitCompare className={`w-4 h-4 ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
          <span>Baseline Snapshot:</span>
          <select
            value={selectedSnapshotId}
            onChange={(e) => setSelectedSnapshotId(e.target.value)}
            className={`border rounded px-2.5 py-1 font-bold outline-none ${
              isLight 
                ? 'bg-slate-50 border-slate-300 text-slate-900' 
                : 'bg-scada-card border-scada-border text-cyan-300'
            }`}
          >
            {snapshots.map(s => (
              <option key={s.snapshot_id} value={s.snapshot_id}>
                {s.label} ({s.timestamp})
              </option>
            ))}
          </select>
        </div>

        <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          Target: <strong className={isLight ? 'text-emerald-700' : 'text-emerald-400'}>Live Discovered State</strong>
        </div>
      </div>

      {/* Summary Pills */}
      <div className="grid grid-cols-3 gap-3 text-xs">
        <div className={`p-3 border rounded-lg ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-scada-surface border-scada-border/80'
        }`}>
          <div className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-scada-subtle'}`}>Added Devices</div>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">+{diff.addedDevices.length}</div>
        </div>

        <div className={`p-3 border rounded-lg ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-scada-surface border-scada-border/80'
        }`}>
          <div className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-scada-subtle'}`}>Modified Devices</div>
          <div className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5">{diff.modifiedDevices.length}</div>
        </div>

        <div className={`p-3 border rounded-lg ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-scada-surface border-scada-border/80'
        }`}>
          <div className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-scada-subtle'}`}>Link Changes</div>
          <div className={`text-lg font-bold mt-0.5 ${isLight ? 'text-blue-600' : 'text-cyan-400'}`}>
            {diff.addedRelationships.length + diff.modifiedRelationships.length}
          </div>
        </div>
      </div>

      {/* Diff Details */}
      <div className={`border rounded-xl p-4 text-xs space-y-2 ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-scada-surface border-scada-border/80'
      }`}>
        <div className={`font-bold text-xs uppercase tracking-wider pb-2 border-b ${
          isLight ? 'text-slate-900 border-slate-200' : 'text-white border-scada-border/60'
        }`}>
          Deviations from Baseline
        </div>

        {diff.addedDevices.length === 0 && diff.modifiedDevices.length === 0 && diff.addedRelationships.length === 0 && diff.modifiedRelationships.length === 0 ? (
          <div className={`py-6 text-center ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
            <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-emerald-500" />
            Zero deviations. Real-time topology matches the baseline exactly.
          </div>
        ) : (
          <div className="space-y-2 pt-1">
            {diff.addedDevices.map(d => (
              <div key={d.device_id} className={`p-2.5 rounded border ${
                isLight ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
              }`}>
                <span className="font-bold">+ ADDED:</span> {d.hostname} ({d.management_addresses[0] || 'L2'}) — Site: {d.site_name}
              </div>
            ))}

            {diff.modifiedDevices.map(m => (
              <div key={m.device.device_id} className={`p-2.5 rounded border ${
                isLight ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-amber-950/40 border-amber-800/60 text-amber-300'
              }`}>
                <span className="font-bold">~ MODIFIED:</span> {m.device.hostname}: {m.changes.join(', ')}
              </div>
            ))}

            {diff.modifiedRelationships.map(r => (
              <div key={r.relationship.relationship_id} className={`p-2.5 rounded border ${
                isLight ? 'bg-blue-50 border-blue-300 text-blue-800' : 'bg-cyan-950/40 border-cyan-800/60 text-cyan-300'
              }`}>
                <span className="font-bold">~ LINK DRIFT:</span> {r.relationship.source_device_id} ↔ {r.relationship.destination_device_id} ({r.changes.join(', ')})
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
