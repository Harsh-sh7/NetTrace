# Pipeline Network Topology Intelligence System (PNTIS)
### Secure Automatic Network Topology Discovery & Real-Time Monitoring for SCADA Networks

[![Problem Statement](https://img.shields.io/badge/Domain-SCADA%20%26%20OT%20Cybersecurity-cyan.svg)](#)
[![Constraint](https://img.shields.io/badge/Constraint-No%20CDP%20%2F%20No%20LLDP-emerald.svg)](#)
[![Routing Protocol](https://img.shields.io/badge/Routing-EIGRP%20AS%20100-blue.svg)](#)
[![Stack](https://img.shields.io/badge/Desktop-Electron%20%2B%20React%20%2B%20React%20Flow-purple.svg)](#)

---

## 1. Executive Summary & Problem Context

The **Pipeline Network Topology Intelligence System (PNTIS)** is an Electron-based mission-critical desktop operations application designed for geographically distributed industrial pipeline networks (inspired by the **Smart India Hackathon problem statement by GAIL (India) Limited, Ministry of Petroleum and Natural Gas**).

### The Critical Constraint: Zero CDP / Zero LLDP
In critical pipeline SCADA infrastructure, conventional discovery protocols like Cisco Discovery Protocol (**CDP**) and Link Layer Discovery Protocol (**LLDP**) are strictly forbidden because they transmit unauthenticated, cleartext hardware, firmware, and capability metadata across network segments.

### How PNTIS Discovers Topology Without CDP/LLDP
PNTIS reconstructs the complete network graph using authorized management-plane and telemetry-plane data:
1. **Authenticated SNMPv3 Queries (`authPriv`):** Encrypted system and interface status (`sysDescr`, `ifTable`, `ifXTable`, `ipAddrTable`).
2. **Switch MAC Forwarding Tables (`dot1qTpFdbTable`):** Pinpoints physical device attachments to individual switch access ports.
3. **ARP Tables (`ipNetToMediaTable`):** Maps IP addresses to physical Layer-2 MAC addresses.
4. **EIGRP Routing Adjacency Telemetry (`cEigrpNbrTable`):** Establishes logical Layer-3 routing adjacencies, holdtimes, metrics, and smooth round-trip times.
5. **Syslog Events & SNMP Traps:** Real-time link state changes, interface flaps, and neighbor drop notifications.

---

## 2. Key Architectural Tenets

### Physical vs. Logical Separation
- **Physical Connectivity:** Direct Layer-1/2 link (cable or switch-port forwarding) inferred exclusively from single-host MAC table entries and port operational status.
- **Logical Connectivity:** Layer-3 routing adjacencies (EIGRP AS 100).
- **Core Rule:** Two devices sharing a subnet are **NEVER** assumed to share a direct physical cable!

### Multi-Source Confidence Model
| Classification | Telemetry Evidence | Visual Edge Style |
|---|---|---|
| **OBSERVED** (95–100%) | Direct single-host switch port MAC entry or explicit EIGRP peer record | Solid Emerald Line (`#10b981`) |
| **INFERRED** (75–94%) | Subnet routing route match + ARP table binding | Solid/Dashed Cyan Line (`#06b6d4`) |
| **UNCERTAIN** (40–74%) | Conflicting ARP entries, flapping MACs, or ambiguous trunk ports | Dashed Amber Line (`#f59e0b`) |
| **CHANGED** | Topology drift compared to frozen baseline | Pulsing Magenta Line (`#a855f7`) |
| **DOWN / STALE** | Unreachable / holding time expired | Crimson Pulsing Line (`#ef4444`) |

---

## 3. Dedicated Operational Screens (Section 13)

1. **Overview Dashboard:** Executive KPI telemetry counters, data freshness windows, pipeline corridor facility health indicators (Hazira, Vijaipur, Auraiya, Jhabua, Dadri), and active incident feeds.
2. **Interactive Topology Map:** Real-time canvas built with `@xyflow/react` v12, custom SCADA hardware nodes (Routers, Switches, PLCs, RTUs, Servers), physical vs. logical edge filters, mini-map, and click-to-inspect evidence drawer.
3. **Device Inventory:** Sortable and filterable hardware catalog with management IPs, MAC addresses, station facilities, monitoring status, and identity confidence meters.
4. **Device Details Inspection:** Deep hardware analysis modal with SNMPv3 interface status tables, EIGRP neighbor tables, ARP cache, and switch forwarding database entries.
5. **Security & Anomaly Center:** Prioritized anomaly feed for rogue devices, unauthorized switch port attachments, and EIGRP neighbor drops with acknowledge/resolve workflows.
6. **Discovery Configuration:** Management of authorized CIDR discovery scopes, SNMPv3 `authPriv` cryptographic profiles (SHA-256/AES-256), polling cadences, and baseline freezes.
7. **History & Snapshot Diff Engine:** Time-machine comparison of historical snapshots against live discovered states, highlighting added (green), removed (red), and modified (amber) elements.
8. **Audit Reports & Exports:** Generates official compliance audits in JSON and CSV formats certifying zero reliance on CDP/LLDP.

---

## 4. Interactive Simulation Test Harness (Scenarios A through F)

Use the top **TEST HARNESS** bar to trigger live demonstration events:
- **Scenario A (New Authorized Router):** Commissions `RTR-VS07-EIGRP` with valid baseline authorization.
- **Scenario B (Rogue Device Attack):** Injects `ROGUE-SNIFFER-01` into Valve Station switch `SW-VS04-FIELD`, instantly triggering a CRITICAL security alarm.
- **Scenario C (EIGRP Routing Failover):** Simulates fiber cut on the Hazira-Vijaipur trunk; EIGRP neighbor drops and dynamically reconverges over the Jhabua microwave backup link.
- **Scenario D (Transient Device Outage):** Cathodic protection sensor `CP-MONITOR-04` misses poll cycles; transitions gracefully to STALE rather than being deleted.
- **Scenario E (Conflicting Telemetry Evidence):** Injects duplicate IP/conflicting MAC observations; downgrades link confidence to UNCERTAIN.
- **Scenario F (Full Recovery):** Restores all links, removes rogue hardware, and synchronizes baseline compliance.

---

## 5. Getting Started & Running the Application

### Prerequisites
- Node.js v20+ or v22+
- npm v10+

### Installation
```bash
npm install
```

### Run in Web Mode (Immediate Fast Development)
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in any modern browser.

### Run in Native Electron Desktop Window
```bash
npm run electron:dev
```
Launches the native desktop application with isolated IPC bridge and dark industrial window styling.

### Production Build
```bash
npm run build:electron
```
Compiles TypeScript, Vite bundles, and builds the Electron main & preload scripts into `dist/` and `dist-electron/`.

---

## 6. Architecture Directory Structure
```
├── electron/
│   ├── main.ts            # Electron main process (secure sandbox, IPC save dialogs)
│   └── preload.ts         # Isolated context bridge (window.scadaBridge)
├── src/
│   ├── components/
│   │   ├── layout/        # Header, Sidebar, SCADA indicators
│   │   ├── screens/       # The 8 dedicated operational screens
│   │   ├── simulation/    # ScenarioBar demonstration controller
│   │   └── topology/      # React Flow custom nodes, edges, and evidence drawer
│   ├── context/
│   │   └── TopologyContext.tsx # Global reactive state & discovery polling
│   ├── data/
│   │   └── initialData.ts # GAIL SCADA Pipeline Corridor baseline dataset
│   ├── engine/
│   │   ├── inferenceEngine.ts  # Multi-source correlation (No CDP/LLDP)
│   │   ├── changeDetection.ts  # Baseline diffing & security alert generator
│   │   └── simulationEngine.ts # Scenarios A-F logic
│   ├── types/
│   │   └── index.ts       # Rigorous data models matching Project.md Section 15
│   ├── App.tsx            # Main application shell
│   └── main.tsx           # React DOM root
├── Project.md             # Original problem specification
└── package.json
```
