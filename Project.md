# Pipeline Network Topology Intelligence System
### Secure Automatic Network Topology Discovery and Real-Time Monitoring for SCADA Networks

**Problem statement source:** Smart India Hackathon problem statement by GAIL (India) Limited, Ministry of Petroleum and Natural Gas  
**Domain:** Cybersecurity, Industrial Networking, SCADA, Operational Technology (OT)  
**Application type:** Electron-based desktop application with a modular network discovery backend  
**Proposed technology category:** Software  
**Protocol constraint:** No reliance on Cisco Discovery Protocol (CDP) or Link Layer Discovery Protocol (LLDP)

---

## 1. Executive Summary

The Pipeline Network Topology Intelligence System is a desktop-based application designed to discover, visualize, monitor, and analyze the topology of geographically distributed industrial networks used in pipeline infrastructure.

Pipeline networks can span thousands of kilometres and contain routers, switches, communication links, control stations, and other network devices distributed across remote locations. Maintaining an accurate understanding of the connections between these devices is essential for network maintenance, fault diagnosis, security monitoring, and operational continuity.

Conventional network topology discovery often relies on Cisco Discovery Protocol (CDP) or Link Layer Discovery Protocol (LLDP). However, these protocols have limitations in critical environments because they lack built-in authentication and may expose device and network information. The proposed system therefore avoids depending on either protocol and instead uses authorized management-plane data, including SNMPv3 polling and traps, ARP tables, MAC address tables, routing information, NetFlow records where available, and syslog events.

The application will process this information to identify devices, correlate observations, infer network relationships, and maintain a versioned representation of the network topology. It will highlight newly discovered devices, missing devices, changed connections, uncertain relationships, and suspicious topology changes.

The proposed solution combines an interactive Electron desktop interface with a backend discovery engine, a topology correlation and inference module, a persistent data store, and a security monitoring subsystem.

The initial prototype will use realistic synthetic network data and a controlled lab environment. Real-device integration will be added through supported management interfaces when compatible equipment and authorized access are available.

The objective is to create a scalable, security-conscious, and explainable topology discovery platform that helps network administrators understand their network without depending on CDP or LLDP.

## 2. Background and Problem Context

Supervisory Control and Data Acquisition (SCADA) systems support the monitoring and control of industrial infrastructure, including pipeline operations. Their supporting communication networks may connect central control facilities, regional stations, remote terminal locations, routers, switches, and other operational assets.

Because these networks are geographically distributed, maintaining an accurate network inventory and understanding the relationships between devices becomes increasingly difficult as the network grows.

Traditional manual network mapping has several limitations:

- Network diagrams become outdated as devices and connections change.
- Administrators may not immediately know when an unauthorized device appears.
- Fault isolation can take longer when the actual network structure is unclear.
- Changes to routing and connectivity may not be reflected in documentation.
- Inconsistent information across management systems makes troubleshooting difficult.
- A missing or incorrect connection map can complicate incident investigation and network segmentation.

CDP and LLDP are commonly used to discover neighboring devices. However, the GAIL problem statement specifically requires a solution that does not rely on these protocols because of their security limitations in critical pipeline environments.

The proposed system must therefore correlate alternative sources of network evidence to reconstruct the network topology, keep the resulting map updated, and protect sensitive information throughout the discovery process.

## 3. Problem Statement

Develop a secure and scalable software tool for automatic network topology discovery in a network using the Enhanced Interior Gateway Routing Protocol (EIGRP), without relying on Cisco Discovery Protocol (CDP) or Link Layer Discovery Protocol (LLDP).

The system may use secure SNMPv3 polling and traps, ARP and MAC address tables, NetFlow data, routing protocol information, and syslog records to discover devices and determine their physical and logical relationships.

The solution must:

1. Identify network devices accurately without relying on CDP or LLDP.
2. Determine physical and logical connections using available network evidence.
3. Maintain an up-to-date topology map as devices and connections change.
4. Scale from small networks to large, geographically distributed networks.
5. Detect unexpected devices and potentially suspicious topology changes.
6. Protect credentials, network metadata, and management traffic.
7. Operate using free and/or open-source resources, as required by the problem statement.

## 4. Proposed Solution

The proposed application will provide a centralized desktop workspace for authorized network administrators to discover and monitor network topology.

The application will have five principal subsystems:

1. **Discovery Engine:** Collects authorized network observations from supported sources.
2. **Topology Correlation Engine:** Combines observations to identify devices and infer connections.
3. **Topology State Manager:** Stores the current network graph and tracks changes over time.
4. **Security and Anomaly Engine:** Identifies unexpected devices, configuration changes, missing evidence, and potentially suspicious topology changes.
5. **Desktop Monitoring Interface:** Displays the network graph, device inventory, alerts, evidence, and historical changes.

Rather than treating every observed relationship as a confirmed physical connection, the system will distinguish between directly supported observations, inferred relationships, and uncertain connections. This distinction is important because the available data sources do not always provide enough information to prove the existence of a particular physical link.

The application will also preserve the evidence behind each inferred relationship so that an administrator can understand why two devices were connected in the generated topology.

## 5. Project Objectives

### Primary objectives

- Automatically discover devices through supported management interfaces.
- Construct a topology graph without depending on CDP or LLDP.
- Identify routers, switches, and other supported network assets.
- Reconstruct logical connectivity using routing and forwarding information.
- Infer physical connectivity when sufficient evidence is available.
- Detect and document changes in devices, links, and network relationships.
- Display the topology in an interactive desktop application.
- Provide a secure and auditable discovery workflow.
- Support large network inventories through incremental processing and efficient storage.

### Secondary objectives

- Reduce manual effort in network inventory maintenance.
- Improve troubleshooting through device and link impact analysis.
- Support historical topology comparisons.
- Provide evidence-based security alerts.
- Allow administrators to export network inventories and topology reports.
- Provide a simulation environment for demonstrating discovery and change detection without access to production SCADA infrastructure.

## 6. Intended Users

### Network administrators

Use the system to discover network assets, inspect device connectivity, review topology changes, and investigate network issues.

### OT and SCADA security teams

Use the system to investigate unexpected devices, suspicious connectivity changes, and deviations from an approved network baseline.

### Infrastructure maintenance teams

Use the topology map to understand the relationships between remote stations, communication links, and network devices during maintenance.

### Auditors and technical reviewers

Use the event history, discovery evidence, and exported reports to review topology changes and discovery activity.

The application is intended to support authorized monitoring and analysis. It is not intended to replace industrial control systems, safety controllers, or operational network protection mechanisms.

## 7. Functional Requirements

### FR-01: Network device discovery

The application shall discover and identify devices using supported, authorized data sources.

Potential inputs include:

- SNMPv3 system and interface information.
- Interface addresses and interface status.
- ARP tables and forwarding databases.
- MAC address tables.
- EIGRP routing and neighbor information where accessible through supported management interfaces.
- Syslog events and SNMP traps.
- NetFlow or equivalent flow records where available.
- Administrator-provided device inventories and network configuration exports.

The discovery engine will normalize these inputs into a common internal format.

Each device record should contain the fields available from the collected evidence, such as:

- Internal device identifier.
- Management IP address.
- Device hostname.
- Device type or probable role.
- Vendor and model, when available.
- Interface identifiers.
- Interface addresses and status.
- First-seen and last-seen timestamps.
- Discovery sources.
- Identity confidence.
- Current monitoring status.

Not every device will expose every field. The application must represent missing or uncertain information explicitly rather than inventing values.

### FR-02: Device identity correlation

The system shall correlate multiple observations to determine whether they refer to the same network device.

For example, observations containing the same management address, interface identifiers, serial number when available, or stable device identifiers may be combined into a single device record.

The system must account for:

- Management IP address changes.
- Duplicate or reused IP addresses.
- Multiple interfaces on the same device.
- Incomplete inventory records.
- Conflicting device attributes.
- Devices observed through different data sources.

IP addresses alone must not be treated as universally reliable device identities because addresses can change or be reassigned.

When identity cannot be determined confidently, the system shall flag the record for review instead of silently merging unrelated devices.

### FR-03: Automatic topology construction

The application shall construct a graph containing network devices and their relationships.

The graph will represent:

- Routers and switches.
- Network interfaces.
- Logical network relationships.
- Supported physical-link inferences.
- Routing adjacencies.
- Remote stations and regional locations.
- Unknown or unclassified devices.

Each relationship should store its source evidence, observation time, confidence, and current status.

The application should distinguish between:

**Physical connectivity:** A direct cable or underlying Layer 2 adjacency. This may require interface forwarding information, switch-port data, configuration information, or additional evidence.

**Logical connectivity:** A routing adjacency, reachable network, tunnel, or other logical relationship. This may be inferred from routing and forwarding information.

The system must not assume that two devices sharing a subnet are directly connected by a physical cable.

### FR-04: EIGRP-aware discovery

Because the target network uses EIGRP, the system shall incorporate available EIGRP-related information into its topology correlation process.

Where authorized management interfaces expose the relevant information, the system should ingest:

- EIGRP neighbor relationships.
- Advertised or installed routing information.
- Reachable destination networks.
- Next-hop information.
- Interface associations.
- Routing changes and adjacency events.

This information can help establish logical relationships between routers and understand the paths through which networks are reachable.

EIGRP-specific information must be collected through supported management or telemetry interfaces. The project will not rely on CDP or LLDP, and the discovery process will not require intrusive access to production routing processes.

An EIGRP neighbor relationship indicates a routing adjacency, not necessarily a complete description of the physical network. The topology engine must preserve that distinction.

### FR-05: Real-time and periodic topology updates

The system shall maintain an up-to-date topology using a combination of periodic polling and event-driven updates.

Updates may be triggered by:

- Scheduled SNMPv3 polls.
- SNMP traps.
- Syslog messages.
- New routing observations.
- Changes in ARP or MAC forwarding tables.
- Administrator-initiated refreshes.
- Imported inventory or configuration changes.

When a new observation arrives, the system shall compare it with the existing topology and determine whether a device, interface, or relationship has been added, removed, modified, or become uncertain.

The interface shall display the time of the latest successful observation and indicate stale data when devices cannot be reached.

A trap or syslog event may trigger a refresh, but the system must validate the resulting evidence before treating a change as confirmed.

### FR-06: Topology change detection

The application shall compare the current topology with a stored baseline or previous version.

It shall identify:

- Newly discovered devices.
- Devices that have not been observed within their expected monitoring window.
- New or removed interfaces.
- Link additions and removals.
- Changes in logical routing relationships.
- Changes in interface state.
- Conflicting observations.
- Unexpected changes in network structure.

The application should provide a change timeline with timestamps, affected assets, evidence sources, and a description of the detected difference.

A device that temporarily stops responding should initially be classified as potentially unavailable or stale rather than immediately treated as permanently removed.

### FR-07: Unauthorized-device and anomaly detection

The system shall compare discovered devices against an administrator-approved inventory or topology baseline.

Potential alerts include:

- A device that is not in the approved inventory.
- A newly observed management address.
- An unexpected interface or connection.
- A topology change outside an approved maintenance window.
- A device appearing in an unexpected network segment.
- Conflicting identity information.
- An unusual change in routing relationships.
- A prolonged loss of monitoring data from a critical asset.

Alerts will include severity, detection time, affected devices, supporting evidence, and recommended investigation steps.

The application must distinguish between an observed deviation and a confirmed security incident. A new device or changed connection may be legitimate maintenance activity.

### FR-08: Interactive topology visualization

The Electron desktop application shall provide an interactive network graph.

Required capabilities include:

- Zooming and panning.
- Selecting a device to inspect its details.
- Displaying interfaces and known relationships.
- Filtering devices by role, location, status, and alert severity.
- Searching for devices by hostname or address.
- Highlighting newly added or changed relationships.
- Displaying evidence confidence.
- Showing the latest observation time.
- Focusing on a particular site or network segment.
- Resetting the view and fitting the topology to the screen.

The interface should remain usable as the number of devices grows. For large networks, the application should support hierarchical views, regional grouping, and filtered subgraphs rather than attempting to display every device at maximum detail simultaneously.

### FR-09: Device and link inspection

Selecting a device shall open an inspection panel containing its available attributes, interfaces, relationships, monitoring status, and event history.

Selecting a relationship shall display:

- Source and destination devices.
- Relevant interfaces, when known.
- Relationship type.
- Evidence sources.
- First-seen and last-seen timestamps.
- Confidence level.
- Recent changes.
- Any unresolved contradictions.

The system shall allow administrators to distinguish directly observed facts from algorithmically inferred relationships.

### FR-10: Historical topology and audit trail

The application shall preserve topology versions and important discovery events.

Administrators should be able to:

- View a previous topology snapshot.
- Compare two topology versions.
- Inspect when a device or relationship changed.
- Review the source evidence for a change.
- Export historical reports.
- Review discovery and administrative activity.

The audit trail shall record security-relevant actions such as discovery configuration changes, credential-reference changes, manual device classifications, baseline approvals, and report exports.

Sensitive credentials must never be written to ordinary event logs.

### FR-11: Reporting and export

The application shall support export of appropriate network information in formats such as CSV and JSON.

Reports may include:

- Device inventory.
- Interface inventory.
- Logical topology.
- Physical-link inferences.
- Newly discovered devices.
- Unresolved identity conflicts.
- Topology changes over a selected period.
- Security and anomaly alerts.
- Data freshness and discovery coverage.

Exports should include timestamps and sufficient context to distinguish observed information from inferred information.

Sensitive management addresses and other restricted metadata should be handled according to administrator-defined access and export policies.

### FR-12: Network discovery configuration

Authorized administrators shall be able to configure discovery sources, monitoring intervals, and permitted device ranges.

Configuration options may include:

- Approved device inventory.
- Authorized address ranges.
- SNMPv3 credential references.
- Polling intervals.
- Monitoring timeouts.
- Stale-device thresholds.
- Event ingestion settings.
- Maintenance windows.
- Approved topology baseline.
- Alert thresholds.
- Data-retention settings.

The system should validate configuration changes and record them in the audit trail.

### FR-13: Simulation and demonstration mode

The application shall include a simulation mode for demonstrations, testing, and development without production network access.

The simulator shall generate realistic synthetic devices, interfaces, routing relationships, observations, and topology changes.

Supported demonstration events should include:

- A new router appearing.
- An unknown device being discovered.
- A switch interface going down.
- A logical routing relationship changing.
- A device becoming temporarily unreachable.
- Conflicting device observations.
- A connection disappearing and later returning.
- A maintenance event that legitimately adds a device.

Simulation data must be clearly labelled. The interface must not represent simulated observations as live production telemetry.

## 8. Non-Functional Requirements

### Security

- Use SNMPv3 with appropriate authentication and privacy protections where supported.
- Protect credentials using an operating-system credential store or another approved secrets-management mechanism.
- Encrypt sensitive data at rest where required by the deployment environment.
- Restrict discovery to explicitly authorized devices and ranges.
- Validate and sanitize imported data.
- Authenticate access to the discovery backend where it is separately exposed.
- Apply least-privilege access to operating-system resources and network management interfaces.
- Maintain an audit trail of security-relevant actions.
- Avoid unnecessary outbound connections and telemetry.
- Keep the Electron renderer isolated from privileged operating-system and network operations.

### Performance

- Process topology changes incrementally rather than rebuilding the entire graph after every event.
- Use asynchronous polling and bounded concurrency.
- Prevent one unresponsive device from blocking discovery of the remaining network.
- Support filtering and aggregation for large graphs.
- Use indexed database queries for devices, events, and relationships.
- Provide visible progress and partial results during long-running discovery operations.

Performance targets should be measured against an explicitly defined test dataset and lab environment rather than claimed without testing.

### Scalability

The architecture should support growth in:

- Number of network devices.
- Number of interfaces.
- Number of observed relationships.
- Number of telemetry events.
- Number of stored topology versions.
- Number of monitored sites.

For the initial prototype, a configurable synthetic network can be used to test graph construction and incremental updates. Larger deployment targets should be defined after the intended network size and polling requirements are known.

### Reliability

- Preserve the last successfully collected topology when a poll fails.
- Distinguish missing observations from confirmed device removal.
- Recover gracefully from backend restarts.
- Handle duplicate and out-of-order events.
- Prevent corrupted telemetry from silently overwriting valid records.
- Record discovery failures and retry where appropriate.
- Back up the persistent state according to the deployment requirements.

### Usability

- Provide a clean, professional desktop interface.
- Make device status, alert severity, and data freshness immediately visible.
- Use consistent terminology for physical and logical relationships.
- Provide clear error messages and actionable troubleshooting information.
- Support a keyboard-accessible interface and readable visual indicators.

### Maintainability

- Separate the user interface from the discovery engine.
- Use modular adapters for each telemetry source.
- Provide automated unit and integration tests.
- Document data schemas and topology inference rules.
- Keep configuration separate from source code.
- Use version control and reproducible development instructions.

## 9. System Architecture

The application will use a modular architecture consisting of the following layers.

### Layer 1: Electron desktop interface

**Technology:** Electron, React, TypeScript, React Flow.

Responsibilities:

- Render the topology graph.
- Display inventory and alert panels.
- Show discovery status and progress.
- Provide filters and search.
- Display device and relationship evidence.
- Present historical comparisons.
- Allow authorized configuration of discovery settings.

The renderer will not directly hold privileged credentials or execute unrestricted system commands.

### Layer 2: Application service and API boundary

This layer connects the desktop interface to the discovery backend.

Responsibilities:

- Validate user actions and configuration.
- Expose controlled operations such as starting discovery, reading the current topology, and retrieving alerts.
- Stream topology changes and status updates.
- Enforce authorization where multiple user roles are supported.
- Restrict the interface to permitted backend operations.

For an initial prototype, this communication may use a local process interface or a loopback-only API. Any local API must be protected against unauthorized local access, and it must not be exposed to the public internet.

### Layer 3: Discovery adapters

Each supported telemetry source should have a separate adapter.

**SNMPv3 adapter:** Collects supported device and interface attributes, table information, and monitoring status.

**ARP/MAC adapter:** Imports or retrieves neighbor and forwarding information where available.

**EIGRP/routing adapter:** Processes supported routing and adjacency information.

**Syslog adapter:** Normalizes relevant device events.

**SNMP trap adapter:** Processes incoming notifications where the deployment environment supports them.

**NetFlow adapter:** Ingests flow information when available and relevant to the discovery process.

**Import adapter:** Reads authorized CSV, JSON, or configuration exports for testing and integration.

All adapters shall produce normalized observations using a common schema. Unsupported sources should be reported clearly instead of silently being treated as operational.

### Layer 4: Normalization and identity resolution

This layer standardizes incoming observations and correlates them with existing device records.

Processing steps:

1. Validate the input schema.
2. Normalize addresses, interface identifiers, and timestamps.
3. Attach source and collection metadata.
4. Match observations to known devices.
5. Detect conflicting attributes.
6. Update device identity confidence.
7. Send unresolved cases to a review queue.

Identity resolution should use multiple attributes when available. The engine should retain provenance so that the origin of a device attribute can be traced.

### Layer 5: Topology correlation and inference engine

This is the core discovery component.

It combines normalized observations to determine which devices exist, how they relate, and how confident the system is in each relationship.

It should:

- Correlate routing adjacencies with router interfaces.
- Interpret MAC forwarding tables and ARP observations within their limitations.
- Associate observations with the appropriate device and interface.
- Infer likely logical and physical relationships where evidence supports them.
- Resolve duplicate observations.
- Detect conflicting evidence.
- Assign evidence-based confidence levels.
- Mark stale or unsupported relationships.
- Update only the affected parts of the graph when possible.

The engine must preserve the distinction between physical links and logical reachability. It must not claim that a physical connection has been proven solely because a route exists between two networks.

### Layer 6: Change detection and security analysis

This layer compares new observations against the stored topology and approved baseline.

It identifies changes such as new devices, missing interfaces, routing changes, unknown assets, and unexpected connections.

It then generates alerts containing the affected assets, timestamps, supporting evidence, and suggested investigation steps.

For the initial version, deterministic rules and baseline comparisons are preferable to opaque machine-learning predictions because the resulting alerts need to be explainable and testable.

### Layer 7: Persistence and historical state

**Recommended initial storage:** SQLite.

Suggested logical entities include:

- Devices.
- Interfaces.
- Observations.
- Relationships.
- Topology snapshots.
- Topology change events.
- Security alerts.
- Discovery jobs.
- Configuration metadata.
- Audit records.

The data model should preserve timestamps, source references, and confidence information. A later deployment with larger concurrency or multiple operators may migrate to PostgreSQL or another suitable database.

### Architecture flow

```text
Authorized Network Devices
          |
          v
SNMPv3 / ARP-MAC / EIGRP-Routing
Syslog / Traps / NetFlow / Imports
          |
          v
     Discovery Adapters
          |
          v
Normalization and Validation
          |
          v
Device Identity Resolution
          |
          v
Topology Correlation Engine
          |
          v
Change Detection and Security Analysis
          |
          v
Topology State + Event Store
          |
          v
Controlled Application API
          |
          v
Electron + React Desktop Interface
          |
          v
Network Graph / Inventory / Alerts / Reports
```

## 10. Topology Discovery Methodology

The system will use evidence correlation rather than a single discovery protocol.

### Step 1: Establish the authorized discovery scope

The administrator defines the permitted devices, networks, data sources, credentials, and polling schedule.

The system must not scan arbitrary address ranges or contact production devices outside the approved scope.

### Step 2: Collect device observations

Supported adapters retrieve authorized management information.

Examples include device identifiers, interface attributes, routing information, ARP entries, MAC forwarding records, and system events.

Collection must use bounded timeouts and concurrency to avoid overwhelming devices or links.

### Step 3: Normalize the observations

The system converts source-specific records into a consistent internal format.

Each observation records:

- The reporting device or source.
- The relevant interface or network.
- The observation timestamp.
- The collection method.
- The raw or normalized evidence reference.
- The validation status.

### Step 4: Identify devices

The identity engine correlates observations using available stable attributes and known inventory data.

Conflicting or insufficient information results in an uncertain identity rather than an automatic, potentially incorrect merge.

### Step 5: Build candidate relationships

The topology engine uses the collected evidence to construct candidate relationships.

Examples:

- EIGRP neighbor data may support a logical adjacency between routers.
- Routing tables may support an inferred next-hop relationship.
- MAC forwarding tables may help associate a downstream device with a switch port.
- ARP observations may associate IP addresses with link-layer addresses on a local network.
- Interface status and configuration data may help validate a candidate link.
- Syslog and trap events may explain why a previously observed relationship changed.

### Step 6: Evaluate relationship confidence

Every relationship is classified according to the quality and agreement of its supporting evidence.

The system should distinguish between:

- Directly observed information.
- Strongly supported inferences.
- Weak or incomplete inferences.
- Conflicting observations.
- Stale information.

A numeric confidence score may be introduced, but its formula must be documented and calibrated using test data. It should not be presented as a statistically validated probability unless that has been established.

### Step 7: Publish the topology

The current topology is updated in persistent storage and presented in the desktop interface.

Changes should be applied incrementally where practical so that a large network does not need to be reconstructed after every event.

### Step 8: Monitor for changes

Scheduled polls and event-driven triggers refresh the relevant information.

When new observations conflict with the current topology, the engine creates a change event and updates the affected relationships.

### Step 9: Validate removals

A single failed poll should not immediately remove a device from the topology.

The system should apply configurable freshness windows, repeated checks, and corroborating evidence before classifying a device or link as missing or removed.

### Step 10: Preserve history

The system records meaningful topology changes and their evidence, enabling administrators to investigate what changed, when it changed, and why the engine classified the change as it did.

## 11. Evidence and Confidence Model

An important innovation of the proposed solution is to expose the evidence supporting every relationship.

Each relationship will contain:

- Source device.
- Destination device.
- Source interface, if known.
- Destination interface, if known.
- Relationship category.
- Supporting observations.
- First-seen timestamp.
- Last-seen timestamp.
- Evidence freshness.
- Confidence classification.
- Contradictory observations.
- Current status.

Suggested classifications:

**Observed:** The relevant relationship is directly represented in a collected source record.

**Inferred:** Multiple observations support the relationship, but direct confirmation is unavailable.

**Uncertain:** Evidence is incomplete, stale, or contradictory.

**Changed:** The relationship differs from the previous accepted topology.

**Missing or stale:** The relationship has not been reconfirmed within the configured observation window.

These labels describe evidence quality and monitoring state. They must not be interpreted as proof of malicious activity.

## 12. Security Architecture

Because the target environment is critical industrial infrastructure, security must be a design requirement rather than a feature added at the end.

### Secure management communication

Use SNMPv3 with authentication and privacy protection where supported by the device. Credentials must be provisioned securely and restricted to the permissions necessary for discovery.

The system should prefer read-only access for topology collection.

### Credential protection

- Do not hardcode credentials in source code.
- Do not store passwords in ordinary application configuration files.
- Use an operating-system credential store or an approved secrets manager.
- Avoid exposing credentials to the renderer process.
- Redact secrets from logs, error messages, and exported reports.

### Discovery scope enforcement

- Require explicit authorization for discovery targets.
- Validate device addresses and configuration.
- Limit polling concurrency and request frequency.
- Provide a dry-run or simulation mode.
- Record discovery configuration changes.
- Avoid intrusive active probes against production devices.

### Electron application security

- Keep `nodeIntegration` disabled in the renderer.
- Enable context isolation.
- Use a narrowly scoped preload bridge.
- Validate messages received through IPC.
- Restrict navigation and untrusted content loading.
- Apply a suitable Content Security Policy.
- Prevent renderer content from accessing arbitrary filesystem or process operations.

### Backend security

If a separate backend service is used, bind it only to the intended interface, authenticate requests, and restrict permitted operations.

A loopback address alone should not be considered a complete security boundary. The backend must also protect against unauthorized local requests and validate all incoming data.

### Auditability

Record important administrative and discovery actions with timestamps, actor identity where available, event type, affected resource, and outcome.

Audit records should be protected against unauthorized modification. If tamper-evident logging is implemented, use a documented integrity mechanism and protect the signing or checkpointing keys appropriately.

### Safe deployment

The prototype should run in simulation or an isolated lab by default. Production integration must require explicit configuration and authorization.

The application should not automatically reconfigure routers, alter EIGRP settings, disable interfaces, or apply network changes as part of its discovery process.

## 13. Desktop Application Interface

The application will use a clean, professional operations-dashboard layout with a dedicated topology workspace.

### Screen 1: Overview dashboard

Display:

- Total known devices.
- Devices currently reachable.
- Devices with stale observations.
- Number of observed and inferred relationships.
- Active security alerts.
- Recent topology changes.
- Discovery job status.
- Latest successful update time.

Every metric should be derived from stored observations or clearly labelled simulation data.

### Screen 2: Interactive topology map

Display routers, switches, network segments, and supported site groupings.

The map should support:

- Zoom and pan.
- Device selection.
- Search and filtering.
- Relationship inspection.
- Location-based grouping.
- Evidence-status visualization.
- Change highlighting.
- Subgraph focus for large networks.

The map should avoid relying exclusively on color to communicate state. Labels, icons, and accessible status indicators should supplement visual styling.

### Screen 3: Device inventory

Display a searchable, sortable inventory containing device identifiers, hostnames, addresses, device roles, site assignments, monitoring status, and last-seen timestamps.

Administrators should be able to open a device to view its interfaces, relationships, observations, and event history.

### Screen 4: Device details

Show:

- Device identity and attributes.
- Known interfaces.
- Interface status.
- Associated IP and MAC information where available.
- Routing and neighbor information where supported.
- Relationships with other devices.
- Identity confidence.
- Recent observations.
- Historical events.

### Screen 5: Alerts and changes

Display a prioritized list of topology changes and security-relevant deviations.

Each alert should show its severity, timestamp, affected device, reason for detection, evidence, and suggested investigation steps.

The interface should support acknowledging alerts and documenting an investigation outcome. Acknowledging an alert must not automatically change the underlying topology evidence.

### Screen 6: Discovery configuration

Provide controls for authorized targets, polling intervals, source adapters, credentials references, maintenance windows, baseline management, and data retention.

High-impact configuration changes should require confirmation and be recorded in the audit trail.

### Screen 7: History and comparison

Allow users to compare the current topology with a previous snapshot and review added, removed, modified, and uncertain relationships.

### Screen 8: Reports

Allow export of inventory, topology, change history, and alert information.

Exports must indicate whether information is observed, inferred, stale, or simulated.

## 14. Proposed Technology Stack

The following stack is a proposed implementation choice, not a technology mandate specified by GAIL.

| Component | Recommended technology | Purpose |
|---|---|---|
| Desktop runtime | Electron | Cross-platform desktop application |
| Frontend | React + TypeScript | Interface and application state |
| Topology graph | React Flow | Interactive nodes and edges |
| Styling | Tailwind CSS | Consistent desktop UI |
| Discovery backend | Python | Network data collection and processing |
| SNMP integration | An actively maintained Python SNMP library | SNMPv3 polling and supported device queries |
| Data validation | Pydantic or equivalent | Validating normalized records |
| Local database | SQLite | Initial persistence and history |
| Larger deployment database | PostgreSQL, if needed | Multi-user or larger-scale persistence |
| Event updates | Server-sent events, WebSockets, or a local process channel | Delivering status and topology changes |
| Testing | pytest and frontend testing tools | Automated verification |
| Packaging | Electron Builder or an equivalent tool | Desktop application distribution |
| Version control | Git | Source management and reproducible changes |

All dependencies should be checked for license compatibility and maintained security updates. The final dependency selection must be consistent with the free/open-source resource constraint.

## 15. Data Model

The system should use a data model that preserves device identity, relationships, evidence, and history.

### Device

Suggested fields:

- `device_id`
- `hostname`
- `management_addresses`
- `device_type`
- `vendor`
- `model`
- `site_id`
- `identity_confidence`
- `monitoring_status`
- `first_seen`
- `last_seen`

### Interface

Suggested fields:

- `interface_id`
- `device_id`
- `interface_name`
- `ip_addresses`
- `mac_address`
- `interface_status`
- `last_observed`

### Observation

Suggested fields:

- `observation_id`
- `source_type`
- `reporting_device_id`
- `observed_resource`
- `observed_attributes`
- `observed_at`
- `collected_at`
- `validation_status`

### Relationship

Suggested fields:

- `relationship_id`
- `source_device_id`
- `destination_device_id`
- `source_interface_id`
- `destination_interface_id`
- `relationship_type`
- `evidence_references`
- `confidence_class`
- `first_seen`
- `last_seen`
- `status`

### Topology event

Suggested fields:

- `event_id`
- `event_type`
- `affected_resources`
- `previous_state`
- `new_state`
- `detected_at`
- `evidence_references`
- `severity`

### Security alert

Suggested fields:

- `alert_id`
- `alert_type`
- `severity`
- `affected_device_ids`
- `description`
- `evidence`
- `created_at`
- `acknowledged_at`
- `investigation_status`

### Discovery job

Suggested fields:

- `job_id`
- `scope_id`
- `started_at`
- `completed_at`
- `job_status`
- `devices_attempted`
- `devices_succeeded`
- `devices_failed`
- `failure_summary`

These are proposed logical schemas. The exact database structure may be adjusted during implementation, but evidence provenance and timestamps should be retained.

## 16. Development Phases

### Phase 1: Working desktop prototype

Build the Electron application with synthetic data.

Deliverables:

- Desktop shell and navigation.
- Interactive network topology.
- Device inventory.
- Device inspection panel.
- Simulated discovery status.
- Basic alerts and change timeline.
- Local persistence.

**Completion criterion:** A user can open the application, explore a generated network, inspect devices, and see simulated topology changes.

### Phase 2: Core topology engine

Implement normalized observations, identity correlation, relationship inference, and incremental graph updates.

Deliverables:

- Common observation schema.
- Device identity matching.
- Relationship evidence model.
- Topology persistence.
- Baseline comparison.
- Historical topology snapshots.
- Confidence and uncertainty classifications.

**Completion criterion:** Given a known synthetic dataset, the engine creates a consistent topology and explains the evidence supporting each relationship.

### Phase 3: Telemetry integration

Add supported data ingestion for SNMPv3, ARP/MAC information, routing records, syslog, traps, and other selected sources.

Prioritize sources according to the capabilities of the test environment.

Deliverables:

- Discovery adapters.
- Configuration validation.
- Polling and retry controls.
- Data freshness handling.
- Error reporting.
- Lab-based integration tests.

**Completion criterion:** The system can ingest supported, authorized observations from a controlled network or imported test records and update the topology.

### Phase 4: Security monitoring

Implement approved-baseline comparison, unknown-device alerts, suspicious change rules, and protected audit logging.

Deliverables:

- Baseline management.
- Unknown-device detection.
- Change severity rules.
- Alert evidence and explanations.
- Administrative audit trail.
- Credential handling and Electron hardening.

**Completion criterion:** Controlled test cases generate explainable alerts without treating every transient communication failure as a confirmed incident.

### Phase 5: Scale, reliability, and packaging

Improve graph performance, data retention, recovery, and distribution.

Deliverables:

- Incremental topology updates.
- Large synthetic dataset tests.
- Polling concurrency limits.
- Stale-observation handling.
- Database backup and recovery tests.
- Packaged desktop builds.
- Installation and user documentation.

**Completion criterion:** The packaged application can reproduce the demonstrated workflow reliably against the declared test environment and dataset.

## 17. Testing and Validation Plan

### Unit tests

Test individual components for:

- Device identity matching.
- Observation normalization.
- Relationship inference.
- Confidence classification.
- Topology change detection.
- Stale-device classification.
- Event deduplication.
- Input validation.
- Alert generation.

### Integration tests

Verify that:

- Discovery adapters produce valid observations.
- Observations update device records correctly.
- Routing changes affect logical relationships appropriately.
- Topology changes appear in the interface.
- Historical snapshots remain consistent.
- Failed polls do not immediately delete valid topology records.
- Duplicate and out-of-order events do not create incorrect state.

### Security tests

Verify that:

- Credentials are not exposed in logs.
- Invalid imported data is rejected safely.
- Discovery cannot run outside the configured scope.
- The Electron renderer cannot directly access privileged backend operations.
- Unauthorized backend requests are rejected.
- Sensitive exports are handled according to the configured policy.
- Audit records are generated for important administrative changes.

### Scalability tests

Use synthetic datasets of increasing size to measure:

- Device ingestion throughput.
- Topology generation time.
- Incremental update latency.
- Memory usage.
- Graph interaction responsiveness.
- Database query performance.
- Event backlog behavior.

Test results should report the hardware, dataset size, event rate, configuration, and observed measurements. Performance targets should be established before final evaluation.

### Scenario-based acceptance tests

**Scenario A: New authorized device**

Add a known device to the test dataset. Confirm that it appears in inventory and topology, and that its first-seen time and supporting evidence are recorded.

**Scenario B: Unknown device**

Introduce a device that is absent from the approved baseline. Confirm that the application flags it for investigation and displays the evidence.

**Scenario C: Link or routing change**

Change the relevant test observations. Confirm that the topology updates, the previous state remains available, and the application distinguishes logical routing changes from physical-link conclusions.

**Scenario D: Temporary device outage**

Stop observations from a device. Confirm that it becomes stale or unavailable according to the configured policy rather than being immediately deleted.

**Scenario E: Conflicting observations**

Supply inconsistent records for a device or connection. Confirm that the system preserves the conflict and marks the relationship uncertain.

**Scenario F: Recovery**

Restore the observations. Confirm that the application updates the monitoring state and retains the outage and recovery history.

## 18. Demonstration Plan

The final demonstration should tell a clear end-to-end story.

1. Open the desktop application and display a synthetic pipeline network with multiple sites, routers, switches, and communication relationships.
2. Select a router and inspect its interfaces, routing evidence, and neighboring devices.
3. Start a discovery cycle and show how the system processes new observations.
4. Introduce a new device into the simulation.
5. Show the device appearing in the inventory and topology.
6. Demonstrate an unknown-device alert because the device is absent from the approved baseline.
7. Change a routing relationship and show the resulting topology update.
8. Introduce a temporary device outage and demonstrate stale-state handling.
9. Compare the current topology with a previous snapshot.
10. Export a report containing devices, changes, alerts, and evidence classifications.

The demonstration should explicitly label simulated data. If real telemetry is available from an authorized lab, demonstrate that integration separately and identify which results come from actual device observations.

## 19. Expected Outcomes

The expected deliverables are:

- A functional Electron desktop application.
- An interactive topology visualization.
- A modular discovery backend.
- A normalized device and observation model.
- A topology correlation and inference engine.
- An EIGRP-aware logical topology module.
- Topology change detection and historical comparison.
- An unknown-device and anomaly alert subsystem.
- A persistent inventory and event store.
- A simulation environment for repeatable testing.
- Automated tests and a documented test methodology.
- Installation, configuration, architecture, and user documentation.

The prototype should demonstrate that useful topology information can be reconstructed from alternative network evidence without depending on CDP or LLDP.

The quality of the result will depend on the accuracy of identity resolution, the available evidence, and the validation of physical and logical relationship inference.

## 20. Limitations and Risks

### Incomplete physical topology information

ARP tables, routing tables, and flow records do not necessarily expose every physical link. Some switches or devices may not provide sufficient management information to identify their neighbors or port-level connections.

**Mitigation:** Show inferred and uncertain relationships separately and identify the additional evidence required for confirmation.

### Device compatibility

SNMP support and the available EIGRP information vary across vendors, device models, software versions, and configurations.

**Mitigation:** Develop modular adapters and validate against the actual test devices. Do not assume all devices expose the same information.

### Telemetry delays and missing data

Polling intervals, dropped traps, syslog delivery failures, and management connectivity problems can delay topology updates.

**Mitigation:** Combine periodic reconciliation with event-driven updates and explicit freshness tracking.

### False-positive alerts

Maintenance activities and legitimate configuration changes can resemble unexpected topology changes.

**Mitigation:** Use approved baselines, maintenance windows, alert explanations, and investigation workflows.

### Production network safety

Active discovery can create traffic and operational risk if performed without appropriate controls.

**Mitigation:** Use read-only collection where possible, bounded concurrency, authorized scopes, a lab-first deployment strategy, and explicit operational approval.

### Scalability limitations

A local database and desktop application may not be sufficient for every large-scale deployment or multi-operator environment.

**Mitigation:** Keep the backend modular and benchmark against defined workloads before selecting production deployment infrastructure.

## 21. Future Enhancements

Potential future work includes:

- Geographical visualization of pipeline sites and communication paths.
- More vendor-specific adapters.
- Integration with approved asset-management systems.
- Additional telemetry sources and configuration parsers.
- Impact analysis showing which devices and sites may be affected by a link failure.
- Comparison of expected and observed network segmentation.
- Explainable recommendations for investigating suspicious changes.
- Role-based access control for multiple operators.
- Centralized deployment with multiple read-only desktop clients.
- Improved large-graph rendering and hierarchical network exploration.
- Integration with authorized incident-management systems.
- Cryptographically protected audit checkpoints and signed topology exports.

These enhancements should be prioritized according to the available development time and the validated needs of the intended deployment.

## 22. Open-Source and Resource Considerations

GAIL's problem statement specifies that the organization will not provide hardware, software, licenses, data, or other resources to the participating teams.

Accordingly, the prototype should be developed using free and/or open-source resources.

The development plan should include:

- Open-source desktop and frontend frameworks.
- Open-source topology visualization libraries.
- Free and/or open-source network management libraries.
- Synthetic data generators.
- An isolated lab or container-based network simulation where feasible.
- Public documentation and legally usable sample data.
- A dependency inventory and license review.

The team must not assume access to GAIL's internal network, equipment, credentials, or operational telemetry.

## 23. Definition of Done

The project will be considered ready for its prototype demonstration when:

1. The Electron application installs and launches successfully.
2. The interface displays a multi-site network topology.
3. Device and relationship records preserve their source evidence.
4. The topology engine distinguishes physical-link inferences from logical relationships.
5. CDP and LLDP are not required by the discovery workflow.
6. The system detects and records controlled topology changes.
7. Unknown devices can be compared against an approved baseline.
8. Stale observations and conflicting evidence are represented correctly.
9. Historical topology comparison is functional.
10. Credentials and privileged operations are protected according to the design.
11. The automated test suite covers the critical discovery and change-detection workflows.
12. The demonstration clearly distinguishes synthetic data from real telemetry.
13. Documentation explains the architecture, setup, supported data sources, limitations, and test results.

## 24. Final Project Summary

The Pipeline Network Topology Intelligence System proposes a secure, explainable, and scalable approach to automatic topology discovery for EIGRP-based pipeline networks.

By correlating SNMPv3 observations, ARP and MAC tables, routing information, syslog events, traps, and other available sources, the system will construct and maintain a network graph without relying on CDP or LLDP.

Its central contribution is not simply visualizing devices, but connecting discovery evidence to device identity, relationship inference, topology changes, and security-relevant alerts.

The Electron desktop application will provide a practical interface for inspecting the network, investigating changes, and reviewing historical evidence. A modular backend will allow the solution to evolve from a synthetic-data prototype to a lab-integrated implementation and, subject to appropriate authorization and validation, a larger deployment.

The proposed system aims to reduce dependence on manual network documentation, improve visibility into distributed network infrastructure, and help administrators identify unexpected changes while preserving the security and operational constraints of critical industrial environments.