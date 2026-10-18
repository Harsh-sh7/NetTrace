import { Device, Relationship, SecurityAlert, TopologyEvent } from '../types';

export type ScenarioType = 
  | 'SCENARIO_A_NEW_AUTHORIZED' 
  | 'SCENARIO_B_ROGUE_DEVICE' 
  | 'SCENARIO_C_EIGRP_FAILOVER' 
  | 'SCENARIO_D_STALE_OUTAGE' 
  | 'SCENARIO_E_CONFLICTING_EVIDENCE' 
  | 'SCENARIO_F_RECOVERY';

export interface ScenarioDefinition {
  id: ScenarioType;
  title: string;
  badge: string;
  description: string;
  expectedOutcome: string;
}

export const SCENARIO_DEFINITIONS: ScenarioDefinition[] = [
  {
    id: 'SCENARIO_A_NEW_AUTHORIZED',
    title: 'Scenario A: New Authorized Router',
    badge: 'Baseline Compliant',
    description: 'Add a new authorized valve station router (RTR-VS07-EIGRP) with valid inventory registration.',
    expectedOutcome: 'Device appears in inventory & topology with OBSERVED confidence; no security alarms.'
  },
  {
    id: 'SCENARIO_B_ROGUE_DEVICE',
    title: 'Scenario B: Rogue Device Attack',
    badge: 'Security Incident',
    description: 'An unauthorized Raspberry Pi sniffer (ROGUE-SNIFFER-01) plugs into Valve Station VS-04 switch.',
    expectedOutcome: 'System flags CRITICAL Rogue Device alert, highlights unauthorized switch port attachment.'
  },
  {
    id: 'SCENARIO_C_EIGRP_FAILOVER',
    title: 'Scenario C: EIGRP Route Failure & Failover',
    badge: 'Routing Convergence',
    description: 'Simulate fiber cut on primary Hazira-Vijaipur backbone; EIGRP neighbor drops and reroutes.',
    expectedOutcome: 'Primary link marked DOWN (pulsing red/amber); routing event logged; alternative path utilized.'
  },
  {
    id: 'SCENARIO_D_STALE_OUTAGE',
    title: 'Scenario D: Transient Device Outage',
    badge: 'Freshness Tracking',
    description: 'Cathodic protection sensor stops responding to SNMPv3 queries during solar power dip.',
    expectedOutcome: 'Device gracefully transitions to STALE rather than being abruptly deleted from the graph.'
  },
  {
    id: 'SCENARIO_E_CONFLICTING_EVIDENCE',
    title: 'Scenario E: Conflicting ARP-MAC Telemetry',
    badge: 'Confidence Degradation',
    description: 'Duplicate IP conflicting observations detected on field switch port.',
    expectedOutcome: 'Link confidence drops to UNCERTAIN (amber dashed line), evidence conflict alert created.'
  },
  {
    id: 'SCENARIO_F_RECOVERY',
    title: 'Scenario F: Full State Recovery',
    badge: 'Stabilization',
    description: 'Resolve simulated faults, isolate rogue node, restore links, and re-verify baseline compliance.',
    expectedOutcome: 'All devices return to REACHABLE, links return to ACTIVE with 95%+ confidence.'
  }
];

export function applyScenario(
  scenario: ScenarioType,
  currentDevices: Device[],
  currentRelationships: Relationship[]
): {
  devices: Device[];
  relationships: Relationship[];
  newEvent?: TopologyEvent;
  newAlert?: SecurityAlert;
} {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  let devices = JSON.parse(JSON.stringify(currentDevices)) as Device[];
  let relationships = JSON.parse(JSON.stringify(currentRelationships)) as Relationship[];

  switch (scenario) {
    case 'SCENARIO_A_NEW_AUTHORIZED': {
      // Check if already added
      if (devices.some(d => d.device_id === 'DEV-RTR-VS07-01')) {
        return { devices, relationships };
      }

      const newRouter: Device = {
        device_id: 'DEV-RTR-VS07-01',
        hostname: 'RTR-VS07-EIGRP.gail.ot',
        management_addresses: ['10.240.42.1'],
        device_type: 'ROUTER',
        vendor: 'Cisco Systems',
        model: 'Cisco 891F Industrial',
        site_id: 'SITE-VS07',
        site_name: 'VS-07 Dibiyapur',
        location_coordinates: [26.6800, 79.5700],
        identity_confidence: 96,
        monitoring_status: 'REACHABLE',
        first_seen: now,
        last_seen: now,
        is_rogue: false,
        approved_in_baseline: true,
        notes: 'Newly commissioned automated sectionalizing valve station router.',
        interfaces: [
          { interface_id: 'INT-VS07-01', device_id: 'DEV-RTR-VS07-01', interface_name: 'GigabitEthernet0', ip_addresses: ['10.240.102.2/30'], mac_address: '00:26:CB:77:88:01', interface_status: 'UP', speed_mbps: 1000, last_observed: now },
          { interface_id: 'INT-VS07-02', device_id: 'DEV-RTR-VS07-01', interface_name: 'FastEthernet1', ip_addresses: ['10.240.42.1/24'], mac_address: '00:26:CB:77:88:02', interface_status: 'UP', speed_mbps: 100, vlan: 42, last_observed: now }
        ],
        eigrp_neighbors: [
          { neighbor_ip: '10.240.102.1', local_interface: 'GigabitEthernet0', hold_time_seconds: 14, uptime_seconds: 120, smooth_rtt_ms: 10, as_number: 100, state: 'UP' }
        ]
      };

      devices.push(newRouter);

      // Add EIGRP link to CS01
      const newEigrpRel: Relationship = {
        relationship_id: 'REL-LOGIC-EIGRP-VS07',
        source_device_id: 'DEV-RTR-CS01-01',
        destination_device_id: 'DEV-RTR-VS07-01',
        source_interface_name: 'GigabitEthernet0/0/3',
        destination_interface_name: 'GigabitEthernet0',
        relationship_type: 'EIGRP_ADJACENCY',
        confidence_class: 'OBSERVED',
        confidence_score: 95,
        eigrp_as: 100,
        metric: 38400,
        evidence_references: [
          {
            evidence_id: `EV-EIGRP-VS07`,
            source: 'EIGRP',
            timestamp: now,
            description: 'EIGRP AS 100 neighbor table: Peer 10.240.102.2 on Gi0/0/3, Holdtime 14s, SRTT 10ms. Baseline pre-approved.',
            confidence_contribution: 75,
          }
        ],
        first_seen: now,
        last_seen: now,
        status: 'ACTIVE',
        notes: 'Commissioned spur link to Valve Station VS-07'
      };

      relationships.push(newEigrpRel);

      return {
        devices,
        relationships,
        newEvent: {
          event_id: `EVT-${Date.now()}`,
          event_type: 'DEVICE_COMMISSIONED',
          affected_resources: ['DEV-RTR-VS07-01'],
          previous_state: 'UNKNOWN',
          new_state: 'APPROVED_ONLINE',
          detected_at: now,
          evidence_references: ['SNMPV3-POLL-VS07'],
          severity: 'INFO',
          description: 'Authorized device RTR-VS07-EIGRP successfully discovered and joined EIGRP AS 100.'
        }
      };
    }

    case 'SCENARIO_B_ROGUE_DEVICE': {
      if (devices.some(d => d.device_id === 'DEV-ROGUE-01')) {
        return { devices, relationships };
      }

      const rogueDevice: Device = {
        device_id: 'DEV-ROGUE-01',
        hostname: 'ROGUE-SNIFFER-01 (UNAUTHORIZED)',
        management_addresses: ['10.240.40.199'],
        device_type: 'UNKNOWN',
        vendor: 'Raspberry Pi Foundation / Kali',
        model: 'Model 4B Promiscuous Sniffer',
        site_id: 'SITE-VS04',
        site_name: 'VS-04 Auraiya',
        location_coordinates: [26.4674, 79.5168],
        identity_confidence: 65,
        monitoring_status: 'REACHABLE',
        first_seen: now,
        last_seen: now,
        is_rogue: true,
        approved_in_baseline: false,
        notes: 'SECURITY VIOLATION: Unauthorized device attached to remote block valve station field switch.',
        interfaces: [
          { interface_id: 'INT-ROGUE-01', device_id: 'DEV-ROGUE-01', interface_name: 'eth0', ip_addresses: ['10.240.40.199/24'], mac_address: 'DE:AD:BE:EF:00:01', interface_status: 'UP', speed_mbps: 100, last_observed: now }
        ]
      };

      devices.push(rogueDevice);

      // Connect rogue device to switch SW-VS04-FIELD
      const rogueRel: Relationship = {
        relationship_id: 'REL-PHYS-ROGUE-VS04',
        source_device_id: 'DEV-SW-VS04-01',
        destination_device_id: 'DEV-ROGUE-01',
        source_interface_name: 'FastEthernet1/4',
        destination_interface_name: 'eth0',
        relationship_type: 'SWITCH_PORT_FORWARD',
        confidence_class: 'OBSERVED',
        confidence_score: 98,
        evidence_references: [
          {
            evidence_id: `EV-ROGUE-MAC`,
            source: 'MAC_TABLE',
            timestamp: now,
            description: 'SW-VS04-FIELD FastEthernet1/4 dynamically learned MAC DE:AD:BE:EF:00:01. Port was previously idle.',
            confidence_contribution: 65,
          },
          {
            evidence_id: `EV-ROGUE-ARP`,
            source: 'ARP',
            timestamp: now,
            description: 'ARP broadcast for 10.240.40.199 resolved to non-baseline MAC.',
            confidence_contribution: 33,
          }
        ],
        first_seen: now,
        last_seen: now,
        status: 'ACTIVE',
        notes: 'UNAUTHORIZED PHYSICAL ATTACHMENT ON VALVE STATION FIELD SWITCH'
      };

      relationships.push(rogueRel);

      return {
        devices,
        relationships,
        newEvent: {
          event_id: `EVT-${Date.now()}`,
          event_type: 'ROGUE_ATTACHMENT_DETECTED',
          affected_resources: ['DEV-SW-VS04-01', 'DEV-ROGUE-01'],
          previous_state: 'PORT_SECURE',
          new_state: 'SECURITY_ALERT_ROGUE',
          detected_at: now,
          evidence_references: ['MAC_TABLE-FDB-SWVS04'],
          severity: 'CRITICAL',
          description: 'CRITICAL: Unknown device DE:AD:BE:EF:00:01 detected on Valve Station VS-04 switch port FastEthernet1/4!'
        },
        newAlert: {
          alert_id: `ALERT-ROGUE-${Date.now()}`,
          alert_type: 'ROGUE_DEVICE',
          severity: 'CRITICAL',
          affected_device_ids: ['DEV-ROGUE-01', 'DEV-SW-VS04-01'],
          affected_device_names: ['ROGUE-SNIFFER-01 (UNAUTHORIZED)', 'SW-VS04-FIELD.gail.ot'],
          description: 'Rogue unauthorized hardware detected on SCADA valve control segment (10.240.40.199).',
          evidence: 'MAC DE:AD:BE:EF:00:01 observed on FastEthernet1/4 with zero baseline authorization.',
          created_at: now,
          investigation_status: 'OPEN',
          recommended_actions: [
            'Trigger emergency port shutdown on SW-VS04-FIELD FastEthernet1/4.',
            'Dispatch station security to inspect physical rack enclosure at VS-04 Auraiya.',
            'Isolate block valve telemetry VLAN 40.'
          ]
        }
      };
    }

    case 'SCENARIO_C_EIGRP_FAILOVER': {
      // Mark primary EIGRP link down
      relationships = relationships.map(rel => {
        if (rel.relationship_id === 'REL-LOGIC-EIGRP-01') {
          return {
            ...rel,
            status: 'DOWN',
            confidence_class: 'CHANGED',
            confidence_score: 40,
            last_seen: now,
            notes: 'FIBER BREAK: %DUAL-5-NBRCHANGE: EIGRP-IPv4 100: Neighbor 10.240.100.2 down: peer holding time expired'
          };
        }
        return rel;
      });

      // Add backup microwave link
      const backupRelId = 'REL-EIGRP-BACKUP-MICROWAVE';
      if (!relationships.some(r => r.relationship_id === backupRelId)) {
        relationships.push({
          relationship_id: backupRelId,
          source_device_id: 'DEV-RTR-PS02-01',
          destination_device_id: 'DEV-RTR-CS01-01',
          source_interface_name: 'GigabitEthernet0/0/2',
          destination_interface_name: 'GigabitEthernet0/0/3',
          relationship_type: 'EIGRP_ADJACENCY',
          confidence_class: 'OBSERVED',
          confidence_score: 91,
          eigrp_as: 100,
          metric: 65400,
          evidence_references: [
            {
              evidence_id: `EV-BACKUP-EIGRP`,
              source: 'EIGRP',
              timestamp: now,
              description: 'EIGRP backup adjacency established via microwave link Jhabua - Vijaipur after primary fiber break.',
              confidence_contribution: 75,
            }
          ],
          first_seen: now,
          last_seen: now,
          status: 'ACTIVE',
          notes: 'Secondary failover microwave path active'
        });
      }

      return {
        devices,
        relationships,
        newEvent: {
          event_id: `EVT-${Date.now()}`,
          event_type: 'EIGRP_FAILOVER',
          affected_resources: ['REL-LOGIC-EIGRP-01', backupRelId],
          previous_state: 'PRIMARY_LINK_ACTIVE',
          new_state: 'MICROWAVE_FAILOVER_ACTIVE',
          detected_at: now,
          evidence_references: ['SYSLOG-CCF-NBRDOWN'],
          severity: 'HIGH',
          description: 'Primary OPGW fiber Hazira-Vijaipur down; EIGRP dynamically converged over Jhabua backup path.'
        },
        newAlert: {
          alert_id: `ALERT-EIGRP-${Date.now()}`,
          alert_type: 'EIGRP_NEIGHBOR_DOWN',
          severity: 'HIGH',
          affected_device_ids: ['DEV-RTR-CCF-01', 'DEV-RTR-CS01-01'],
          affected_device_names: ['RTR-CCF-CORE01.gail.ot', 'RTR-CS01-01.gail.ot'],
          description: 'EIGRP Neighbor relationship down on primary backbone link (10.240.100.2).',
          evidence: 'Holding time expired. Optical OTDR indicates fiber cut at KM 142.6.',
          created_at: now,
          investigation_status: 'OPEN',
          recommended_actions: [
            'Dispatch optical fiber repair crew to pipeline chainage KM 142.',
            'Monitor microwave backup link bandwidth and packet loss.'
          ]
        }
      };
    }

    case 'SCENARIO_D_STALE_OUTAGE': {
      devices = devices.map(d => {
        if (d.device_id === 'DEV-CP-MON-01') {
          return {
            ...d,
            monitoring_status: 'STALE',
            identity_confidence: 72,
            notes: 'SNMPv3 polling timeouts: last response 140s ago. Solar battery low voltage suspected.'
          };
        }
        return d;
      });

      return {
        devices,
        relationships,
        newEvent: {
          event_id: `EVT-${Date.now()}`,
          event_type: 'TELEMETRY_STALE',
          affected_resources: ['DEV-CP-MON-01'],
          previous_state: 'REACHABLE',
          new_state: 'STALE',
          detected_at: now,
          evidence_references: ['SNMPV3-TIMEOUT-LOG'],
          severity: 'MEDIUM',
          description: 'Corrosion monitor CP-MONITOR-04 missed 3 consecutive poll cycles; marked STALE (not deleted).'
        }
      };
    }

    case 'SCENARIO_E_CONFLICTING_EVIDENCE': {
      relationships = relationships.map(rel => {
        if (rel.relationship_id === 'REL-PHYS-04') {
          return {
            ...rel,
            confidence_class: 'UNCERTAIN',
            confidence_score: 52,
            notes: 'CONFLICT: Inconsistent ARP mapping detected. Two distinct MAC addresses claiming IP 10.240.20.30.'
          };
        }
        return rel;
      });

      return {
        devices,
        relationships,
        newEvent: {
          event_id: `EVT-${Date.now()}`,
          event_type: 'EVIDENCE_CONFLICT_DETECTED',
          affected_resources: ['REL-PHYS-04', 'DEV-PLC-COMP-01'],
          previous_state: 'OBSERVED_CONFIDENT',
          new_state: 'UNCERTAIN_CONFLICT',
          detected_at: now,
          evidence_references: ['ARP-CACHE-FLAP-CS01'],
          severity: 'MEDIUM',
          description: 'Duplicate IP / conflicting MAC address detected on Turbine PLC interface. Confidence downgraded.'
        }
      };
    }

    case 'SCENARIO_F_RECOVERY': {
      // Remove rogue device if present
      devices = devices
        .filter(d => !d.is_rogue && d.device_id !== 'DEV-ROGUE-01')
        .map(d => ({
          ...d,
          monitoring_status: 'REACHABLE',
          identity_confidence: d.identity_confidence < 90 ? 94 : d.identity_confidence,
          notes: d.notes?.replace('FIBER BREAK:', '').replace('SNMPv3 polling timeouts:', '')
        }));

      // Restore links to active
      relationships = relationships
        .filter(r => r.destination_device_id !== 'DEV-ROGUE-01' && r.relationship_id !== 'REL-PHYS-ROGUE-VS04' && r.relationship_id !== 'REL-EIGRP-BACKUP-MICROWAVE')
        .map(r => ({
          ...r,
          status: 'ACTIVE',
          confidence_class: r.relationship_type === 'SUBNET_REACHABLE' ? 'INFERRED' : 'OBSERVED',
          confidence_score: r.confidence_score < 80 ? 95 : r.confidence_score
        }));

      return {
        devices,
        relationships,
        newEvent: {
          event_id: `EVT-${Date.now()}`,
          event_type: 'SYSTEM_STABILIZED',
          affected_resources: ['GLOBAL_TOPOLOGY'],
          previous_state: 'INCIDENT_ACTIVE',
          new_state: 'STABILIZED_BASELINE_COMPLIANT',
          detected_at: now,
          evidence_references: ['SYS-HEALTH-CHECK-PASS'],
          severity: 'INFO',
          description: 'Pipeline network topology restored to healthy operational baseline. All EIGRP neighbors UP.'
        }
      };
    }
  }

  return { devices, relationships };
}
