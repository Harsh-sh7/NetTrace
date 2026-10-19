import React, { useMemo, useCallback, useEffect } from 'react';
import { 
  ReactFlow, 
  Controls, 
  Background, 
  MiniMap,
  useNodesState, 
  useEdgesState,
  useReactFlow,
  Node,
  Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { DeviceNode } from './DeviceNode';
import { NetTraceEdge } from './NetTraceEdge';
import { DeviceInspectorWindow } from './DeviceInspectorWindow';
import { LinkInspectorWindow } from './LinkInspectorWindow';
import { SshTerminalWindow } from './SshTerminalWindow';
import { RoutePathWindow } from './RoutePathWindow';
import { ActivityLogWindow } from './ActivityLogWindow';
import { HelpQuickRefWindow } from './HelpQuickRefWindow';
import { useTopology } from '../../context/TopologyContext';
import { Device } from '../../types';

const nodeTypes = {
  device: DeviceNode,
};

const edgeTypes = {
  physical: NetTraceEdge,
  logical: NetTraceEdge,
};

// Calculate deterministic node positions for different NetTrace layouts
export const computeNodePositions = (devices: Device[], layout: 'force-directed' | 'radial' | 'hierarchical') => {
  const positions: Record<string, { x: number; y: number }> = {};

  if (layout === 'hierarchical') {
    // Core Layer Top (y: 110), Distribution Layer Middle (y: 310), Field OT Bottom (y: 520)
    let coreIdx = 0, distIdx = 0, fieldIdx = 0;
    devices.forEach(d => {
      if (d.device_type === 'ROUTER') {
        positions[d.device_id] = { x: 200 + (coreIdx++) * 230, y: 110 };
      } else if (d.device_type === 'SWITCH' || d.device_type === 'SCADA_SERVER') {
        positions[d.device_id] = { x: 180 + (distIdx++) * 220, y: 310 };
      } else {
        positions[d.device_id] = { x: 140 + (fieldIdx++) * 180, y: 520 };
      }
    });
    return positions;
  }

  if (layout === 'radial') {
    // Concentric radial topology with Master CCF Core at center
    const centerX = 640;
    const centerY = 340;
    positions['DEV-RTR-CCF-01'] = { x: centerX, y: centerY };

    // Ring 1: Core Distribution & Area Gateways (radius = 200)
    const ring1Ids = [
      'DEV-SW-CCF-01',
      'DEV-SRV-SCADA-01',
      'DEV-RTR-CS01-01',
      'DEV-RTR-VS04-01',
      'DEV-RTR-PS02-01',
      'DEV-RTR-TS01-01',
    ];
    const r1 = 200;
    ring1Ids.forEach((id, idx) => {
      const angle = (idx * (2 * Math.PI / ring1Ids.length)) - Math.PI / 2;
      positions[id] = {
        x: Math.round(centerX + r1 * Math.cos(angle)),
        y: Math.round(centerY + r1 * Math.sin(angle)),
      };
    });

    // Ring 2: Field Substation switches, PLCs, RTUs (radius = 370)
    const ring2Ids = [
      'DEV-SW-CS01-01',
      'DEV-PLC-COMP-01',
      'DEV-RTU-CS01-01',
      'DEV-SW-VS04-01',
      'DEV-RTU-VS04-01',
      'DEV-CP-MON-01',
      'DEV-PLC-PUMP-01',
      'DEV-RTU-METER-01',
      'DEV-RTR-VS07-01',
      'DEV-ROGUE-01',
    ];
    const r2 = 380;
    ring2Ids.forEach((id, idx) => {
      const angle = (idx * (2 * Math.PI / ring2Ids.length)) - Math.PI / 2;
      positions[id] = {
        x: Math.round(centerX + r2 * Math.cos(angle)),
        y: Math.round(centerY + r2 * Math.sin(angle)),
      };
    });

    // Fallback for any newly discovered or remaining devices
    devices.forEach((d, idx) => {
      if (!positions[d.device_id]) {
        const angle = (idx * (2 * Math.PI / 12));
        positions[d.device_id] = {
          x: Math.round(centerX + 440 * Math.cos(angle)),
          y: Math.round(centerY + 440 * Math.sin(angle)),
        };
      }
    });

    return positions;
  }

  // Default: Force-Directed Constellation (Clean geographic pipeline distribution)
  positions['DEV-RTR-CCF-01'] = { x: 340, y: 320 }; // ccf-core1 (Central Control Facility)
  positions['DEV-SW-CCF-01']  = { x: 480, y: 220 }; // ccf-sw1
  positions['DEV-SRV-SCADA-01'] = { x: 220, y: 180 }; // scada-srv1

  positions['DEV-RTR-CS01-01'] = { x: 740, y: 280 }; // cs01-rtr1 (Compressor Station 01)
  positions['DEV-SW-CS01-01']  = { x: 880, y: 180 }; // cs01-sw1
  positions['DEV-PLC-COMP-01'] = { x: 980, y: 260 }; // cs01-plc1
  positions['DEV-RTU-CS01-01'] = { x: 860, y: 380 }; // cs01-rtu1

  positions['DEV-RTR-VS04-01'] = { x: 580, y: 100 }; // vs04-rtr1 (Valve Station 04)
  positions['DEV-SW-VS04-01']  = { x: 440, y: 60 };  // vs04-sw1
  positions['DEV-RTU-VS04-01'] = { x: 680, y: 40 };  // vs04-rtu1
  positions['DEV-CP-MON-01']   = { x: 320, y: 80 };  // cp-mon1

  positions['DEV-RTR-PS02-01'] = { x: 620, y: 480 }; // ps02-rtr1 (Pumping Station 02)
  positions['DEV-PLC-PUMP-01'] = { x: 780, y: 520 }; // ps02-plc1

  positions['DEV-RTR-TS01-01'] = { x: 960, y: 480 }; // ts01-rtr1 (Terminal Station 01)
  positions['DEV-RTU-METER-01']= { x: 1080, y: 420 };// ts01-rtu1

  positions['DEV-ROGUE-01']    = { x: 920, y: 80 };  // rogue-pi1 (Rogue device)
  positions['DEV-RTR-VS07-01'] = { x: 480, y: 460 }; // vs07-rtr1

  // Handle any remaining devices
  devices.forEach((d, idx) => {
    if (!positions[d.device_id]) {
      positions[d.device_id] = {
        x: 600 + Math.cos((idx * 36 * Math.PI) / 180) * 340,
        y: 300 + Math.sin((idx * 36 * Math.PI) / 180) * 340,
      };
    }
  });

  return positions;
};

// Bridge component to register ReactFlow instance controls with TopologyContext
const FlowBridge: React.FC = () => {
  const { zoomIn, zoomOut, fitView, getZoom } = useReactFlow();
  const { registerFlowControls } = useTopology();

  useEffect(() => {
    registerFlowControls({
      zoomIn: () => zoomIn({ duration: 300 }),
      zoomOut: () => zoomOut({ duration: 300 }),
      fitView: () => fitView({ padding: 0.15, duration: 400 }),
      getZoom,
    });
  }, [registerFlowControls, zoomIn, zoomOut, fitView, getZoom]);

  return null;
};

export const TopologyMap: React.FC = () => {
  const { 
    devices, 
    relationships, 
    openDeviceInspector, 
    openLinkInspector, 
    inspectedDeviceId,
    inspectedRelationshipId,
    layoutMode,
    toggles,
    theme
  } = useTopology();

  const isLight = theme === 'light';

  const positions = useMemo(() => computeNodePositions(devices, layoutMode), [devices, layoutMode]);

  // Generate Nodes
  const initialNodes: Node[] = useMemo(() => {
    return devices.map((device) => {
      const pos = positions[device.device_id] || { x: 400, y: 300 };

      return {
        id: device.device_id,
        type: 'device',
        position: pos,
        data: {
          device,
          isSelected: inspectedDeviceId === device.device_id,
        },
        selected: inspectedDeviceId === device.device_id,
      };
    });
  }, [devices, positions, inspectedDeviceId]);

  // Generate Edges
  const initialEdges: Edge[] = useMemo(() => {
    const nodeIds = new Set(initialNodes.map(n => n.id));

    return relationships
      .filter(rel => nodeIds.has(rel.source_device_id) && nodeIds.has(rel.destination_device_id))
      .filter(rel => {
        // Respect L2 toggle
        if (!toggles.l2 && rel.relationship_type === 'SWITCH_PORT_FORWARD') {
          return false;
        }
        return true;
      })
      .map(rel => {
        const isEigrp = rel.relationship_type === 'EIGRP_ADJACENCY';
        const isSelected = inspectedRelationshipId === rel.relationship_id;

        return {
          id: rel.relationship_id,
          source: rel.source_device_id,
          target: rel.destination_device_id,
          type: isEigrp ? 'logical' : 'physical',
          data: { relationship: rel },
          selected: isSelected,
        };
      });
  }, [relationships, initialNodes, inspectedRelationshipId, toggles.l2]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  const onNodeClick = useCallback((_e: React.MouseEvent, node: Node) => {
    openDeviceInspector(node.id);
  }, [openDeviceInspector]);

  const onEdgeClick = useCallback((_e: React.MouseEvent, edge: Edge) => {
    openLinkInspector(edge.id);
  }, [openLinkInspector]);

  return (
    <div className={`relative w-full h-[calc(100vh-92px)] overflow-hidden select-none transition-colors duration-200 ${
      isLight ? 'bg-[#f8fafc]' : 'bg-[#0a101d]'
    }`}>
      {/* Blueprint Grid & Canvas Viewport */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        snapToGrid={toggles.snap}
        snapGrid={[24, 24]}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.2}
        maxZoom={2.5}
        className={isLight ? 'bg-[#f8fafc]' : 'bg-[#0a101d]'}
      >
        {/* Flow Controls Bridge */}
        <FlowBridge />

        {/* Crisp NetTrace Blueprint Grid */}
        <Background 
          color={isLight ? "#cbd5e1" : "#13203c"} 
          gap={24} 
          size={1} 
          className={isLight ? "opacity-90" : "opacity-75"}
        />

        {/* Minimal Controls */}
        <Controls 
          className={`!shadow-2xl !rounded-md overflow-hidden ${
            isLight
              ? '!bg-white !border-slate-300 [&>button]:!bg-white [&>button]:!border-slate-200 [&>button]:!text-slate-700 hover:[&>button]:!bg-slate-100'
              : '!bg-[#0c1629] !border-[#1c2e4e] [&>button]:!bg-[#0c1629] [&>button]:!border-[#1c2e4e] [&>button]:!text-slate-300 hover:[&>button]:!bg-[#152a5c]'
          }`}
        />

        {/* NetTrace Mini-Map Galaxy Overview */}
        <MiniMap 
          nodeColor={(n) => {
            const dev = (n.data as any)?.device as Device | undefined;
            if (dev?.is_rogue) return '#ef4444';
            if (dev?.device_type === 'ROUTER') return '#2574e8';
            if (dev?.device_type === 'SWITCH') return '#22c55e';
            return '#f59e0b';
          }}
          maskColor={isLight ? "rgba(241, 245, 249, 0.75)" : "rgba(10, 16, 29, 0.75)"}
          className={`!rounded-md !shadow-2xl !w-44 !h-28 !bottom-3 !right-3 ${
            isLight ? '!bg-white/90 !border !border-slate-300' : '!bg-[#0a101d]/90 !border !border-[#1c2e4e]'
          }`}
        />
      </ReactFlow>

      {/* NetTrace Floating Draggable OS-like Windows */}
      <DeviceInspectorWindow />
      <LinkInspectorWindow />
      <SshTerminalWindow />
      <RoutePathWindow />
      <ActivityLogWindow />
      <HelpQuickRefWindow />
    </div>
  );
};
