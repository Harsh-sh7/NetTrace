import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { Minus, Square, X, RotateCcw } from 'lucide-react';
import { useTopology } from '../../context/TopologyContext';

interface NetTraceWindowProps {
  id: string;
  title: string | ReactNode;
  initialX?: number;
  initialY?: number;
  initialWidth?: number;
  initialHeight?: number;
  minWidth?: number;
  minHeight?: number;
  zIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  onFocus?: () => void;
  headerRight?: ReactNode;
  children: ReactNode;
}

export const NetTraceWindow: React.FC<NetTraceWindowProps> = ({
  id,
  title,
  initialX = 40,
  initialY = 80,
  initialWidth = 380,
  initialHeight = 520,
  minWidth = 300,
  minHeight = 220,
  zIndex = 40,
  isOpen,
  onClose,
  onFocus,
  headerRight,
  children,
}) => {
  const { theme } = useTopology();
  const isLight = theme === 'light';

  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [prevBounds, setPrevBounds] = useState({ x: initialX, y: initialY, width: initialWidth, height: initialHeight });
  const [windowZ, setWindowZ] = useState(zIndex);

  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const windowPosStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setWindowZ(zIndex);
  }, [zIndex]);

  const bringToFront = () => {
    setWindowZ(prev => Math.max(prev, 60));
    if (onFocus) onFocus();
  };

  // Handle window drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    
    bringToFront();
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    windowPosStart.current = { ...pos };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = moveEvent.clientX - dragStart.current.x;
      const dy = moveEvent.clientY - dragStart.current.y;
      
      setPos({
        x: Math.max(10, Math.min(window.innerWidth - 100, windowPosStart.current.x + dx)),
        y: Math.max(30, Math.min(window.innerHeight - 60, windowPosStart.current.y + dy)),
      });
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const toggleMaximize = (e: React.MouseEvent) => {
    e.stopPropagation();
    bringToFront();
    if (isMaximized) {
      setPos({ x: prevBounds.x, y: prevBounds.y });
      setSize({ width: prevBounds.width, height: prevBounds.height });
      setIsMaximized(false);
    } else {
      setPrevBounds({ x: pos.x, y: pos.y, width: size.width, height: size.height });
      setPos({ x: 16, y: 48 });
      setSize({
        width: window.innerWidth - 32,
        height: window.innerHeight - 100,
      });
      setIsMaximized(true);
      setIsMinimized(false);
    }
  };

  const toggleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    bringToFront();
    setIsMinimized(prev => !prev);
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={bringToFront}
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
        width: isMaximized ? size.width : size.width,
        height: isMinimized ? 'auto' : (isMaximized ? size.height : size.height),
        zIndex: windowZ,
      }}
      className={`fixed top-0 left-0 backdrop-blur-md rounded-md flex flex-col overflow-hidden select-none font-sans transition-[width,height] duration-150 ${
        isLight
          ? 'bg-white/95 border border-slate-300 shadow-[0_12px_36px_rgba(0,0,0,0.18)] text-slate-900'
          : 'bg-[#0b1322]/95 border border-[#1e2d4a] shadow-[0_12px_40px_rgba(0,0,0,0.85)] text-slate-100'
      } ${isDragging.current ? 'cursor-grabbing opacity-90' : ''}`}
    >
      {/* Title Bar */}
      <div
        onMouseDown={handleMouseDown}
        className={`h-8 px-3 flex items-center justify-between cursor-grab select-none shrink-0 ${
          isLight
            ? 'bg-slate-100 border-b border-slate-200 text-slate-800'
            : 'bg-[#0d172a] border-b border-[#1b2842] text-slate-200'
        }`}
      >
        <div className={`flex items-center gap-2 overflow-hidden text-xs font-semibold ${
          isLight ? 'text-slate-800' : 'text-slate-200'
        }`}>
          {title}
        </div>

        {/* Header Right and Window Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {headerRight}

          <div className={`flex items-center gap-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            {/* Minimize */}
            <button
              onClick={toggleMinimize}
              title={isMinimized ? "Expand" : "Minimize"}
              className={`p-1 rounded transition ${isLight ? 'hover:text-slate-900 hover:bg-slate-200' : 'hover:text-white hover:bg-slate-800'}`}
            >
              <Minus className="w-3 h-3" />
            </button>

            {/* Maximize */}
            <button
              onClick={toggleMaximize}
              title={isMaximized ? "Restore" : "Maximize"}
              className={`p-1 rounded transition ${isLight ? 'hover:text-slate-900 hover:bg-slate-200' : 'hover:text-white hover:bg-slate-800'}`}
            >
              {isMaximized ? <RotateCcw className="w-3 h-3" /> : <Square className="w-3 h-3" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              title="Close"
              className="p-1 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/60 rounded transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Window Body Content */}
      {!isMinimized && (
        <div className={`flex-1 overflow-hidden flex flex-col ${isLight ? 'bg-slate-50/90 text-slate-900' : 'bg-[#09101d] text-slate-100'}`}>
          {children}
        </div>
      )}
    </div>
  );
};

// Aliased export for backwards compatibility
export const OspreyWindow = NetTraceWindow;
