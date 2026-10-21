import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Copy, 
  CheckCircle2, 
  Lock 
} from 'lucide-react';
import { useTopology } from '../../context/TopologyContext';

export const ReportsView: React.FC = () => {
  const { devices, relationships, alerts, config, theme } = useTopology();
  const isLight = theme === 'light';
  const [activeReport, setActiveReport] = useState<'compliance' | 'inventory' | 'relationships' | 'security'>('compliance');
  const [copied, setCopied] = useState(false);

  const generateDeviceCsv = () => {
    const headers = 'device_id,hostname,management_ip,device_type,vendor,model,site_name,status,confidence\n';
    const rows = devices.map(d => 
      `"${d.device_id}","${d.hostname}","${d.management_addresses[0] || ''}","${d.device_type}","${d.vendor}","${d.model}","${d.site_name}","${d.monitoring_status}","${d.identity_confidence}%"`
    ).join('\n');
    return headers + rows;
  };

  const generateRelationshipsCsv = () => {
    const headers = 'relationship_id,source_device,destination_device,type,confidence_class,confidence_score,status\n';
    const rows = relationships.map(r => 
      `"${r.relationship_id}","${r.source_device_id}","${r.destination_device_id}","${r.relationship_type}","${r.confidence_class}","${r.confidence_score}%","${r.status}"`
    ).join('\n');
    return headers + rows;
  };

  const generateSecurityCsv = () => {
    const headers = 'alert_id,severity,alert_type,description,affected_devices,status,created_at\n';
    const rows = alerts.map(a => 
      `"${a.alert_id}","${a.severity}","${a.alert_type}","${a.description.replace(/"/g, '""')}","${a.affected_device_names.join('; ')}","${a.investigation_status}","${a.created_at}"`
    ).join('\n');
    return headers + rows;
  };

  const generateComplianceJson = () => {
    return JSON.stringify({
      audit_report: "GAIL Pipeline Network Topology Intelligence System (PNTIS)",
      timestamp: new Date().toISOString(),
      protocol_compliance: {
        cdp_used: false,
        lldp_used: false,
        routing_protocol: "EIGRP AS 100",
        telemetry: ["SNMPv3 AuthPriv", "ARP Tables", "MAC Forwarding Tables", "Syslog Traps"]
      },
      inventory: {
        total_assets: devices.length,
        reachable: devices.filter(d => d.monitoring_status === 'REACHABLE').length,
        stale: devices.filter(d => d.monitoring_status === 'STALE').length,
        rogue_assets: devices.filter(d => d.is_rogue).length
      },
      links: {
        total_relationships: relationships.length,
        physical_cable_links: relationships.filter(r => r.relationship_type === 'PHYSICAL_CABLE' || r.relationship_type === 'SWITCH_PORT_FORWARD').length,
        eigrp_adjacencies: relationships.filter(r => r.relationship_type === 'EIGRP_ADJACENCY').length,
      },
      active_anomalies_count: alerts.filter(a => a.investigation_status === 'OPEN').length
    }, null, 2);
  };

  const getReport = () => {
    switch (activeReport) {
      case 'inventory':
        return { filename: 'pntis_inventory.csv', content: generateDeviceCsv(), mime: 'text/csv' };
      case 'relationships':
        return { filename: 'pntis_topology_links.csv', content: generateRelationshipsCsv(), mime: 'text/csv' };
      case 'security':
        return { filename: 'pntis_security_alerts.csv', content: generateSecurityCsv(), mime: 'text/csv' };
      case 'compliance':
        return { filename: 'pntis_compliance_audit.json', content: generateComplianceJson(), mime: 'application/json' };
    }
  };

  const report = getReport();

  const handleDownload = () => {
    const blob = new Blob([report.content], { type: report.mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = report.filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(report.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4 select-none font-mono">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className={`w-4 h-4 ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
          <h1 className={`text-base font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Compliance & Audit Export
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className={`px-3 py-1.5 rounded-lg text-xs transition border ${
              isLight 
                ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-sm' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-transparent'
            }`}
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow transition ${
              isLight ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-cyan-600 hover:bg-cyan-500 text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download File</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex items-center gap-1 p-1 rounded-lg text-xs border ${
        isLight ? 'bg-slate-100 border-slate-200' : 'bg-scada-surface border-scada-border/80'
      }`}>
        <button
          onClick={() => setActiveReport('compliance')}
          className={`px-3 py-1.5 rounded-md transition ${
            activeReport === 'compliance' 
              ? isLight ? 'bg-white text-blue-700 font-bold shadow-sm' : 'bg-scada-card text-white font-bold' 
              : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
          }`}
        >
          Compliance Audit (JSON)
        </button>
        <button
          onClick={() => setActiveReport('inventory')}
          className={`px-3 py-1.5 rounded-md transition ${
            activeReport === 'inventory' 
              ? isLight ? 'bg-white text-blue-700 font-bold shadow-sm' : 'bg-scada-card text-white font-bold' 
              : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
          }`}
        >
          Device Inventory (CSV)
        </button>
        <button
          onClick={() => setActiveReport('relationships')}
          className={`px-3 py-1.5 rounded-md transition ${
            activeReport === 'relationships' 
              ? isLight ? 'bg-white text-blue-700 font-bold shadow-sm' : 'bg-scada-card text-white font-bold' 
              : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
          }`}
        >
          Topology Links (CSV)
        </button>
        <button
          onClick={() => setActiveReport('security')}
          className={`px-3 py-1.5 rounded-md transition ${
            activeReport === 'security' 
              ? isLight ? 'bg-white text-blue-700 font-bold shadow-sm' : 'bg-scada-card text-white font-bold' 
              : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
          }`}
        >
          Security Alerts (CSV)
        </button>
      </div>

      {/* Preview */}
      <div className={`border rounded-xl overflow-hidden ${
        isLight ? 'bg-white border-slate-200 shadow-md' : 'bg-scada-surface border-scada-border/80'
      }`}>
        <div className={`px-3 py-2 border-b text-[11px] flex items-center justify-between ${
          isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-scada-card/60 border-scada-border/60 text-slate-400'
        }`}>
          <span className="font-bold">{report.filename}</span>
          <span className="uppercase text-[10px]">{report.mime}</span>
        </div>
        <pre className={`p-4 text-xs overflow-x-auto max-h-[420px] leading-relaxed select-text font-mono ${
          isLight ? 'bg-slate-900 text-emerald-300' : 'bg-[#070a12] text-cyan-200/90'
        }`}>
          {report.content}
        </pre>
      </div>
    </div>
  );
};
