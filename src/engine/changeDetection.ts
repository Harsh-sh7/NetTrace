import { Device, Relationship, SecurityAlert, TopologyEvent, TopologySnapshot, AlertSeverity } from '../types';

export interface TopologyDiff {
  addedDevices: Device[];
  removedDevices: Device[];
  modifiedDevices: { device: Device; changes: string[] }[];
  addedRelationships: Relationship[];
  removedRelationships: Relationship[];
  modifiedRelationships: { relationship: Relationship; changes: string[] }[];
}

export function compareSnapshots(currentSnapshot: TopologySnapshot, baselineSnapshot: TopologySnapshot): TopologyDiff {
  const baselineDevMap = new Map(baselineSnapshot.devices.map(d => [d.device_id, d]));
  const currentDevMap = new Map(currentSnapshot.devices.map(d => [d.device_id, d]));

  const addedDevices: Device[] = [];
  const removedDevices: Device[] = [];
  const modifiedDevices: { device: Device; changes: string[] }[] = [];

  for (const dev of currentSnapshot.devices) {
    const base = baselineDevMap.get(dev.device_id);
    if (!base) {
      addedDevices.push(dev);
    } else {
      const changes: string[] = [];
      if (base.monitoring_status !== dev.monitoring_status) {
        changes.push(`Status changed from ${base.monitoring_status} to ${dev.monitoring_status}`);
      }
      if (base.identity_confidence !== dev.identity_confidence) {
        changes.push(`Confidence changed from ${base.identity_confidence}% to ${dev.identity_confidence}%`);
      }
      if (base.is_rogue !== dev.is_rogue) {
        changes.push(`Rogue flag toggled to ${dev.is_rogue}`);
      }
      if (changes.length > 0) {
        modifiedDevices.push({ device: dev, changes });
      }
    }
  }

  for (const base of baselineSnapshot.devices) {
    if (!currentDevMap.has(base.device_id)) {
      removedDevices.push(base);
    }
  }

  const baselineRelMap = new Map(baselineSnapshot.relationships.map(r => [r.relationship_id, r]));
  const currentRelMap = new Map(currentSnapshot.relationships.map(r => [r.relationship_id, r]));

  const addedRelationships: Relationship[] = [];
  const removedRelationships: Relationship[] = [];
  const modifiedRelationships: { relationship: Relationship; changes: string[] }[] = [];

  for (const rel of currentSnapshot.relationships) {
    const base = baselineRelMap.get(rel.relationship_id);
    if (!base) {
      addedRelationships.push(rel);
    } else {
      const changes: string[] = [];
      if (base.status !== rel.status) {
        changes.push(`Link status changed from ${base.status} to ${rel.status}`);
      }
      if (base.confidence_class !== rel.confidence_class) {
        changes.push(`Confidence class changed from ${base.confidence_class} to ${rel.confidence_class}`);
      }
      if (changes.length > 0) {
        modifiedRelationships.push({ relationship: rel, changes });
      }
    }
  }

  for (const base of baselineSnapshot.relationships) {
    if (!currentRelMap.has(base.relationship_id)) {
      removedRelationships.push(base);
    }
  }

  return {
    addedDevices,
    removedDevices,
    modifiedDevices,
    addedRelationships,
    removedRelationships,
    modifiedRelationships
  };
}

export function evaluateSecurityAlerts(
  devices: Device[],
  relationships: Relationship[],
  baselineSnapshot: TopologySnapshot | null,
  maintenanceWindowActive: boolean
): { alerts: SecurityAlert[]; events: TopologyEvent[] } {
  const alerts: SecurityAlert[] = [];
  const events: TopologyEvent[] = [];
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

  const baselineDevIds = new Set(baselineSnapshot?.devices.map(d => d.device_id) || []);

  // 1. Rogue / Unknown Device Detection
  for (const device of devices) {
    if (device.is_rogue || (!device.approved_in_baseline && baselineSnapshot && !baselineDevIds.has(device.device_id))) {
      alerts.push({
        alert_id: `ALERT-ROGUE-${device.device_id}`,
        alert_type: 'ROGUE_DEVICE',
        severity: 'CRITICAL',
        affected_device_ids: [device.device_id],
        affected_device_names: [device.hostname],
        description: `Unapproved asset detected on critical SCADA segment: ${device.hostname} (${device.management_addresses.join(', ') || 'No IP'})`,
        evidence: `Device MAC ${device.interfaces[0]?.mac_address || 'unknown'} observed via switch port forwarding table without baseline authorization.`,
        created_at: device.first_seen || now,
        investigation_status: 'OPEN',
        recommended_actions: [
          'Immediately isolate the switch port hosting this MAC address.',
          'Verify physical site access log at site ' + device.site_name,
          'Engage OT Security Incident Response Team.'
        ]
      });
    }

    // 2. Stale Critical Asset Detection
    if (device.monitoring_status === 'STALE' || device.monitoring_status === 'UNREACHABLE') {
      const isCritical = ['ROUTER', 'SCADA_SERVER', 'PLC'].includes(device.device_type);
      alerts.push({
        alert_id: `ALERT-STALE-${device.device_id}`,
        alert_type: 'STALE_CRITICAL_ASSET',
        severity: isCritical ? 'HIGH' : 'MEDIUM',
        affected_device_ids: [device.device_id],
        affected_device_names: [device.hostname],
        description: `Telemetry loss: ${device.hostname} at ${device.site_name} is currently ${device.monitoring_status}`,
        evidence: `No successful SNMPv3 poll response for > 90 seconds. Last seen: ${device.last_seen}.`,
        created_at: now,
        investigation_status: 'OPEN',
        recommended_actions: [
          'Inspect telemetry link status to ' + device.site_name,
          'Check local station power supply and industrial UPS status.',
          'Verify SNMPv3 agent responsiveness.'
        ]
      });
    }
  }

  // 3. Down / Degraded Links & EIGRP Neighbor Failures
  for (const rel of relationships) {
    if (rel.status === 'DOWN') {
      const isEigrp = rel.relationship_type === 'EIGRP_ADJACENCY';
      alerts.push({
        alert_id: `ALERT-DOWN-${rel.relationship_id}`,
        alert_type: isEigrp ? 'EIGRP_NEIGHBOR_DOWN' : 'UNAUTHORIZED_TOPOLOGY_CHANGE',
        severity: isEigrp ? 'HIGH' : 'MEDIUM',
        affected_device_ids: [rel.source_device_id, rel.destination_device_id],
        affected_device_names: [rel.source_device_id, rel.destination_device_id],
        description: `${isEigrp ? 'EIGRP AS ' + (rel.eigrp_as || 100) + ' routing neighbor lost' : 'Physical communication link down'} between ${rel.source_device_id} and ${rel.destination_device_id}`,
        evidence: `SNMPv3 link failure trap received. Last active: ${rel.last_seen}.`,
        created_at: now,
        investigation_status: 'OPEN',
        recommended_actions: [
          'Verify optical OPGW fiber continuity or microwave link status.',
          'Review routing table reconvergence on upstream core routers.'
        ]
      });
    }

    if (rel.confidence_class === 'UNCERTAIN') {
      alerts.push({
        alert_id: `ALERT-UNCERTAIN-${rel.relationship_id}`,
        alert_type: 'EVIDENCE_CONFLICT',
        severity: 'MEDIUM',
        affected_device_ids: [rel.source_device_id, rel.destination_device_id],
        affected_device_names: [rel.source_device_id, rel.destination_device_id],
        description: `Conflicting or ambiguous telemetry evidence for connection between ${rel.source_device_id} and ${rel.destination_device_id}`,
        evidence: rel.evidence_references.map(e => e.description).join(' | '),
        created_at: now,
        investigation_status: 'OPEN',
        recommended_actions: [
          'Review switch MAC address table for port flapping or MAC spoofing.',
          'Verify ARP table bindings.'
        ]
      });
    }
  }

  return { alerts, events };
}
