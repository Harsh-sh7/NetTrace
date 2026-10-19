import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Device, 
  Relationship, 
  SecurityAlert, 
  TopologyEvent, 
  DiscoveryConfig, 
  TopologySnapshot, 
  ActiveScreen 
} from '../types';
import { 
  INITIAL_CONFIG, 
  INITIAL_DEVICES, 
  INITIAL_RELATIONSHIPS, 
  INITIAL_ALERTS, 
  INITIAL_EVENTS, 
  INITIAL_SNAPSHOTS 
} from '../data/initialData';
import { inferTopology } from '../engine/inferenceEngine';
import { evaluateSecurityAlerts } from '../engine/changeDetection';
import { applyScenario, ScenarioType } from '../engine/simulationEngine';
import { calculateRoutePath, RouteCalculationResult } from '../engine/routePathCalculator';

interface TopologyContextType {
  activeScreen: ActiveScreen;
  setActiveScreen: (screen: ActiveScreen) => void;
  devices: Device[];
  relationships: Relationship[];
  alerts: SecurityAlert[];
  events: TopologyEvent[];
  snapshots: TopologySnapshot[];
  baselineSnapshot: TopologySnapshot;
  config: DiscoveryConfig;
  selectedDevice: Device | null;
  selectedRelationship: Relationship | null;
  isPolling: boolean;
  lastPollTime: string;
  activeScenario: ScenarioType | null;

  // Osprey Window Management
  deviceInspectorOpen: boolean;
  inspectedDeviceId: string | null;
  linkInspectorOpen: boolean;
  inspectedRelationshipId: string | null;
  sshTerminalOpen: boolean;
  sshDeviceId: string | null;
  routePathOpen: boolean;
  activityLogOpen: boolean;

  // NetTrace Route Path
  routeSourceId: string | null;
  routeDestId: string | null;
  routePathActive: boolean;
  routeResult: import('../engine/routePathCalculator').RouteCalculationResult;
  activeRouteEdgeIds: Set<string>;
  activeRouteNodeIds: Set<string>;

  // Help & Info
  helpOpen: boolean;
  toggleHelp: (forced?: boolean) => void;

  // Canvas Zoom & Flow Controls
  zoomLevel: number;
  zoomIn: () => void;
  zoomOut: () => void;
  fitView: () => void;
  registerFlowControls: (controls: { zoomIn: () => void; zoomOut: () => void; fitView: () => void; getZoom?: () => number }) => void;

  // Theme Mode
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  // NetTrace Layout & Toggles
  layoutMode: 'force-directed' | 'radial' | 'hierarchical';
  toggles: {
    snap: boolean;
    path: boolean;
    l2: boolean;
    labels: boolean;
  };
  
  // Actions
  selectDevice: (deviceId: string | null) => void;
  selectRelationship: (relationshipId: string | null) => void;
  openDeviceInspector: (deviceId: string) => void;
  closeDeviceInspector: () => void;
  openLinkInspector: (relationshipId: string) => void;
  closeLinkInspector: () => void;
  openSshTerminal: (deviceId: string) => void;
  closeSshTerminal: () => void;
  toggleRoutePath: (forced?: boolean) => void;
  toggleActivityLog: (forced?: boolean) => void;
  setRouteSource: (deviceId: string | null) => void;
  setRouteDest: (deviceId: string | null) => void;
  clearRoutePath: () => void;
  setLayoutMode: (mode: 'force-directed' | 'radial' | 'hierarchical') => void;
  setToggle: (key: 'snap' | 'path' | 'l2' | 'labels', val?: boolean) => void;
  triggerScenario: (scenario: ScenarioType) => void;
  triggerManualPoll: () => void;
  toggleAutoPolling: () => void;
  acknowledgeAlert: (alertId: string) => void;
  resolveAlert: (alertId: string) => void;
  updateConfig: (newConfig: Partial<DiscoveryConfig>) => void;
  createSnapshot: (label: string) => TopologySnapshot;
  freezeCurrentAsBaseline: () => void;
  resetToInitial: () => void;
}

const TopologyContext = createContext<TopologyContextType | undefined>(undefined);

export const TopologyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('topology');
  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);
  const [relationships, setRelationships] = useState<Relationship[]>(INITIAL_RELATIONSHIPS);
  const [alerts, setAlerts] = useState<SecurityAlert[]>(INITIAL_ALERTS);
  const [events, setEvents] = useState<TopologyEvent[]>(INITIAL_EVENTS);
  const [snapshots, setSnapshots] = useState<TopologySnapshot[]>(INITIAL_SNAPSHOTS);
  const [baselineSnapshot, setBaselineSnapshot] = useState<TopologySnapshot>(INITIAL_SNAPSHOTS[0]);
  const [config, setConfig] = useState<DiscoveryConfig>(INITIAL_CONFIG);

  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [selectedRelationshipId, setSelectedRelationshipId] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState<boolean>(true);
  const [lastPollTime, setLastPollTime] = useState<string>('2026-10-20 13:20:00');
  const [activeScenario, setActiveScenario] = useState<ScenarioType | null>(null);

  // Osprey Floating Window States
  const [deviceInspectorOpen, setDeviceInspectorOpen] = useState<boolean>(true);
  const [inspectedDeviceId, setInspectedDeviceId] = useState<string | null>('DEV-RTR-CCF-01');

  const [linkInspectorOpen, setLinkInspectorOpen] = useState<boolean>(true);
  const [inspectedRelationshipId, setInspectedRelationshipId] = useState<string | null>('REL-EIGRP-01');

  const [sshTerminalOpen, setSshTerminalOpen] = useState<boolean>(true);
  const [sshDeviceId, setSshDeviceId] = useState<string | null>('DEV-RTR-CS01-01');

  const [routePathOpen, setRoutePathOpen] = useState<boolean>(false);
  const [activityLogOpen, setActivityLogOpen] = useState<boolean>(false);

  // Route Path selection
  const [routeSourceId, setRouteSourceId] = useState<string | null>('DEV-RTR-CCF-01');
  const [routeDestId, setRouteDestId] = useState<string | null>('DEV-RTR-CS01-01');
  const [routePathActive, setRoutePathActive] = useState<boolean>(false);

  // Dynamic Dijkstra Route Path Calculation
  const routeResult: RouteCalculationResult = useMemo(() => {
    return calculateRoutePath(devices, relationships, routeSourceId, routeDestId);
  }, [devices, relationships, routeSourceId, routeDestId]);

  const activeRouteEdgeIds = useMemo(() => new Set(routeResult.edgeIds), [routeResult]);
  const activeRouteNodeIds = useMemo(() => new Set(routeResult.hops.map(h => h.id)), [routeResult]);

  // Help & Operational Guide Floating Window
  const [helpOpen, setHelpOpen] = useState<boolean>(false);
  const toggleHelp = (forced?: boolean) => {
    setHelpOpen(prev => forced !== undefined ? forced : !prev);
  };

  // Flow Canvas Zoom & Navigation Controls
  const flowControlsRef = useRef<{ zoomIn: () => void; zoomOut: () => void; fitView: () => void; getZoom?: () => number } | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const registerFlowControls = useCallback((controls: { zoomIn: () => void; zoomOut: () => void; fitView: () => void; getZoom?: () => number }) => {
    flowControlsRef.current = controls;
    if (controls.getZoom) {
      setZoomLevel(Math.round(controls.getZoom() * 100));
    }
  }, []);

  const zoomIn = useCallback(() => {
    flowControlsRef.current?.zoomIn();
    if (flowControlsRef.current?.getZoom) {
      setZoomLevel(Math.round(flowControlsRef.current.getZoom() * 100));
    }
  }, []);

  const zoomOut = useCallback(() => {
    flowControlsRef.current?.zoomOut();
    if (flowControlsRef.current?.getZoom) {
      setZoomLevel(Math.round(flowControlsRef.current.getZoom() * 100));
    }
  }, []);

  const fitView = useCallback(() => {
    flowControlsRef.current?.fitView();
    if (flowControlsRef.current?.getZoom) {
      setZoomLevel(Math.round(flowControlsRef.current.getZoom() * 100));
    }
  }, []);

  // Theme State (Dark / Light)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('light', 'light-mode');
      document.documentElement.classList.add('dark', 'dark-mode');
    }
  }, []);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      if (typeof document !== 'undefined') {
        if (next === 'light') {
          document.documentElement.classList.add('light-mode', 'light');
          document.documentElement.classList.remove('dark-mode', 'dark');
        } else {
          document.documentElement.classList.add('dark-mode', 'dark');
          document.documentElement.classList.remove('light-mode', 'light');
        }
      }
      return next;
    });
  };

  // NetTrace Layout & Toggles
  const [layoutMode, setLayoutMode] = useState<'force-directed' | 'radial' | 'hierarchical'>('force-directed');
  const [toggles, setToggles] = useState({
    snap: true,
    path: false,
    l2: true,
    labels: true,
  });

  const selectedDevice = devices.find(d => d.device_id === selectedDeviceId) || null;
  const selectedRelationship = relationships.find(r => r.relationship_id === selectedRelationshipId) || null;

  const setToggle = (key: 'snap' | 'path' | 'l2' | 'labels', val?: boolean) => {
    setToggles(prev => {
      const nextVal = val !== undefined ? val : !prev[key];
      if (key === 'path') {
        setRoutePathActive(nextVal);
        setRoutePathOpen(nextVal);
      }
      return { ...prev, [key]: nextVal };
    });
  };

  const openDeviceInspector = (deviceId: string) => {
    setInspectedDeviceId(deviceId);
    setDeviceInspectorOpen(true);
    setSelectedDeviceId(deviceId);
    setSelectedRelationshipId(null);
  };

  const closeDeviceInspector = () => {
    setDeviceInspectorOpen(false);
  };

  const openLinkInspector = (relationshipId: string) => {
    setInspectedRelationshipId(relationshipId);
    setLinkInspectorOpen(true);
    setSelectedRelationshipId(relationshipId);
    setSelectedDeviceId(null);
  };

  const closeLinkInspector = () => {
    setLinkInspectorOpen(false);
  };

  const openSshTerminal = (deviceId: string) => {
    setSshDeviceId(deviceId);
    setSshTerminalOpen(true);
  };

  const closeSshTerminal = () => {
    setSshTerminalOpen(false);
  };

  const toggleRoutePath = (forced?: boolean) => {
    const nextVal = forced !== undefined ? forced : !routePathOpen;
    setRoutePathOpen(nextVal);
    setRoutePathActive(nextVal);
    setToggles(prev => ({ ...prev, path: nextVal }));
  };

  const toggleActivityLog = (forced?: boolean) => {
    setActivityLogOpen(prev => (forced !== undefined ? forced : !prev));
  };

  const setRouteSource = (deviceId: string | null) => {
    setRouteSourceId(deviceId);
    if (deviceId) {
      setRoutePathActive(true);
      setRoutePathOpen(true);
      setToggles(prev => ({ ...prev, path: true }));
    }
  };

  const setRouteDest = (deviceId: string | null) => {
    setRouteDestId(deviceId);
    if (deviceId) {
      setRoutePathActive(true);
      setRoutePathOpen(true);
      setToggles(prev => ({ ...prev, path: true }));
    }
  };

  const clearRoutePath = () => {
    setRouteSourceId(null);
    setRouteDestId(null);
    setRoutePathActive(false);
    setRoutePathOpen(false);
    setToggles(prev => ({ ...prev, path: false }));
  };

  // Run discovery cycle and update alerts
  const runDiscoveryCycle = useCallback(() => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setLastPollTime(timestamp);

    // Infer topology with multi-source evidence
    const inference = inferTopology(devices, relationships);
    setRelationships(inference.relationships);

    // Evaluate security & baseline changes
    const security = evaluateSecurityAlerts(devices, inference.relationships, baselineSnapshot, config.maintenance_window_active);
    
    // Merge new alerts with existing
    setAlerts(prev => {
      const existingIds = new Set(prev.map(a => a.alert_id));
      const newlyAdded = security.alerts.filter(a => !existingIds.has(a.alert_id));
      return [...newlyAdded, ...prev];
    });

    if (security.events.length > 0) {
      setEvents(prev => [...security.events, ...prev]);
    }
  }, [devices, relationships, baselineSnapshot, config.maintenance_window_active]);

  // Periodic polling timer (every 30s when enabled)
  useEffect(() => {
    if (!isPolling) return;
    const interval = setInterval(() => {
      runDiscoveryCycle();
    }, config.polling_interval_seconds * 1000);

    return () => clearInterval(interval);
  }, [isPolling, config.polling_interval_seconds, runDiscoveryCycle]);

  const selectDevice = (deviceId: string | null) => {
    setSelectedDeviceId(deviceId);
    if (deviceId) {
      setSelectedRelationshipId(null);
    }
  };

  const selectRelationship = (relationshipId: string | null) => {
    setSelectedRelationshipId(relationshipId);
    if (relationshipId) {
      setSelectedDeviceId(null);
    }
  };

  const triggerScenario = (scenario: ScenarioType) => {
    setActiveScenario(scenario);
    const result = applyScenario(scenario, devices, relationships);

    setDevices(result.devices);
    setRelationships(result.relationships);

    if (result.newEvent) {
      setEvents(prev => [result.newEvent!, ...prev]);
    }

    if (result.newAlert) {
      setAlerts(prev => [result.newAlert!, ...prev.filter(a => a.alert_id !== result.newAlert!.alert_id)]);
    }

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setLastPollTime(timestamp);
  };

  const triggerManualPoll = () => {
    runDiscoveryCycle();
  };

  const toggleAutoPolling = () => {
    setIsPolling(prev => !prev);
  };

  const acknowledgeAlert = (alertId: string) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setAlerts(prev => prev.map(a => {
      if (a.alert_id === alertId) {
        return {
          ...a,
          acknowledged_at: now,
          acknowledged_by: 'scada_operator_sec',
          investigation_status: 'INVESTIGATING'
        };
      }
      return a;
    }));
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => {
      if (a.alert_id === alertId) {
        return {
          ...a,
          investigation_status: 'RESOLVED'
        };
      }
      return a;
    }));
  };

  const updateConfig = (newConfig: Partial<DiscoveryConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  const createSnapshot = (label: string): TopologySnapshot => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const snap: TopologySnapshot = {
      snapshot_id: `SNAP-${Date.now()}`,
      timestamp: now,
      label,
      device_count: devices.length,
      relationship_count: relationships.length,
      devices: JSON.parse(JSON.stringify(devices)),
      relationships: JSON.parse(JSON.stringify(relationships)),
      alerts_count: alerts.filter(a => a.investigation_status === 'OPEN').length
    };
    setSnapshots(prev => [snap, ...prev]);
    return snap;
  };

  const freezeCurrentAsBaseline = () => {
    const snap = createSnapshot('Frozen Approved Baseline');
    setBaselineSnapshot(snap);
    setConfig(prev => ({
      ...prev,
      baseline_frozen: true,
      baseline_last_updated: snap.timestamp
    }));
    setEvents(prev => [
      {
        event_id: `EVT-${Date.now()}`,
        event_type: 'BASELINE_FREEZE',
        affected_resources: ['GLOBAL_BASELINE'],
        previous_state: 'MODIFIED',
        new_state: 'FROZEN_BASELINE',
        detected_at: snap.timestamp,
        evidence_references: [snap.snapshot_id],
        severity: 'INFO',
        description: `Official network topology baseline updated and frozen (${snap.device_count} devices, ${snap.relationship_count} connections).`
      },
      ...prev
    ]);
  };

  const resetToInitial = () => {
    setDevices(INITIAL_DEVICES);
    setRelationships(INITIAL_RELATIONSHIPS);
    setAlerts(INITIAL_ALERTS);
    setEvents(INITIAL_EVENTS);
    setActiveScenario(null);
    setSelectedDeviceId(null);
    setSelectedRelationshipId(null);
    setLastPollTime('2026-10-20 13:20:00');
  };

  return (
    <TopologyContext.Provider
      value={{
        activeScreen,
        setActiveScreen,
        devices,
        relationships,
        alerts,
        events,
        snapshots,
        baselineSnapshot,
        config,
        selectedDevice,
        selectedRelationship,
        isPolling,
        lastPollTime,
        activeScenario,
        deviceInspectorOpen,
        inspectedDeviceId,
        linkInspectorOpen,
        inspectedRelationshipId,
        sshTerminalOpen,
        sshDeviceId,
        routePathOpen,
        activityLogOpen,
        routeSourceId,
        routeDestId,
        routePathActive,
        routeResult,
        activeRouteEdgeIds,
        activeRouteNodeIds,
        helpOpen,
        toggleHelp,
        zoomLevel,
        zoomIn,
        zoomOut,
        fitView,
        registerFlowControls,
        theme,
        toggleTheme,
        layoutMode,
        toggles,
        selectDevice,
        selectRelationship,
        openDeviceInspector,
        closeDeviceInspector,
        openLinkInspector,
        closeLinkInspector,
        openSshTerminal,
        closeSshTerminal,
        toggleRoutePath,
        toggleActivityLog,
        setRouteSource,
        setRouteDest,
        clearRoutePath,
        setLayoutMode,
        setToggle,
        triggerScenario,
        triggerManualPoll,
        toggleAutoPolling,
        acknowledgeAlert,
        resolveAlert,
        updateConfig,
        createSnapshot,
        freezeCurrentAsBaseline,
        resetToInitial,
      }}
    >
      {children}
    </TopologyContext.Provider>
  );
};

export const useTopology = () => {
  const context = useContext(TopologyContext);
  if (!context) {
    throw new Error('useTopology must be used within a TopologyProvider');
  }
  return context;
};
