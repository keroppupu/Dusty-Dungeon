
import React from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Menu } from 'lucide-react';

interface VirtualPadProps {
  onMove: (dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => void;
  onMenu: () => void;
}

const VirtualPad: React.FC<VirtualPadProps> = ({ onMove, onMenu }) => {
  return (
    <div className="absolute bottom-8 left-0 right-0 flex justify-between px-8 pointer-events-none md:hidden">
      <div className="grid grid-cols-3 gap-2 pointer-events-auto">
        <div />
        <button onClick={() => onMove('UP')} className="p-4 bg-white/20 rounded-full backdrop-blur-sm active:bg-white/40">
          <ChevronUp className="w-8 h-8 text-white" />
        </button>
        <div />
        <button onClick={() => onMove('LEFT')} className="p-4 bg-white/20 rounded-full backdrop-blur-sm active:bg-white/40">
          <ChevronLeft className="w-8 h-8 text-white" />
        </button>
        <button onClick={() => onMove('DOWN')} className="p-4 bg-white/20 rounded-full backdrop-blur-sm active:bg-white/40">
          <ChevronDown className="w-8 h-8 text-white" />
        </button>
        <button onClick={() => onMove('RIGHT')} className="p-4 bg-white/20 rounded-full backdrop-blur-sm active:bg-white/40">
          <ChevronRight className="w-8 h-8 text-white" />
        </button>
      </div>
      
      <div className="flex items-end pointer-events-auto">
        <button onClick={onMenu} className="p-6 bg-[#E98074] rounded-full shadow-lg active:scale-95 text-white">
          <Menu className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};

export default VirtualPad;
