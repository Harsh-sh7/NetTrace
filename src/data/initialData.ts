import { Device, Relationship, SecurityAlert, TopologyEvent, DiscoveryConfig, TopologySnapshot } from '../types';

export const INITIAL_CONFIG: DiscoveryConfig = {
  authorized_scopes: [
    { id: 'scope-1', name: 'CCF Hazira Core Subnet', subnet_cidr: '10.240.10.0/24', site_id: 'SITE-CCF', enabled: true },
    { id: 'scope-2', name: 'CS-01 Vijaipur OT Ring', subnet_cidr: '10.240.20.0/24', site_id: 'SITE-CS01', enabled: true },
    { id: 'scope-3', name: 'VS-04 Auraiya Remote Section', subnet_cidr: '10.240.40.0/24', site_id: 'SITE-VS04', enabled: true },
    { id: 'scope-4', name: 'PS-02 Jhabua Pumping Hub', subnet_cidr: '10.240.50.0/24', site_id: 'SITE-PS02', enabled: true },
    { id: 'scope-5', name: 'TS-01 Dadri Custody Metering', subnet_cidr: '10.240.70.0/24', site_id: 'SITE-TS01', enabled: true },
  ],
  snmp_profiles: [
    { id: 'snmp-v3-gail-ot', name: 'GAIL_SCADA_SECURE_AUTHPRIV', security_level: 'authPriv', auth_protocol: 'SHA-256', priv_protocol: 'AES-256', username: 'scada_audit_mgr' },
  ],
  polling_interval_seconds: 30,
  stale_threshold_seconds: 90,
  unreachable_threshold_seconds: 180,
  auto_correlate_arp_mac: true,
  eigrp_discovery_enabled: true,
  netflow_enabled: true,
  netflow_collector_port: 2055,
  syslog_listener_port: 514,
  maintenance_window_active: false,
  baseline_frozen: true,
  baseline_last_updated: '2026-10-20 06:00:00 UTC',
};

export const INITIAL_DEVICES: Device[] = [
  // 1. Central Control Facility (CCF Hazira)
  {
    device_id: 'DEV-RTR-CCF-01',
    hostname: 'RTR-CCF-CORE01.gail.ot',
    management_addresses: ['10.240.10.1'],
    device_type: 'ROUTER',
    vendor: 'Cisco Systems',
    model: 'ASR-920-12CZ-A',
    site_id: 'SITE-CCF',
    site_name: 'Central Control Hazira',
    location_coordinates: [21.1702, 72.8311],
    identity_confidence: 98,
    monitoring_status: 'REACHABLE',
    first_seen: '2026-10-18 08:00:00',
    last_seen: '2026-10-20 13:20:00',
    is_rogue: false,
    approved_in_baseline: true,
    notes: 'Primary SCADA National Grid Dispatch Router. EIGRP AS 100 Route Reflector.',
    interfaces: [
      { interface_id: 'INT-CCF-01', device_id: 'DEV-RTR-CCF-01', interface_name: 'TenGigabitEthernet0/0/0', ip_addresses: ['10.240.10.1/24'], mac_address: '00:1A:E8:22:90:01', interface_status: 'UP', speed_mbps: 10000, vlan: 10, last_observed: '2026-10-20 13:20:00' },
      { interface_id: 'INT-CCF-02', device_id: 'DEV-RTR-CCF-01', interface_name: 'GigabitEthernet0/0/1', ip_addresses: ['10.240.100.1/30'], mac_address: '00:1A:E8:22:90:02', interface_status: 'UP', speed_mbps: 1000, last_observed: '2026-10-20 13:20:00' },
      { interface_id: 'INT-CCF-03', device_id: 'DEV-RTR-CCF-01', interface_name: 'GigabitEthernet0/0/2', ip_addresses: ['10.240.100.5/30'], mac_address: '00:1A:E8:22:90:03', interface_status: 'UP', speed_mbps: 1000, last_observed: '2026-10-20 13:20:00' },
      { interface_id: 'INT-CCF-04', device_id: 'DEV-RTR-CCF-01', interface_name: 'GigabitEthernet0/0/3', ip_addresses: ['10.240.100.9/30'], mac_address: '00:1A:E8:22:90:04', interface_status: 'UP', speed_mbps: 1000, last_observed: '2026-10-20 13:20:00' },
    ],
    eigrp_neighbors: [
      { neighbor_ip: '10.240.100.2', local_interface: 'GigabitEthernet0/0/1', hold_time_seconds: 14, uptime_seconds: 184520, smooth_rtt_ms: 12, as_number: 100, state: 'UP' },
      { neighbor_ip: '10.240.100.6', local_interface: 'GigabitEthernet0/0/2', hold_time_seconds: 13, uptime_seconds: 184520, smooth_rtt_ms: 18, as_number: 100, state: 'UP' },
      { neighbor_ip: '10.240.100.10', local_interface: 'GigabitEthernet0/0/3', hold_time_seconds: 15, uptime_seconds: 184520, smooth_rtt_ms: 22, as_number: 100, state: 'UP' },
    ],
    arp_cache: [
      { ip_address: '10.240.10.2', mac_address: '00:27:0D:33:41:01', interface_name: 'TenGigabitEthernet0/0/0', type: 'DYNAMIC' },
      { ip_address: '10.240.10.50', mac_address: '70:69:79:AB:01:22', interface_name: 'TenGigabitEthernet0/0/0', type: 'DYNAMIC' },
    ],
    netflow_records: [
      { flow_id: 'FLOW-CCF-01', source_ip: '10.240.10.50', destination_ip: '10.240.20.40', next_hop: '10.240.100.2', protocol: 'MODBUS_TCP', source_port: 49152, destination_port: 502, bytes: 482920, packets: 3410, input_interface: 'TenGigabitEthernet0/0/0', output_interface: 'GigabitEthernet0/0/1', first_switched: '2026-10-20 13:10:00', last_switched: '2026-10-20 13:20:00' },
      { flow_id: 'FLOW-CCF-02', source_ip: '10.240.100.1', destination_ip: '224.0.0.10', next_hop: '0.0.0.0', protocol: 'EIGRP', source_port: 0, destination_port: 0, bytes: 94800, packets: 1200, input_interface: 'Loopback0', output_interface: 'GigabitEthernet0/0/1', first_switched: '2026-10-20 08:00:00', last_switched: '2026-10-20 13:20:00' },
      { flow_id: 'FLOW-CCF-03', source_ip: '10.240.10.50', destination_ip: '10.240.40.30', next_hop: '10.240.100.6', protocol: 'MODBUS_TCP', source_port: 49153, destination_port: 502, bytes: 312000, packets: 2190, input_interface: 'TenGigabitEthernet0/0/0', output_interface: 'GigabitEthernet0/0/2', first_switched: '2026-10-20 13:12:00', last_switched: '2026-10-20 13:20:00' },
    ]
  },
  {
    device_id: 'DEV-SW-CCF-01',
    hostname: 'SW-CCF-DIST01.gail.ot',
    management_addresses: ['10.240.10.2'],
    device_type: 'SWITCH',
    vendor: 'Cisco Systems',
    model: 'Catalyst IE-3400 Heavy Duty',
    site_id: 'SITE-CCF',
    site_name: 'Central Control Hazira',
    location_coordinates: [21.1702, 72.8311],
    identity_confidence: 97,
    monitoring_status: 'REACHABLE',
    first_seen: '2026-10-18 08:00:00',
    last_seen: '2026-10-20 13:20:00',
    is_rogue: false,
    approved_in_baseline: true,
    notes: 'Hazira SCADA Distribution Switch ring master.',
    interfaces: [
      { interface_id: 'INT-SWCCF-01', device_id: 'DEV-SW-CCF-01', interface_name: 'TenGigabitEthernet1/1', ip_addresses: [], mac_address: '00:27:0D:33:41:01', interface_status: 'UP', speed_mbps: 10000, vlan: 10, last_observed: '2026-10-20 13:20:00' },
      { interface_id: 'INT-SWCCF-02', device_id: 'DEV-SW-CCF-01', interface_name: 'GigabitEthernet1/2', ip_addresses: [], mac_address: '00:27:0D:33:41:02', interface_status: 'UP', speed_mbps: 1000, vlan: 10, last_observed: '2026-10-20 13:20:00' },
    ],
    mac_forwarding_table: [
      { vlan: 10, mac_address: '00:1A:E8:22:90:01', port: 'TenGigabitEthernet1/1', type: 'DYNAMIC' },
      { vlan: 10, mac_address: '70:69:79:AB:01:22', port: 'GigabitEthernet1/2', type: 'DYNAMIC' },
    ]
  },
  {
    device_id: 'DEV-SRV-SCADA-01',
    hostname: 'SCADA-MASTER-01.gail.ot',
    management_addresses: ['10.240.10.50'],
    device_type: 'SCADA_SERVER',
    vendor: 'Dell EMC / Yokogawa',
    model: 'PowerEdge R750 Industrial',
    site_id: 'SITE-CCF',
    site_name: 'Central Control Hazira',
    location_coordinates: [21.1702, 72.8311],
    identity_confidence: 99,
    monitoring_status: 'REACHABLE',
    first_seen: '2026-10-18 08:00:00',
    last_seen: '2026-10-20 13:20:00',
    is_rogue: false,
    approved_in_baseline: true,
    notes: 'Redundant Central Supervisory Server (FAST/TOOLS pipeline telemetry engine)',
    interfaces: [
      { interface_id: 'INT-SRV-01', device_id: 'DEV-SRV-SCADA-01', interface_name: 'ens192', ip_addresses: ['10.240.10.50/24'], mac_address: '70:69:79:AB:01:22', interface_status: 'UP', speed_mbps: 1000, last_observed: '2026-10-20 13:20:00' }
    ]
  },

  // 2. Compressor Station 01 (CS-01 Vijaipur)
  {
    device_id: 'DEV-RTR-CS01-01',
    hostname: 'RTR-CS01-01.gail.ot',
    management_addresses: ['10.240.20.1'],
    device_type: 'ROUTER',
    vendor: 'Cisco Systems',
    model: 'ISR-4331/K9',
    site_id: 'SITE-CS01',
    site_name: 'CS-01 Vijaipur',
    location_coordinates: [24.4284, 77.3094],
    identity_confidence: 96,
    monitoring_status: 'REACHABLE',
    first_seen: '2026-10-18 08:00:00',
    last_seen: '2026-10-20 13:20:00',
    is_rogue: false,
    approved_in_baseline: true,
    notes: 'Gas compressor station border router. Upstream EIGRP AS 100 link to Hazira CCF.',
    interfaces: [
      { interface_id: 'INT-CS01-01', device_id: 'DEV-RTR-CS01-01', interface_name: 'GigabitEthernet0/0/0', ip_addresses: ['10.240.100.2/30'], mac_address: '00:24:14:44:88:01', interface_status: 'UP', speed_mbps: 1000, last_observed: '2026-10-20 13:20:00' },
      { interface_id: 'INT-CS01-02', device_id: 'DEV-RTR-CS01-01', interface_name: 'GigabitEthernet0/0/1', ip_addresses: ['10.240.20.1/24'], mac_address: '00:24:14:44:88:02', interface_status: 'UP', speed_mbps: 1000, vlan: 20, last_observed: '2026-10-20 13:20:00' },
      { interface_id: 'INT-CS01-03', device_id: 'DEV-RTR-CS01-01', interface_name: 'GigabitEthernet0/0/2', ip_addresses: ['10.240.101.1/30'], mac_address: '00:24:14:44:88:03', interface_status: 'UP', speed_mbps: 1000, last_observed: '2026-10-20 13:20:00' }
    ],
    eigrp_neighbors: [
      { neighbor_ip: '10.240.100.1', local_interface: 'GigabitEthernet0/0/0', hold_time_seconds: 14, uptime_seconds: 184520, smooth_rtt_ms: 12, as_number: 100, state: 'UP' },
      { neighbor_ip: '10.240.101.2', local_interface: 'GigabitEthernet0/0/2', hold_time_seconds: 11, uptime_seconds: 184520, smooth_rtt_ms: 8, as_number: 100, state: 'UP' }
    ],
    arp_cache: [
      { ip_address: '10.240.20.2', mac_address: '00:3A:9C:55:12:01', interface_name: 'GigabitEthernet0/0/1', type: 'DYNAMIC' },
      { ip_address: '10.240.20.30', mac_address: '00:1D:9C:B1:33:AA', interface_name: 'GigabitEthernet0/0/1', type: 'DYNAMIC' },
      { ip_address: '10.240.20.40', mac_address: '00:80:F4:AA:22:91', interface_name: 'GigabitEthernet0/0/1', type: 'DYNAMIC' }
    ],
    netflow_records: [
      { flow_id: 'FLOW-CS01-01', source_ip: '10.240.20.40', destination_ip: '10.240.10.50', next_hop: '10.240.100.1', protocol: 'MODBUS_TCP', source_port: 502, destination_port: 49152, bytes: 491000, packets: 3450, input_interface: 'GigabitEthernet0/0/1', output_interface: 'GigabitEthernet0/0/0', first_switched: '2026-10-20 13:10:00', last_switched: '2026-10-20 13:20:00' },
      { flow_id: 'FLOW-CS01-02', source_ip: '10.240.20.30', destination_ip: '10.240.10.50', next_hop: '10.240.100.1', protocol: 'TCP', source_port: 44818, destination_port: 49155, bytes: 128500, packets: 980, input_interface: 'GigabitEthernet0/0/1', output_interface: 'GigabitEthernet0/0/0', first_switched: '2026-10-20 13:14:00', last_switched: '2026-10-20 13:20:00' },
      { flow_id: 'FLOW-CS01-03', source_ip: '10.240.100.2', destination_ip: '224.0.0.10', next_hop: '0.0.0.0', protocol: 'EIGRP', source_port: 0, destination_port: 0, bytes: 91400, packets: 1190, input_interface: 'Loopback0', output_interface: 'GigabitEthernet0/0/0', first_switched: '2026-10-20 08:00:00', last_switched: '2026-10-20 13:20:00' },
    ]
  },
  {
    device_id: 'DEV-SW-CS01-01',
    hostname: 'SW-CS01-OT.gail.ot',
    management_addresses: ['10.240.20.2'],
    device_type: 'SWITCH',
    vendor: 'Cisco Systems',
    model: 'IE-3300-8T2S-E Rugged',
    site_id: 'SITE-CS01',
    site_name: 'CS-01 Vijaipur',
    location_coordinates: [24.4284, 77.3094],
    identity_confidence: 95,
    monitoring_status: 'REACHABLE',
    first_seen: '2026-10-18 08:00:00',
    last_seen: '2026-10-20 13:20:00',
    is_rogue: false,
    approved_in_baseline: true,
    notes: 'Compressor Turbine OT ring switch. DIN rail mounted.',
    interfaces: [
      { interface_id: 'INT-SWCS-01', device_id: 'DEV-SW-CS01-01', interface_name: 'FastEthernet1/1', ip_addresses: [], mac_address: '00:3A:9C:55:12:01', interface_status: 'UP', speed_mbps: 100, vlan: 20, last_observed: '2026-10-20 13:20:00' },
      { interface_id: 'INT-SWCS-02', device_id: 'DEV-SW-CS01-01', interface_name: 'FastEthernet1/2', ip_addresses: [], mac_address: '00:3A:9C:55:12:02', interface_status: 'UP', speed_mbps: 100, vlan: 20, last_observed: '2026-10-20 13:20:00' },
      { interface_id: 'INT-SWCS-03', device_id: 'DEV-SW-CS01-01', interface_name: 'FastEthernet1/3', ip_addresses: [], mac_address: '00:3A:9C:55:12:03', interface_status: 'UP', speed_mbps: 100, vlan: 20, last_observed: '2026-10-20 13:20:00' }
    ],
    mac_forwarding_table: [
      { vlan: 20, mac_address: '00:24:14:44:88:02', port: 'FastEthernet1/1', type: 'DYNAMIC' },
      { vlan: 20, mac_address: '00:1D:9C:B1:33:AA', port: 'FastEthernet1/2', type: 'DYNAMIC' },
      { vlan: 20, mac_address: '00:80:F4:AA:22:91', port: 'FastEthernet1/3', type: 'DYNAMIC' }
    ]
  },
  {
    device_id: 'DEV-PLC-COMP-01',
    hostname: 'PLC-COMPRESSOR-A.gail.ot',
    management_addresses: ['10.240.20.30'],
    device_type: 'PLC',
    vendor: 'Rockwell Automation',
    model: 'Allen-Bradley ControlLogix 5580',
    site_id: 'SITE-CS01',
    site_name: 'CS-01 Vijaipur',
    location_coordinates: [24.4284, 77.3094],
    identity_confidence: 94,
    monitoring_status: 'REACHABLE',
    first_seen: '2026-10-18 08:00:00',
    last_seen: '2026-10-20 13:20:00',
    is_rogue: false,
    approved_in_baseline: true,
    notes: 'Critical Turbine Suction & Discharge Pressure PID Controller.',
    interfaces: [
      { interface_id: 'INT-PLC-01', device_id: 'DEV-PLC-COMP-01', interface_name: 'EN2TR-A', ip_addresses: ['10.240.20.30/24'], mac_address: '00:1D:9C:B1:33:AA', interface_status: 'UP', speed_mbps: 100, last_observed: '2026-10-20 13:20:00' }
    ]
  },
  {
    device_id: 'DEV-RTU-CS01-01',
    hostname: 'RTU-CS01-TELEMETRY.gail.ot',
    management_addresses: ['10.240.20.40'],
    device_type: 'RTU',
    vendor: 'Schneider Electric',
    model: 'SCADAPack 575',
    site_id: 'SITE-CS01',
    site_name: 'CS-01 Vijaipur',
    location_coordinates: [24.4284, 77.3094],
    identity_confidence: 93,
    monitoring_status: 'REACHABLE',
    first_seen: '2026-10-18 08:00:00',
    last_seen: '2026-10-20 13:20:00',
    is_rogue: false,
    approved_in_baseline: true,
    notes: 'Gas chromatograph & calorific gas composition telemetry.',
    interfaces: [
      { interface_id: 'INT-RTU-01', device_id: 'DEV-RTU-CS01-01', interface_name: 'Eth0', ip_addresses: ['10.240.20.40/24'], mac_address: '00:80:F4:AA:22:91', interface_status: 'UP', speed_mbps: 100, last_observed: '2026-10-20 13:20:00' }
    ]
  },

  // 3. Valve Station 04 (VS-04 Auraiya Section)
  {
    device_id: 'DEV-RTR-VS04-01',
    hostname: 'RTR-VS04-01.gail.ot',
    management_addresses: ['10.240.40.1'],
    device_type: 'ROUTER',
    vendor: 'Cisco Systems',
    model: 'Cisco 891F Industrial Integrated',
    site_id: 'SITE-VS04',
    site_name: 'VS-04 Auraiya',
    location_coordinates: [26.4674, 79.5168],
    identity_confidence: 96,
    monitoring_status: 'REACHABLE',
    first_seen: '2026-10-18 08:00:00',
    last_seen: '2026-10-20 13:20:00',
    is_rogue: false,
    approved_in_baseline: true,
    notes: 'Sectionalizing block valve telemetry router. EIGRP neighbor with CS-01.',
    interfaces: [
      { interface_id: 'INT-VS04-01', device_id: 'DEV-RTR-VS04-01', interface_name: 'GigabitEthernet0', ip_addresses: ['10.240.101.2/30'], mac_address: '00:26:CB:11:55:01', interface_status: 'UP', speed_mbps: 1000, last_observed: '2026-10-20 13:20:00' },
      { interface_id: 'INT-VS04-02', device_id: 'DEV-RTR-VS04-01', interface_name: 'FastEthernet1', ip_addresses: ['10.240.40.1/24'], mac_address: '00:26:CB:11:55:02', interface_status: 'UP', speed_mbps: 100, vlan: 40, last_observed: '2026-10-20 13:20:00' }
    ],
    eigrp_neighbors: [
      { neighbor_ip: '10.240.101.1', local_interface: 'GigabitEthernet0', hold_time_seconds: 14, uptime_seconds: 184520, smooth_rtt_ms: 8, as_number: 100, state: 'UP' }
    ],
    arp_cache: [
      { ip_address: '10.240.40.2', mac_address: '00:1E:F7:77:11:01', interface_name: 'FastEthernet1', type: 'DYNAMIC' },
      { ip_address: '10.240.40.10', mac_address: '00:60:35:E1:99:40', interface_name: 'FastEthernet1', type: 'DYNAMIC' },
      { ip_address: '10.240.40.25', mac_address: '00:40:9D:62:30:11', interface_name: 'FastEthernet1', type: 'DYNAMIC' }
    ]
  },
  {
    device_id: 'DEV-SW-VS04-01',
    hostname: 'SW-VS04-FIELD.gail.ot',
    management_addresses: ['10.240.40.2'],
    device_type: 'SWITCH',
    vendor: 'Cisco Systems',
    model: 'IE-2000-4TS-G-L Industrial',
    site_id: 'SITE-VS04',
    site_name: 'VS-04 Auraiya',
    location_coordinates: [26.4674, 79.5168],
    identity_confidence: 92,
    monitoring_status: 'REACHABLE',
    first_seen: '2026-10-18 08:00:00',
    last_seen: '2026-10-20 13:20:00',
    is_rogue: false,
    approved_in_baseline: true,
    notes: 'Remote valve solar-powered enclosure switch.',
    interfaces: [
      { interface_id: 'INT-SWVS-01', device_id: 'DEV-SW-VS04-01', interface_name: 'FastEthernet1/1', ip_addresses: [], mac_address: '00:1E:F7:77:11:01', interface_status: 'UP', speed_mbps: 100, vlan: 40, last_observed: '2026-10-20 13:20:00' },
      { interface_id: 'INT-SWVS-02', device_id: 'DEV-SW-VS04-01', interface_name: 'FastEthernet1/2', ip_addresses: [], mac_address: '00:1E:F7:77:11:02', interface_status: 'UP', speed_mbps: 100, vlan: 40, last_observed: '2026-10-20 13:20:00' },
      { interface_id: 'INT-SWVS-03', device_id: 'DEV-SW-VS04-01', interface_name: 'FastEthernet1/3', ip_addresses: [], mac_address: '00:1E:F7:77:11:03', interface_status: 'UP', speed_mbps: 100, vlan: 40, last_observed: '2026-10-20 13:20:00' },
    ],
    mac_forwarding_table: [
      { vlan: 40, mac_address: '00:26:CB:11:55:02', port: 'FastEthernet1/1', type: 'DYNAMIC' },
      { vlan: 40, mac_address: '00:60:35:E1:99:40', port: 'FastEthernet1/2', type: 'DYNAMIC' },
      { vlan: 40, mac_address: '00:40:9D:62:30:11', port: 'FastEthernet1/3', type: 'DYNAMIC' }
    ]
  },
  {
    device_id: 'DEV-RTU-VS04-01',
    hostname: 'RTU-VALVE-VS04.gail.ot',
    management_addresses: ['10.240.40.10'],
    device_type: 'RTU',
    vendor: 'Schneider Electric',
    model: 'SCADAPack 334E',
    site_id: 'SITE-VS04',
    site_name: 'VS-04 Auraiya',
    location_coordinates: [26.4674, 79.5168],
    identity_confidence: 96,
    monitoring_status: 'REACHABLE',
    first_seen: '2026-10-18 08:00:00',
    last_seen: '2026-10-20 13:20:00',
    is_rogue: false,
    approved_in_baseline: true,
    notes: 'Mainline Emergency Shutdown (ESD) Actuator Control RTU.',
    interfaces: [
      { interface_id: 'INT-RTUVS-01', device_id: 'DEV-RTU-VS04-01', interface_name: 'Eth1', ip_addresses: ['10.240.40.10/24'], mac_address: '00:60:35:E1:99:40', interface_status: 'UP', speed_mbps: 100, last_observed: '2026-10-20 13:20:00' }
    ]
  },
  {
    device_id: 'DEV-CP-MON-01',
    hostname: 'CP-MONITOR-04.gail.ot',
    management_addresses: ['10.240.40.25'],
    device_type: 'PLC',
    vendor: 'Elecsys / Borin',
    model: 'Cathodic Protection Testpoint Monitor',
    site_id: 'SITE-VS04',
    site_name: 'VS-04 Auraiya',
    location_coordinates: [26.4674, 79.5168],
    identity_confidence: 91,
    monitoring_status: 'REACHABLE',
    first_seen: '2026-10-18 08:00:00',
    last_seen: '2026-10-20 13:20:00',
    is_rogue: false,
    approved_in_baseline: true,
    notes: 'Pipeline corrosion potential & pipe-to-soil voltage sensor.',
    interfaces: [
      { interface_id: 'INT-CP-01', device_id: 'DEV-CP-MON-01', interface_name: 'lan0', ip_addresses: ['10.240.40.25/24'], mac_address: '00:40:9D:62:30:11', interface_status: 'UP', speed_mbps: 100, last_observed: '2026-10-20 13:20:00' }
    ]
  },

  // 4. Pumping Station 02 (PS-02 Jhabua)
  {
    device_id: 'DEV-RTR-PS02-01',
    hostname: 'RTR-PS02-01.gail.ot',
    management_addresses: ['10.240.50.1'],
    device_type: 'ROUTER',
    vendor: 'Cisco Systems',
    model: 'ISR-4331/K9',
    site_id: 'SITE-PS02',
    site_name: 'PS-02 Jhabua',
    location_coordinates: [22.7691, 74.5947],
    identity_confidence: 97,
    monitoring_status: 'REACHABLE',
    first_seen: '2026-10-18 08:00:00',
    last_seen: '2026-10-20 13:20:00',
    is_rogue: false,
    approved_in_baseline: true,
    notes: 'LPG pumping booster station edge router. EIGRP link to Hazira CCF.',
    interfaces: [
      { interface_id: 'INT-PS02-01', device_id: 'DEV-RTR-PS02-01', interface_name: 'GigabitEthernet0/0/0', ip_addresses: ['10.240.100.6/30'], mac_address: '00:23:04:77:AA:01', interface_status: 'UP', speed_mbps: 1000, last_observed: '2026-10-20 13:20:00' },
      { interface_id: 'INT-PS02-02', device_id: 'DEV-RTR-PS02-01', interface_name: 'GigabitEthernet0/0/1', ip_addresses: ['10.240.50.1/24'], mac_address: '00:23:04:77:AA:02', interface_status: 'UP', speed_mbps: 1000, vlan: 50, last_observed: '2026-10-20 13:20:00' }
    ],
    eigrp_neighbors: [
      { neighbor_ip: '10.240.100.5', local_interface: 'GigabitEthernet0/0/0', hold_time_seconds: 13, uptime_seconds: 184520, smooth_rtt_ms: 18, as_number: 100, state: 'UP' }
    ],
    arp_cache: [
      { ip_address: '10.240.50.15', mac_address: '00:0E:8C:31:77:45', interface_name: 'GigabitEthernet0/0/1', type: 'DYNAMIC' }
    ]
  },
  {
    device_id: 'DEV-PLC-PUMP-01',
    hostname: 'PLC-PUMP-MAIN.gail.ot',
    management_addresses: ['10.240.50.15'],
    device_type: 'PLC',
    vendor: 'Siemens Industrial',
    model: 'Simatic S7-1500 Fail-Safe',
    site_id: 'SITE-PS02',
    site_name: 'PS-02 Jhabua',
    location_coordinates: [22.7691, 74.5947],
    identity_confidence: 94,
    monitoring_status: 'REACHABLE',
    first_seen: '2026-10-18 08:00:00',
    last_seen: '2026-10-20 13:20:00',
    is_rogue: false,
    approved_in_baseline: true,
    notes: 'Main LPG booster pump manifold safety controller.',
    interfaces: [
      { interface_id: 'INT-PLCP-01', device_id: 'DEV-PLC-PUMP-01', interface_name: 'PROFINET-1', ip_addresses: ['10.240.50.15/24'], mac_address: '00:0E:8C:31:77:45', interface_status: 'UP', speed_mbps: 1000, last_observed: '2026-10-20 13:20:00' }
    ]
  },

  // 5. Terminal Station 01 (TS-01 Dadri Custody Metering)
  {
    device_id: 'DEV-RTR-TS01-01',
    hostname: 'RTR-TS01-01.gail.ot',
    management_addresses: ['10.240.70.1'],
    device_type: 'ROUTER',
    vendor: 'Cisco Systems',
    model: 'ASR-920-4SZ-A',
    site_id: 'SITE-TS01',
    site_name: 'TS-01 Dadri Terminal',
    location_coordinates: [28.5492, 77.5540],
    identity_confidence: 97,
    monitoring_status: 'REACHABLE',
    first_seen: '2026-10-18 08:00:00',
    last_seen: '2026-10-20 13:20:00',
    is_rogue: false,
    approved_in_baseline: true,
    notes: 'Custody transfer terminal distribution router. EIGRP AS 100 link to Hazira CCF.',
    interfaces: [
      { interface_id: 'INT-TS01-01', device_id: 'DEV-RTR-TS01-01', interface_name: 'GigabitEthernet0/0/0', ip_addresses: ['10.240.100.10/30'], mac_address: '00:1B:D4:55:71:01', interface_status: 'UP', speed_mbps: 1000, last_observed: '2026-10-20 13:20:00' },
      { interface_id: 'INT-TS01-02', device_id: 'DEV-RTR-TS01-01', interface_name: 'GigabitEthernet0/0/1', ip_addresses: ['10.240.70.1/24'], mac_address: '00:1B:D4:55:71:02', interface_status: 'UP', speed_mbps: 1000, vlan: 70, last_observed: '2026-10-20 13:20:00' }
    ],
    eigrp_neighbors: [
      { neighbor_ip: '10.240.100.9', local_interface: 'GigabitEthernet0/0/0', hold_time_seconds: 15, uptime_seconds: 184520, smooth_rtt_ms: 22, as_number: 100, state: 'UP' }
    ],
    arp_cache: [
      { ip_address: '10.240.70.5', mac_address: '00:04:A3:89:12:88', interface_name: 'GigabitEthernet0/0/1', type: 'DYNAMIC' }
    ]
  },
  {
    device_id: 'DEV-RTU-METER-01',
    hostname: 'RTU-METERING-TS01.gail.ot',
    management_addresses: ['10.240.70.5'],
    device_type: 'RTU',
    vendor: 'Emerson Process',
    model: 'FloBoss S600+ Custody Transfer',
    site_id: 'SITE-TS01',
    site_name: 'TS-01 Dadri Terminal',
    location_coordinates: [28.5492, 77.5540],
    identity_confidence: 98,
    monitoring_status: 'REACHABLE',
    first_seen: '2026-10-18 08:00:00',
    last_seen: '2026-10-20 13:20:00',
    is_rogue: false,
    approved_in_baseline: true,
    notes: 'Legal custody transfer ultrasonic gas volume & energy flow computer.',
    interfaces: [
      { interface_id: 'INT-METER-01', device_id: 'DEV-RTU-METER-01', interface_name: 'NET1', ip_addresses: ['10.240.70.5/24'], mac_address: '00:04:A3:89:12:88', interface_status: 'UP', speed_mbps: 100, last_observed: '2026-10-20 13:20:00' }
    ]
  }
];

export const INITIAL_RELATIONSHIPS: Relationship[] = [
  // Physical link: RTR-CCF-CORE01 <-> SW-CCF-DIST01
  {
    relationship_id: 'REL-PHYS-01',
    source_device_id: 'DEV-RTR-CCF-01',
    destination_device_id: 'DEV-SW-CCF-01',
    source_interface_id: 'INT-CCF-01',
    source_interface_name: 'TenGigabitEthernet0/0/0',
    destination_interface_id: 'INT-SWCCF-01',
    destination_interface_name: 'TenGigabitEthernet1/1',
    relationship_type: 'PHYSICAL_CABLE',
    confidence_class: 'OBSERVED',
    confidence_score: 98,
    evidence_references: [
      {
        evidence_id: 'EV-01',
        source: 'MAC_TABLE',
        timestamp: '2026-10-20 13:20:00',
        description: 'SW-CCF-DIST01 port TenGigabitEthernet1/1 observed MAC 00:1A:E8:22:90:01 (RTR-CCF-CORE01) with zero other active MACs (direct point-to-point trunk).',
        confidence_contribution: 60,
      },
      {
        evidence_id: 'EV-02',
        source: 'SNMPV3',
        timestamp: '2026-10-20 13:20:00',
        description: 'SNMPv3 ifOperStatus=UP, ifSpeed=10000000000 on both endpoints with matching MTU 1500.',
        confidence_contribution: 38,
      }
    ],
    first_seen: '2026-10-18 08:00:00',
    last_seen: '2026-10-20 13:20:00',
    status: 'ACTIVE',
    notes: '10G Fiber Uplink inside Central Hazira Server Hall Rack 4'
  },
  // Physical link: SW-CCF-DIST01 <-> SCADA-MASTER-01
  {
    relationship_id: 'REL-PHYS-02',
    source_device_id: 'DEV-SW-CCF-01',
    destination_device_id: 'DEV-SRV-SCADA-01',
    source_interface_id: 'INT-SWCCF-02',
    source_interface_name: 'GigabitEthernet1/2',
    destination_interface_id: 'INT-SRV-01',
    destination_interface_name: 'ens192',
    relationship_type: 'SWITCH_PORT_FORWARD',
    confidence_class: 'OBSERVED',
    confidence_score: 97,
    evidence_references: [
      {
        evidence_id: 'EV-03',
        source: 'MAC_TABLE',
        timestamp: '2026-10-20 13:20:00',
        description: 'SW-CCF-DIST01 port GigabitEthernet1/2 forwarding table has single MAC 70:69:79:AB:01:22.',
        confidence_contribution: 55,
      },
      {
        evidence_id: 'EV-04',
        source: 'ARP',
        timestamp: '2026-10-20 13:20:00',
        description: 'ARP table resolves 10.240.10.50 to MAC 70:69:79:AB:01:22 on VLAN 10.',
        confidence_contribution: 42,
      }
    ],
    first_seen: '2026-10-18 08:00:00',
    last_seen: '2026-10-20 13:20:00',
    status: 'ACTIVE',
    notes: 'Cat6 patch from switch to SCADA primary host NIC'
  },

  // Logical EIGRP link: RTR-CCF-CORE01 <-> RTR-CS01-01
  {
    relationship_id: 'REL-LOGIC-EIGRP-01',
    source_device_id: 'DEV-RTR-CCF-01',
    destination_device_id: 'DEV-RTR-CS01-01',
    source_interface_id: 'INT-CCF-02',
    source_interface_name: 'GigabitEthernet0/0/1',
    destination_interface_id: 'INT-CS01-01',
    destination_interface_name: 'GigabitEthernet0/0/0',
    relationship_type: 'EIGRP_ADJACENCY',
    confidence_class: 'OBSERVED',
    confidence_score: 96,
    eigrp_as: 100,
    metric: 28160,
    evidence_references: [
      {
        evidence_id: 'EV-05',
        source: 'EIGRP',
        timestamp: '2026-10-20 13:20:00',
        description: 'EIGRP AS 100 neighbor table: Peer 10.240.100.2 on Gi0/0/1, Holdtime 14s, SRTT 12ms. Uptime 51 hrs.',
        confidence_contribution: 70,
      },
      {
        evidence_id: 'EV-06',
        source: 'SNMPV3',
        timestamp: '2026-10-20 13:20:00',
        description: 'Point-to-point /30 subnet 10.240.100.0/30 verified on both interfaces via ipAddrTable.',
        confidence_contribution: 26,
      }
    ],
    first_seen: '2026-10-18 08:00:00',
    last_seen: '2026-10-20 13:20:00',
    status: 'ACTIVE',
    notes: 'SDH / OPGW Optical Pipeline Backbone Link Hazira - Vijaipur'
  },

  // Logical EIGRP link: RTR-CCF-CORE01 <-> RTR-PS02-01
  {
    relationship_id: 'REL-LOGIC-EIGRP-02',
    source_device_id: 'DEV-RTR-CCF-01',
    destination_device_id: 'DEV-RTR-PS02-01',
    source_interface_id: 'INT-CCF-03',
    source_interface_name: 'GigabitEthernet0/0/2',
    destination_interface_id: 'INT-PS02-01',
    destination_interface_name: 'GigabitEthernet0/0/0',
    relationship_type: 'EIGRP_ADJACENCY',
    confidence_class: 'OBSERVED',
    confidence_score: 95,
    eigrp_as: 100,
    metric: 31200,
    evidence_references: [
      {
        evidence_id: 'EV-07',
        source: 'EIGRP',
        timestamp: '2026-10-20 13:20:00',
        description: 'EIGRP AS 100 neighbor table: Peer 10.240.100.6 on Gi0/0/2, Holdtime 13s, SRTT 18ms.',
        confidence_contribution: 70,
      },
      {
        evidence_id: 'EV-08',
        source: 'SNMPV3',
        timestamp: '2026-10-20 13:20:00',
        description: 'Point-to-point /30 subnet 10.240.100.4/30 active.',
        confidence_contribution: 25,
      }
    ],
    first_seen: '2026-10-18 08:00:00',
    last_seen: '2026-10-20 13:20:00',
    status: 'ACTIVE',
    notes: 'Microwave / VSAT Backup Transmission path to Jhabua'
  },

  // Logical EIGRP link: RTR-CCF-CORE01 <-> RTR-TS01-01
  {
    relationship_id: 'REL-LOGIC-EIGRP-03',
    source_device_id: 'DEV-RTR-CCF-01',
    destination_device_id: 'DEV-RTR-TS01-01',
    source_interface_id: 'INT-CCF-04',
    source_interface_name: 'GigabitEthernet0/0/3',
    destination_interface_id: 'INT-TS01-01',
    destination_interface_name: 'GigabitEthernet0/0/0',
    relationship_type: 'EIGRP_ADJACENCY',
    confidence_class: 'OBSERVED',
    confidence_score: 94,
    eigrp_as: 100,
    metric: 35840,
    evidence_references: [
      {
        evidence_id: 'EV-09',
        source: 'EIGRP',
        timestamp: '2026-10-20 13:20:00',
        description: 'EIGRP AS 100 neighbor table: Peer 10.240.100.10 on Gi0/0/3, Holdtime 15s, SRTT 22ms.',
        confidence_contribution: 70,
      }
    ],
    first_seen: '2026-10-18 08:00:00',
    last_seen: '2026-10-20 13:20:00',
    status: 'ACTIVE',
    notes: 'OPGW Long-Haul Fiber to Dadri Terminal'
  },

  // Logical EIGRP link: RTR-CS01-01 <-> RTR-VS04-01
  {
    relationship_id: 'REL-LOGIC-EIGRP-04',
    source_device_id: 'DEV-RTR-CS01-01',
    destination_device_id: 'DEV-RTR-VS04-01',
    source_interface_id: 'INT-CS01-03',
    source_interface_name: 'GigabitEthernet0/0/2',
    destination_interface_id: 'INT-VS04-01',
    destination_interface_name: 'GigabitEthernet0',
    relationship_type: 'EIGRP_ADJACENCY',
    confidence_class: 'OBSERVED',
    confidence_score: 93,
    eigrp_as: 100,
    metric: 42100,
    evidence_references: [
      {
        evidence_id: 'EV-10',
        source: 'EIGRP',
        timestamp: '2026-10-20 13:20:00',
        description: 'EIGRP AS 100 neighbor table: Peer 10.240.101.2 on Gi0/0/2, Holdtime 14s, SRTT 8ms.',
        confidence_contribution: 75,
      }
    ],
    first_seen: '2026-10-18 08:00:00',
    last_seen: '2026-10-20 13:20:00',
    status: 'ACTIVE',
    notes: 'Inter-station pipeline telemetry link Vijaipur - Auraiya'
  },

  // Physical link: RTR-CS01-01 <-> SW-CS01-OT
  {
    relationship_id: 'REL-PHYS-03',
    source_device_id: 'DEV-RTR-CS01-01',
    destination_device_id: 'DEV-SW-CS01-01',
    source_interface_id: 'INT-CS01-02',
    source_interface_name: 'GigabitEthernet0/0/1',
    destination_interface_id: 'INT-SWCS-01',
    destination_interface_name: 'FastEthernet1/1',
    relationship_type: 'PHYSICAL_CABLE',
    confidence_class: 'OBSERVED',
    confidence_score: 95,
    evidence_references: [
      {
        evidence_id: 'EV-11',
        source: 'MAC_TABLE',
        timestamp: '2026-10-20 13:20:00',
        description: 'SW-CS01-OT port FastEthernet1/1 observed MAC 00:24:14:44:88:02 (RTR-CS01-01).',
        confidence_contribution: 50,
      },
      {
        evidence_id: 'EV-12',
        source: 'ARP',
        timestamp: '2026-10-20 13:20:00',
        description: 'RTR-CS01-01 ARP table maps 10.240.20.2 to 00:3A:9C:55:12:01.',
        confidence_contribution: 45,
      }
    ],
    first_seen: '2026-10-18 08:00:00',
    last_seen: '2026-10-20 13:20:00',
    status: 'ACTIVE',
    notes: 'Trunk cable from station router to field industrial switch'
  },

  // Physical link: SW-CS01-OT <-> PLC-COMPRESSOR-A
  {
    relationship_id: 'REL-PHYS-04',
    source_device_id: 'DEV-SW-CS01-01',
    destination_device_id: 'DEV-PLC-COMP-01',
    source_interface_id: 'INT-SWCS-02',
    source_interface_name: 'FastEthernet1/2',
    destination_interface_id: 'INT-PLC-01',
    destination_interface_name: 'EN2TR-A',
    relationship_type: 'SWITCH_PORT_FORWARD',
    confidence_class: 'OBSERVED',
    confidence_score: 94,
    evidence_references: [
      {
        evidence_id: 'EV-13',
        source: 'MAC_TABLE',
        timestamp: '2026-10-20 13:20:00',
        description: 'SW-CS01-OT port FastEthernet1/2 forward table contains single MAC 00:1D:9C:B1:33:AA (Rockwell OUI).',
        confidence_contribution: 60,
      },
      {
        evidence_id: 'EV-14',
        source: 'ARP',
        timestamp: '2026-10-20 13:20:00',
        description: '10.240.20.30 ARP correlated to Rockwell ControlLogix.',
        confidence_contribution: 34,
      }
    ],
    first_seen: '2026-10-18 08:00:00',
    last_seen: '2026-10-20 13:20:00',
    status: 'ACTIVE',
    notes: 'Direct industrial armored Cat6 to Turbine PLC Rack'
  },

  // Physical link: SW-CS01-OT <-> RTU-CS01-TELEMETRY
  {
    relationship_id: 'REL-PHYS-05',
    source_device_id: 'DEV-SW-CS01-01',
    destination_device_id: 'DEV-RTU-CS01-01',
    source_interface_id: 'INT-SWCS-03',
    source_interface_name: 'FastEthernet1/3',
    destination_interface_id: 'INT-RTU-01',
    destination_interface_name: 'Eth0',
    relationship_type: 'SWITCH_PORT_FORWARD',
    confidence_class: 'OBSERVED',
    confidence_score: 93,
    evidence_references: [
      {
        evidence_id: 'EV-15',
        source: 'MAC_TABLE',
        timestamp: '2026-10-20 13:20:00',
        description: 'SW-CS01-OT port FastEthernet1/3 forward table contains MAC 00:80:F4:AA:22:91.',
        confidence_contribution: 55,
      }
    ],
    first_seen: '2026-10-18 08:00:00',
    last_seen: '2026-10-20 13:20:00',
    status: 'ACTIVE',
    notes: 'Station gas chromatograph telemetry interface'
  },

  // Physical link: RTR-VS04-01 <-> SW-VS04-FIELD
  {
    relationship_id: 'REL-PHYS-06',
    source_device_id: 'DEV-RTR-VS04-01',
    destination_device_id: 'DEV-SW-VS04-01',
    source_interface_id: 'INT-VS04-02',
    source_interface_name: 'FastEthernet1',
    destination_interface_id: 'INT-SWVS-01',
    destination_interface_name: 'FastEthernet1/1',
    relationship_type: 'PHYSICAL_CABLE',
    confidence_class: 'OBSERVED',
    confidence_score: 92,
    evidence_references: [
      {
        evidence_id: 'EV-16',
        source: 'MAC_TABLE',
        timestamp: '2026-10-20 13:20:00',
        description: 'SW-VS04-FIELD port FastEthernet1/1 observed MAC 00:26:CB:11:55:02 (RTR-VS04-01).',
        confidence_contribution: 60,
      }
    ],
    first_seen: '2026-10-18 08:00:00',
    last_seen: '2026-10-20 13:20:00',
    status: 'ACTIVE'
  },

  // Physical link: SW-VS04-FIELD <-> RTU-VALVE-VS04
  {
    relationship_id: 'REL-PHYS-07',
    source_device_id: 'DEV-SW-VS04-01',
    destination_device_id: 'DEV-RTU-VS04-01',
    source_interface_id: 'INT-SWVS-02',
    source_interface_name: 'FastEthernet1/2',
    destination_interface_id: 'INT-RTUVS-01',
    destination_interface_name: 'Eth1',
    relationship_type: 'SWITCH_PORT_FORWARD',
    confidence_class: 'OBSERVED',
    confidence_score: 96,
    evidence_references: [
      {
        evidence_id: 'EV-17',
        source: 'MAC_TABLE',
        timestamp: '2026-10-20 13:20:00',
        description: 'SW-VS04-FIELD port FastEthernet1/2 observed single MAC 00:60:35:E1:99:40 (Schneider Electric).',
        confidence_contribution: 60,
      },
      {
        evidence_id: 'EV-18',
        source: 'ARP',
        timestamp: '2026-10-20 13:20:00',
        description: 'ARP table correlates 10.240.40.10 to 00:60:35:E1:99:40 on VLAN 40.',
        confidence_contribution: 36,
      }
    ],
    first_seen: '2026-10-18 08:00:00',
    last_seen: '2026-10-20 13:20:00',
    status: 'ACTIVE',
    notes: 'Mainline Emergency Block Valve (BV-04) Actuator Connection'
  },

  // Physical link: SW-VS04-FIELD <-> CP-MONITOR-04
  {
    relationship_id: 'REL-PHYS-08',
    source_device_id: 'DEV-SW-VS04-01',
    destination_device_id: 'DEV-CP-MON-01',
    source_interface_id: 'INT-SWVS-03',
    source_interface_name: 'FastEthernet1/3',
    destination_interface_id: 'INT-CP-01',
    destination_interface_name: 'lan0',
    relationship_type: 'SWITCH_PORT_FORWARD',
    confidence_class: 'OBSERVED',
    confidence_score: 91,
    evidence_references: [
      {
        evidence_id: 'EV-19',
        source: 'MAC_TABLE',
        timestamp: '2026-10-20 13:20:00',
        description: 'SW-VS04-FIELD port FastEthernet1/3 observed single MAC 00:40:9D:62:30:11.',
        confidence_contribution: 55,
      }
    ],
    first_seen: '2026-10-18 08:00:00',
    last_seen: '2026-10-20 13:20:00',
    status: 'ACTIVE'
  },

  // Inferred link: RTR-PS02-01 <-> PLC-PUMP-MAIN
  {
    relationship_id: 'REL-INFERRED-01',
    source_device_id: 'DEV-RTR-PS02-01',
    destination_device_id: 'DEV-PLC-PUMP-01',
    source_interface_id: 'INT-PS02-02',
    source_interface_name: 'GigabitEthernet0/0/1',
    destination_interface_id: 'INT-PLCP-01',
    destination_interface_name: 'PROFINET-1',
    relationship_type: 'SUBNET_REACHABLE',
    confidence_class: 'INFERRED',
    confidence_score: 82,
    evidence_references: [
      {
        evidence_id: 'EV-20',
        source: 'ARP',
        timestamp: '2026-10-20 13:20:00',
        description: 'RTR-PS02-01 ARP cache maps 10.240.50.15 to Siemens MAC 00:0E:8C:31:77:45. Intermediate unmanaged L2 hub suspected; no managed switch MAC table available.',
        confidence_contribution: 45,
      },
      {
        evidence_id: 'EV-21',
        source: 'SNMPV3',
        timestamp: '2026-10-20 13:20:00',
        description: 'IP route table 10.240.50.0/24 directly connected to Gi0/0/1.',
        confidence_contribution: 37,
      }
    ],
    first_seen: '2026-10-18 08:00:00',
    last_seen: '2026-10-20 13:20:00',
    status: 'ACTIVE',
    notes: 'Inferred Layer 2/3 link. Managed switch telemetry missing at PS-02.'
  },

  // Inferred link: RTR-TS01-01 <-> RTU-METERING-TS01
  {
    relationship_id: 'REL-INFERRED-02',
    source_device_id: 'DEV-RTR-TS01-01',
    destination_device_id: 'DEV-RTU-METER-01',
    source_interface_id: 'INT-TS01-02',
    source_interface_name: 'GigabitEthernet0/0/1',
    destination_interface_id: 'INT-METER-01',
    destination_interface_name: 'NET1',
    relationship_type: 'SUBNET_REACHABLE',
    confidence_class: 'INFERRED',
    confidence_score: 84,
    evidence_references: [
      {
        evidence_id: 'EV-22',
        source: 'ARP',
        timestamp: '2026-10-20 13:20:00',
        description: 'RTR-TS01-01 ARP cache maps 10.240.70.5 to FloBoss MAC 00:04:A3:89:12:88 on Gi0/0/1.',
        confidence_contribution: 50,
      },
      {
        evidence_id: 'EV-23',
        source: 'SNMPV3',
        timestamp: '2026-10-20 13:20:00',
        description: 'Directly attached route 10.240.70.0/24.',
        confidence_contribution: 34,
      }
    ],
    first_seen: '2026-10-18 08:00:00',
    last_seen: '2026-10-20 13:20:00',
    status: 'ACTIVE',
    notes: 'Inferred connection without LLDP/CDP. Verified via ARP matching.'
  }
];

export const INITIAL_ALERTS: SecurityAlert[] = [
  {
    alert_id: 'ALERT-001',
    alert_type: 'EVIDENCE_CONFLICT',
    severity: 'MEDIUM',
    affected_device_ids: ['DEV-RTR-PS02-01', 'DEV-PLC-PUMP-01'],
    affected_device_names: ['RTR-PS02-01.gail.ot', 'PLC-PUMP-MAIN.gail.ot'],
    description: 'Physical switch port evidence absent between PS-02 router and pump controller.',
    evidence: 'Intermediate switch MAC table is inaccessible or unmanaged. Link downgraded to INFERRED with 82% confidence.',
    created_at: '2026-10-20 10:15:00',
    investigation_status: 'OPEN',
    recommended_actions: [
      'Verify if PS-02 uses an unmanaged industrial rail switch.',
      'Deploy SNMPv3 read-only credential to PS-02 field switch to promote connection to OBSERVED.'
    ]
  }
];

export const INITIAL_EVENTS: TopologyEvent[] = [
  {
    event_id: 'EVT-101',
    event_type: 'BASELINE_FREEZE',
    affected_resources: ['GLOBAL_TOPOLOGY'],
    previous_state: 'DRAFT_DISCOVERY',
    new_state: 'APPROVED_BASELINE',
    detected_at: '2026-10-20 06:00:00',
    evidence_references: ['AUDIT-SNAPSHOT-001'],
    severity: 'INFO',
    description: 'Chief OT Systems Engineer approved official network baseline (11 devices, 11 links).'
  },
  {
    event_id: 'EVT-102',
    event_type: 'EIGRP_NEIGHBOR_UP',
    affected_resources: ['DEV-RTR-CCF-01', 'DEV-RTR-CS01-01'],
    previous_state: 'INIT',
    new_state: 'ADJACENCY_UP',
    detected_at: '2026-10-20 11:32:00',
    evidence_references: ['SYSLOG-CCF-9021'],
    severity: 'INFO',
    description: '%DUAL-5-NBRCHANGE: EIGRP-IPv4 100: Neighbor 10.240.100.2 (Gi0/0/1) is up: new adjacency'
  }
];

export const INITIAL_SNAPSHOTS: TopologySnapshot[] = [
  {
    snapshot_id: 'SNAP-20261020-0600',
    timestamp: '2026-10-20 06:00:00',
    label: 'Official SCADA Baseline (Frozen)',
    device_count: INITIAL_DEVICES.length,
    relationship_count: INITIAL_RELATIONSHIPS.length,
    devices: JSON.parse(JSON.stringify(INITIAL_DEVICES)),
    relationships: JSON.parse(JSON.stringify(INITIAL_RELATIONSHIPS)),
    alerts_count: 0
  }
];
