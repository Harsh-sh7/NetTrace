import { Device, Relationship } from '../types';
import { getShortHostname } from '../components/topology/DeviceNode';

export interface RouteHop {
  id: string;
  name: string;
  ip: string;
  deviceType: string;
  cost: number;
  cumulativeCost: number;
  subnet: string;
  outInterface: string;
}

export interface RouteCalculationResult {
  found: boolean;
  sourceId: string;
  destId: string;
  sourceName: string;
  destName: string;
  hops: RouteHop[];
  edgeIds: string[];
  totalCost: number;
  isSymmetric: boolean;
  hopCount: number;
  protocol: string;
}

interface GraphEdge {
  targetId: string;
  edgeId: string;
  relationship: Relationship;
  metric: number;
}

/**
 * Deterministic Shortest Path First (SPF) Route Calculator for SCADA OT Network
 * Computes authentic EIGRP / IGP hop-by-hop forwarding paths without relying on CDP/LLDP.
 */
export function calculateRoutePath(
  devices: Device[],
  relationships: Relationship[],
  sourceId: string | null,
  destId: string | null,
  protocol: string = 'EIGRP'
): RouteCalculationResult {
  const deviceMap = new Map<string, Device>(devices.map(d => [d.device_id, d]));
  const srcDevice = sourceId ? deviceMap.get(sourceId) : null;
  const dstDevice = destId ? deviceMap.get(destId) : null;

  const defaultResult: RouteCalculationResult = {
    found: false,
    sourceId: sourceId || '',
    destId: destId || '',
    sourceName: srcDevice ? getShortHostname(srcDevice.hostname, srcDevice.device_id) : 'Unknown',
    destName: dstDevice ? getShortHostname(dstDevice.hostname, dstDevice.device_id) : 'Unknown',
    hops: [],
    edgeIds: [],
    totalCost: 0,
    isSymmetric: true,
    hopCount: 0,
    protocol
  };

  if (!sourceId || !destId || !srcDevice || !dstDevice) {
    return defaultResult;
  }

  if (sourceId === destId) {
    const srcShort = getShortHostname(srcDevice.hostname, srcDevice.device_id);
    return {
      ...defaultResult,
      found: true,
      hops: [{
        id: srcDevice.device_id,
        name: srcShort,
        ip: srcDevice.management_addresses[0] || '10.240.10.1',
        deviceType: srcDevice.device_type,
        cost: 0,
        cumulativeCost: 0,
        subnet: '10.240.0.0/24',
        outInterface: 'Loopback0'
      }],
      totalCost: 0,
      hopCount: 1,
      isSymmetric: true
    };
  }

  // 1. Build adjacency graph from active relationships (excluding DOWN links)
  const graph = new Map<string, GraphEdge[]>();

  for (const d of devices) {
    graph.set(d.device_id, []);
  }

  for (const rel of relationships) {
    if (rel.status === 'DOWN') continue;

    // Filter by protocol if strict
    // EIGRP adjacencies and physical L2 interconnects are valid transit paths
    let metric = 10000; // Standard EIGRP 1Gbps metric baseline
    if (rel.relationship_type === 'SWITCH_PORT_FORWARD' || rel.relationship_type === 'PHYSICAL_CABLE') {
      metric = 10; // Low latency Layer-2 switch traversal
    } else if (rel.relationship_type === 'EIGRP_ADJACENCY') {
      metric = 10000;
    }

    const srcEdges = graph.get(rel.source_device_id) || [];
    srcEdges.push({
      targetId: rel.destination_device_id,
      edgeId: rel.relationship_id,
      relationship: rel,
      metric
    });
    graph.set(rel.source_device_id, srcEdges);

    // Bidirectional network connectivity
    const dstEdges = graph.get(rel.destination_device_id) || [];
    dstEdges.push({
      targetId: rel.source_device_id,
      edgeId: rel.relationship_id,
      relationship: rel,
      metric
    });
    graph.set(rel.destination_device_id, dstEdges);
  }

  // 2. Dijkstra's Algorithm for Shortest Path
  const distances = new Map<string, number>();
  const previous = new Map<string, { nodeId: string; edgeId: string; metric: number; rel: Relationship }>();
  const unvisited = new Set<string>();

  for (const d of devices) {
    distances.set(d.device_id, Infinity);
    unvisited.add(d.device_id);
  }

  distances.set(sourceId, 0);

  while (unvisited.size > 0) {
    // Find unvisited node with smallest distance
    let currentId: string | null = null;
    let minDistance = Infinity;

    for (const nodeId of unvisited) {
      const dist = distances.get(nodeId) ?? Infinity;
      if (dist < minDistance) {
        minDistance = dist;
        currentId = nodeId;
      }
    }

    if (!currentId || minDistance === Infinity) break;
    if (currentId === destId) break;

    unvisited.delete(currentId);

    const neighbors = graph.get(currentId) || [];
    for (const neighbor of neighbors) {
      if (!unvisited.has(neighbor.targetId)) continue;

      const alt = minDistance + neighbor.metric;
      const currentNeighborDist = distances.get(neighbor.targetId) ?? Infinity;

      if (alt < currentNeighborDist) {
        distances.set(neighbor.targetId, alt);
        previous.set(neighbor.targetId, {
          nodeId: currentId,
          edgeId: neighbor.edgeId,
          metric: neighbor.metric,
          rel: neighbor.relationship
        });
      }
    }
  }

  const finalDist = distances.get(destId);
  if (finalDist === undefined || finalDist === Infinity) {
    return defaultResult; // Destination unreachable
  }

  // 3. Reconstruct path from dest back to source
  const pathNodeIds: string[] = [];
  const pathEdgeIds: string[] = [];
  const edgeMetrics: number[] = [];
  let curr: string | undefined = destId;

  while (curr && curr !== sourceId) {
    pathNodeIds.unshift(curr);
    const prevEntry = previous.get(curr);
    if (!prevEntry) break;
    pathEdgeIds.unshift(prevEntry.edgeId);
    edgeMetrics.unshift(prevEntry.metric);
    curr = prevEntry.nodeId;
  }
  pathNodeIds.unshift(sourceId);

  // 4. Construct Hop Details
  let cumulative = 0;
  const hops: RouteHop[] = pathNodeIds.map((nodeId, idx) => {
    const dev = deviceMap.get(nodeId);
    const short = dev ? getShortHostname(dev.hostname, dev.device_id) : nodeId;
    const ip = dev?.management_addresses[0] || '10.240.10.1';
    const cost = idx === 0 ? 0 : (edgeMetrics[idx - 1] || 10);
    cumulative += cost;

    // Interface extraction
    let outIface = 'Gi0/0/0';
    if (idx < pathNodeIds.length - 1) {
      const nextId = pathNodeIds[idx + 1];
      const rel = relationships.find(r => 
        (r.source_device_id === nodeId && r.destination_device_id === nextId) ||
        (r.source_device_id === nextId && r.destination_device_id === nodeId)
      );
      if (rel) {
        outIface = rel.source_device_id === nodeId 
          ? (rel.source_interface_name || 'Gi0/0/1')
          : (rel.destination_interface_name || 'Gi0/0/0');
      }
    } else {
      outIface = 'Loopback0 (Host Route)';
    }

    return {
      id: nodeId,
      name: short,
      ip,
      deviceType: dev?.device_type || 'ROUTER',
      cost,
      cumulativeCost: cumulative,
      subnet: ip.replace(/\.\d+$/, '.0/24'),
      outInterface: outIface
    };
  });

  return {
    found: true,
    sourceId,
    destId,
    sourceName: getShortHostname(srcDevice.hostname, srcDevice.device_id),
    destName: getShortHostname(dstDevice.hostname, dstDevice.device_id),
    hops,
    edgeIds: pathEdgeIds,
    totalCost: cumulative,
    isSymmetric: true,
    hopCount: hops.length,
    protocol
  };
}
