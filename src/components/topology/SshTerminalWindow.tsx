import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Send, CheckCircle2, ShieldCheck, Play } from 'lucide-react';
import { NetTraceWindow } from './NetTraceWindow';
import { useTopology } from '../../context/TopologyContext';
import { getShortHostname } from './DeviceNode';

export const SshTerminalWindow: React.FC = () => {
  const { 
    sshTerminalOpen, 
    sshDeviceId, 
    closeSshTerminal, 
    devices,
    theme 
  } = useTopology();

  const isLight = theme === 'light';

  const device = devices.find(d => d.device_id === sshDeviceId) || devices[0];
  const shortName = device ? getShortHostname(device.hostname, device.device_id) : 'mia1-cr1';
  const mgmtIp = device?.management_addresses[0] || '10.240.10.1';

  const [inputCmd, setInputCmd] = useState('');
  const [history, setHistory] = useState<Array<{ type: 'input' | 'output'; text: string }>>([
    {
      type: 'output',
      text: `Connected to ${shortName} (${mgmtIp}) via SSHv2 (AES-256-GCM).\n` +
            `Cisco IOS Software, IOS-XE Version 17.6.3a\n` +
            `GAIL India Limited - Gas Pipeline SCADA Network Zone 1\n` +
            `Strict Operational Policy: CDP & LLDP protocols are disabled.\n` +
            `Type 'help' or click command chips below for diagnostic routines.`
    },
    {
      type: 'input',
      text: 'show running-config | include cdp|lldp'
    },
    {
      type: 'output',
      text: `no cdp run\n` +
            `no lldp run\n` +
            `no cdp enable\n` +
            `no lldp transmit\n` +
            `no lldp receive\n` +
            `! [STATUS: PASSED - GAIL SCADA Section 15.3 Zero-Discovery Protocol Compliance]`
    }
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  if (!sshTerminalOpen || !device) return null;

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    const lower = trimmed.toLowerCase();
    let reply = '';

    if (lower === 'clear') {
      setHistory([]);
      setInputCmd('');
      return;
    } else if (lower.includes('cdp') || lower.includes('lldp')) {
      reply = `no cdp run\nno lldp run\nno cdp enable\nno lldp transmit\nno lldp receive\n! [Audit: Strictly Enforced Zero-CDP / Zero-LLDP for SCADA Security]`;
    } else if (lower.includes('eigrp')) {
      reply = `EIGRP-IPv4 Neighbors for AS(100)\n` +
              `H   Address          Interface   Hold  Uptime    SRTT   RTO  Q   Seq\n` +
              `0   10.240.100.1     Gi0/0/0       14  02:14:02    12   200  0   482\n` +
              `1   10.240.101.2     Gi0/0/2       11  02:14:02     8   200  0   291\n` +
              `! Topology Adjacency verified without neighbor discovery broadcast.`;
    } else if (lower.includes('mac') || lower.includes('forwarding')) {
      reply = `Mac Address Table\n` +
              `-------------------------------------------\n` +
              `Vlan    Mac Address       Type        Ports\n` +
              `----    -----------       --------    -----\n` +
              `  20    00:3a:9c:55:12:01 DYNAMIC     Gi0/0/1 (Single-Host Link)\n` +
              `  20    00:1d:9c:b1:33:aa DYNAMIC     Gi0/0/1 (Industrial PLC)\n` +
              `  20    00:80:f4:aa:22:91 DYNAMIC     Gi0/0/1 (FloBoss RTU)\n` +
              `Total Mac Addresses: 3 (Auto-correlated by Discovery Engine)`;
    } else if (lower.includes('interface') || lower.includes('ip int')) {
      reply = `Interface              IP-Address      OK? Method Status                Protocol\n` +
              `GigabitEthernet0/0/0   10.240.100.2    YES NVRAM  up                    up\n` +
              `GigabitEthernet0/0/1   10.240.20.1     YES NVRAM  up                    up\n` +
              `GigabitEthernet0/0/2   10.240.101.1    YES NVRAM  up                    up\n` +
              `Loopback0              10.240.20.254   YES NVRAM  up                    up`;
    } else if (lower.includes('arp')) {
      reply = `Protocol  Address          Age (min)  Hardware Addr   Type   Interface\n` +
              `Internet  10.240.20.2             4   003a.9c55.1201  ARPA   GigabitEthernet0/0/1\n` +
              `Internet  10.240.20.30            2   001d.9cb1.33aa  ARPA   GigabitEthernet0/0/1\n` +
              `Internet  10.240.20.40            1   0080.f4aa.2291  ARPA   GigabitEthernet0/0/1`;
    } else if (lower.includes('env') || lower.includes('temp')) {
      reply = `SYSTEM TEMPERATURE: 34.5 C (Normal operating range)\n` +
              `POWER SUPPLY 1: AC-OK (Primary Active)\n` +
              `POWER SUPPLY 2: AC-OK (Redundant Standby)\n` +
              `FAN TRAY: OK (3400 RPM - Continuous)`;
    } else if (lower.includes('ping')) {
      reply = `Sending 5, 100-byte ICMP Echos to 10.240.10.1, timeout is 2 seconds:\n` +
              `!!!!!\n` +
              `Success rate is 100 percent (5/5), round-trip min/avg/max = 2/3/5 ms`;
    } else if (lower.includes('flow')) {
      reply = `IP packet size distribution (24458 total packets):\n` +
              `   1-32   64   96  128  160  192  224  256  288  320  352  384  416  448  480\n` +
              `   .000 .842 .010 .000 .000 .000 .000 .000 .000 .000 .000 .000 .000 .000 .000\n` +
              `SrcIf          SrcIPaddress    DstIf          DstIPaddress    Pr SrcP DstP  Pkts\n` +
              `Gi0/0/1        10.240.20.2     Gi0/0/0        10.240.10.15    06 1024 01F6  1820\n` +
              `Gi0/0/0        10.240.10.15    Gi0/0/1        10.240.20.2     06 01F6 1024  1819\n` +
              `Gi0/0/1        10.240.20.30    Gi0/0/0        10.240.10.20    06 C001 01F6   940\n` +
              `Gi0/0/0        10.240.10.1     Gi0/0/2        10.240.101.2    58 0000 0000   140\n` +
              `! Active NetFlow v9 cache entries matching SCADA/Modbus pipeline traffic.`;
    } else if (lower.includes('help')) {
      reply = `Supported diagnostic commands:\n` +
              ` - show ip eigrp neighbors\n` +
              ` - show running-config | include cdp|lldp\n` +
              ` - show mac address-table\n` +
              ` - show ip flow top\n` +
              ` - show ip interface brief\n` +
              ` - show ip arp\n` +
              ` - show environment\n` +
              ` - ping 10.240.10.1\n` +
              ` - clear`;
    } else {
      reply = `% Unknown command or unsupported simulation syntax. Type 'help' for diagnostics.`;
    }

    setHistory(prev => [
      ...prev,
      { type: 'input', text: trimmed },
      { type: 'output', text: reply }
    ]);
    setInputCmd('');
  };

  const titleNode = (
    <div className="flex items-center gap-2">
      <Terminal className={`w-3.5 h-3.5 ${isLight ? 'text-blue-600' : 'text-emerald-400'}`} />
      <span className={`font-mono font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>SSH: {shortName}</span>
      <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>({mgmtIp})</span>
    </div>
  );

  return (
    <NetTraceWindow
      id="ssh-terminal"
      title={titleNode}
      isOpen={sshTerminalOpen}
      onClose={closeSshTerminal}
      initialX={window.innerWidth > 1000 ? Math.floor(window.innerWidth / 2 - 270) : 100}
      initialY={window.innerHeight - 380}
      initialWidth={560}
      initialHeight={330}
      zIndex={55}
    >
      {/* Session Tab Bar matching Osprey screenshot */}
      <div className={`flex items-center border-b px-2 pt-1 gap-1 ${
        isLight ? 'bg-slate-200/90 border-slate-300' : 'bg-[#070d18] border-[#1b2840]'
      }`}>
        <div className={`px-3 py-1 rounded-t text-xs font-mono flex items-center gap-2 border-t border-x ${
          isLight 
            ? 'bg-[#0b1424] border-slate-400 text-cyan-300 shadow-sm' 
            : 'bg-[#0b1424] border-[#1e2f4f] text-cyan-300'
        }`}>
          <span>{shortName}</span>
          <span className="text-slate-500 hover:text-white cursor-pointer text-[10px]">x</span>
        </div>
        <div className={`text-[10px] font-mono px-2 ${isLight ? 'text-slate-600 font-medium' : 'text-slate-500'}`}>
          AES-256 Encrypted Session
        </div>
      </div>

      {/* Terminal Screen Monospace */}
      <div className="flex-1 overflow-y-auto p-3 font-mono text-xs bg-[#080e18] text-slate-300 space-y-1.5 leading-relaxed selection:bg-cyan-500/30">
        {history.map((item, idx) => (
          <div key={idx} className="whitespace-pre-wrap">
            {item.type === 'input' ? (
              <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="text-cyan-400">{shortName}#</span>
                <span>{item.text}</span>
              </div>
            ) : (
              <div className="text-slate-300 pl-2 text-[11px] opacity-95">
                {item.text}
              </div>
            )}
          </div>
        ))}

        {/* Input prompt line */}
        <div className="flex items-center gap-1.5 pt-1 text-emerald-400">
          <span className="text-cyan-400 font-bold shrink-0">{shortName}#</span>
          <input
            type="text"
            value={inputCmd}
            onChange={(e) => setInputCmd(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCommand(inputCmd);
            }}
            placeholder="Type command or click quick action below..."
            className="flex-1 bg-transparent border-none outline-none text-emerald-300 font-mono text-xs"
            autoFocus
          />
        </div>
        <div ref={terminalEndRef} />
      </div>

      {/* Quick Command Chips matching real network engineer diagnostics */}
      <div className={`p-2 border-t flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono ${
        isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#0a1220] border-[#1b2840]'
      }`}>
        <span className={`uppercase font-bold shrink-0 ${isLight ? 'text-slate-600' : 'text-slate-500'}`}>Quick CLI:</span>
        <button
          onClick={() => handleCommand('show ip eigrp neighbors')}
          className={`px-2 py-1 rounded whitespace-nowrap border transition ${
            isLight
              ? 'bg-white hover:bg-slate-50 text-blue-700 border-slate-300 shadow-sm'
              : 'bg-[#13223d] hover:bg-[#1a3158] text-cyan-200 border-[#1e3b6d]'
          }`}
        >
          show ip eigrp
        </button>
        <button
          onClick={() => handleCommand('show running-config | include cdp|lldp')}
          className={`px-2 py-1 rounded whitespace-nowrap border transition ${
            isLight
              ? 'bg-white hover:bg-slate-50 text-rose-700 border-rose-300 shadow-sm'
              : 'bg-[#13223d] hover:bg-[#1a3158] text-rose-300 border-[#1e3b6d]'
          }`}
        >
          verify no-cdp
        </button>
        <button
          onClick={() => handleCommand('show ip flow top')}
          className={`px-2 py-1 rounded whitespace-nowrap border transition ${
            isLight
              ? 'bg-white hover:bg-slate-50 text-purple-700 border-purple-300 shadow-sm'
              : 'bg-[#13223d] hover:bg-[#1a3158] text-purple-300 border-[#1e3b6d]'
          }`}
        >
          show flow
        </button>
        <button
          onClick={() => handleCommand('show ip interface brief')}
          className={`px-2 py-1 rounded whitespace-nowrap border transition ${
            isLight
              ? 'bg-white hover:bg-slate-50 text-emerald-700 border-emerald-300 shadow-sm'
              : 'bg-[#13223d] hover:bg-[#1a3158] text-emerald-300 border-[#1e3b6d]'
          }`}
        >
          show ip int br
        </button>
        <button
          onClick={() => handleCommand('show mac address-table')}
          className={`px-2 py-1 rounded whitespace-nowrap border transition ${
            isLight
              ? 'bg-white hover:bg-slate-50 text-amber-800 border-amber-300 shadow-sm'
              : 'bg-[#13223d] hover:bg-[#1a3158] text-amber-300 border-[#1e3b6d]'
          }`}
        >
          show mac table
        </button>
        <button
          onClick={() => handleCommand('show environment')}
          className={`px-2 py-1 rounded whitespace-nowrap border transition ${
            isLight
              ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-sm'
              : 'bg-[#13223d] hover:bg-[#1a3158] text-slate-300 border-[#1e3b6d]'
          }`}
        >
          show env
        </button>
        <button
          onClick={() => handleCommand('clear')}
          className={`px-2 py-1 rounded whitespace-nowrap ml-auto transition ${
            isLight
              ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
          }`}
        >
          clear
        </button>
      </div>
    </NetTraceWindow>
  );
};
