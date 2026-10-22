// Type definitions for Pipeline Network Topology Intelligence System (PNTIS)
// Defined according to GAIL SCADA / SIH Project Specification (Section 15 & 11)

export type DeviceType = 
  | 'ROUTER' 
  | 'SWITCH' 
  | 'RTU' 
  | 'PLC' 
  | 'FIREWALL' 
  | 'SCADA_SERVER' 
  | 'UNKNOWN';

export type MonitoringStatus = 
  | 'REACHABLE' 
  | 'STALE' 
  | 'UNREACHABLE' 
  | 'DEGRADED';

export type ConfidenceClass = 
  | 'OBSERVED' 
  | 'INFERRED' 
  | 'UNCERTAIN' 
  | 'CHANGED' 
  | 'STALE';

export type RelationshipType = 
  | 'PHYSICAL_CABLE' 
  | 'EIGRP_ADJACENCY' 
  | 'SUBNET_REACHABLE' 
  | 'SWITCH_PORT_FORWARD'
  | 'TUNNEL';

export type TelemetrySource = 
  | 'SNMPV3' 
  | 'ARP' 
  | 'MAC_TABLE' 
  | 'EIGRP' 
  | 'NETFLOW'
  | 'SYSLOG' 
  | 'TRAP' 
  | 'IMPORT';

export type AlertSeverity = 
  | 'INFO' 
  | 'LOW' 
  | 'MEDIUM' 
  | 'HIGH' 
  | 'CRITICAL';

export type AlertType = 
  | 'ROGUE_DEVICE' 
  | 'UNEXPECTED_IP' 
  | 'UNEXPECTED_INTERFACE' 
  | 'UNAUTHORIZED_TOPOLOGY_CHANGE' 
  | 'EIGRP_NEIGHBOR_DOWN' 
  | 'STALE_CRITICAL_ASSET' 
  | 'EVIDENCE_CONFLICT'
  | 'LINK_FLAPPING';

export interface NetworkInterface {
  interface_id: string;
  device_id: string;
  interface_name: string;
  ip_addresses: string[];
  mac_address: string;
  interface_status: 'UP' | 'DOWN' | 'TESTING';
  speed_mbps?: number;
  vlan?: number;
  last_observed: string;
}

export interface EigrpNeighbor {
  neighbor_ip: string;
  local_interface: string;
  hold_time_seconds: number;
  uptime_seconds: number;
  smooth_rtt_ms: number;
  as_number: number;
  state: 'UP' | 'DOWN';
}

export interface ArpEntry {
  ip_address: string;
  mac_address: string;
  interface_name: string;
  type: 'DYNAMIC' | 'STATIC';
}

export interface MacTableEntry {
  vlan: number;
  mac_address: string;
  port: string;
  type: 'DYNAMIC' | 'STATIC';
}

export interface NetFlowRecord {
  flow_id: string;
  source_ip: string;
  destination_ip: string;
  next_hop: string;
  protocol: 'TCP' | 'UDP' | 'ICMP' | 'EIGRP' | 'MODBUS_TCP';
  source_port: number;
  destination_port: number;
  bytes: number;
  packets: number;
  input_interface: string;
  output_interface: string;
  first_switched: string;
  last_switched: string;
}

export interface Device {
  device_id: string;
  hostname: string;
  management_addresses: string[];
  device_type: DeviceType;
  vendor: string;
  model: string;
  site_id: string;
  site_name: string;
  location_coordinates?: [number, number]; // Lat, Long along pipeline
  identity_confidence: number; // 0-100%
  monitoring_status: MonitoringStatus;
  first_seen: string;
  last_seen: string;
  interfaces: NetworkInterface[];
  eigrp_neighbors?: EigrpNeighbor[];
  arp_cache?: ArpEntry[];
  mac_forwarding_table?: MacTableEntry[];
  netflow_records?: NetFlowRecord[];
  is_rogue: boolean;
  approved_in_baseline: boolean;
  notes?: string;
}

export interface EvidenceItem {
  evidence_id: string;
  source: TelemetrySource;
  timestamp: string;
  description: string;
  raw_payload?: Record<string, any>;
  confidence_contribution: number;
}

export interface Relationship {
  relationship_id: string;
  source_device_id: string;
  destination_device_id: string;
  source_interface_id?: string;
  source_interface_name?: string;
  destination_interface_id?: string;
  destination_interface_name?: string;
  relationship_type: RelationshipType;
  confidence_class: ConfidenceClass;
  confidence_score: number; // 0-100%
  evidence_references: EvidenceItem[];
  first_seen: string;
  last_seen: string;
  status: 'ACTIVE' | 'DEGRADED' | 'DOWN';
  eigrp_as?: number;
  metric?: number;
  notes?: string;
}

export interface TopologyEvent {
  event_id: string;
  event_type: string;
  affected_resources: string[];
  previous_state: string;
  new_state: string;
  detected_at: string;
  evidence_references: string[];
  severity: AlertSeverity;
  description: string;
}

export interface SecurityAlert {
  alert_id: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  affected_device_ids: string[];
  affected_device_names: string[];
  description: string;
  evidence: string;
  created_at: string;
  acknowledged_at?: string;
  acknowledged_by?: string;
  investigation_status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'FALSE_POSITIVE';
  recommended_actions: string[];
}

export interface DiscoveryScope {
  id: string;
  name: string;
  subnet_cidr: string;
  site_id: string;
  enabled: boolean;
}

export interface Snmpv3Profile {
  id: string;
  name: string;
  security_level: 'noAuthNoPriv' | 'authNoPriv' | 'authPriv';
  auth_protocol: 'SHA' | 'MD5' | 'SHA-256';
  priv_protocol: 'AES-128' | 'AES-256' | 'DES';
  username: string;
}

export interface DiscoveryConfig {
  authorized_scopes: DiscoveryScope[];
  snmp_profiles: Snmpv3Profile[];
  polling_interval_seconds: number;
  stale_threshold_seconds: number;
  unreachable_threshold_seconds: number;
  auto_correlate_arp_mac: boolean;
  eigrp_discovery_enabled: boolean;
  netflow_enabled: boolean;
  netflow_collector_port: number;
  syslog_listener_port: number;
  maintenance_window_active: boolean;
  baseline_frozen: boolean;
  baseline_last_updated: string;
}

export interface TopologySnapshot {
  snapshot_id: string;
  timestamp: string;
  label: string;
  device_count: number;
  relationship_count: number;
  devices: Device[];
  relationships: Relationship[];
  alerts_count: number;
}

export type ActiveScreen = 
  | 'overview' 
  | 'topology' 
  | 'inventory' 
  | 'alerts' 
  | 'configuration' 
  | 'history' 
  | 'reports';

