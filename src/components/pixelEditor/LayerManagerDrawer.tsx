import React from 'react';
import { 
  X, Eye, EyeOff, Lock, Unlock, GripVertical, 
  Trash2, Copy, ArrowUp, ArrowDown, Type, Image as ImageIcon, Shapes, Sticker as StickerIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TemplateElement } from '../admin/TemplateManagement';

interface LayerManagerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  layers: TemplateElement[];
  activeLayerId: string | null;
  onSelectLayer: (id: string) => void;
  onUpdateLayer: (id: string, updates: Partial<TemplateElement>) => void;
  onDeleteLayer: (id: string) => void;
  onDuplicateLayer: (id: string) => void;
  onMoveLayer: (id: string, direction: 'up' | 'down') => void;
}

export const LayerManagerDrawer: React.FC<LayerManagerDrawerProps> = ({
  isOpen,
  onClose,
  layers,
  activeLayerId,
  onSelectLayer,
  onUpdateLayer,
  onDeleteLayer,
  onDuplicateLayer,
  onMoveLayer
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={onClose} 
          className="absolute inset-0 bg-black/50" 
        />

        <motion.div 
          initial={{ x: '-100%' }} 
          animate={{ x: 0 }} 
          exit={{ x: '-100%' }} 
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-80 max-w-[85vw] bg-[#0d0d0d] h-full p-4 border-r border-white/10 z-10 flex flex-col shadow-2xl relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
            <span className="text-xs font-black uppercase tracking-widest text-blue-400">
              Layers ({layers.length})
            </span>
            <button 
              onClick={onClose}
              className="p-1 rounded-full text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Layer List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 no-scrollbar">
            {layers.slice().reverse().map((layer, idx) => {
              const isActive = activeLayerId === layer.id;
              return (
                <div 
                  key={`layer-${layer.id}`} 
                  onClick={() => onSelectLayer(layer.id)}
                  className={`p-3 rounded-2xl border transition-all flex flex-col gap-2 cursor-pointer ${
                    isActive 
                      ? 'bg-blue-600/20 border-blue-500 shadow-md ring-1 ring-blue-500' 
                      : 'bg-white/5 border-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center text-white/70 shrink-0">
                      {layer.type === 'text' && <Type className="w-3.5 h-3.5 text-blue-400" />}
                      {layer.type === 'image' && <ImageIcon className="w-3.5 h-3.5 text-pink-400" />}
                      {layer.type === 'shape' && <Shapes className="w-3.5 h-3.5 text-emerald-400" />}
                      {layer.type === 'sticker' && <StickerIcon className="w-3.5 h-3.5 text-amber-400" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        {layer.type === 'text' ? (layer.content || 'Text Layer') : `${layer.type.toUpperCase()} Element`}
                      </p>
                      <span className="text-[9px] text-white/40 block">
                        z: {layer.zIndex} • {layer.width}x{layer.height}
                      </span>
                    </div>

                    {/* Quick Toggles */}
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateLayer(layer.id, { isHidden: !layer.isHidden });
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${layer.isHidden ? 'text-red-400 bg-red-500/10' : 'text-white/60 hover:text-white'}`}
                      >
                        {layer.isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>

                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateLayer(layer.id, { isLocked: !layer.isLocked });
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${layer.isLocked ? 'text-amber-400 bg-amber-500/10' : 'text-white/60 hover:text-white'}`}
                      >
                        {layer.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Actions when Active */}
                  {isActive && (
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMoveLayer(layer.id, 'up');
                          }}
                          title="Move Up"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-[10px] flex items-center gap-1"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMoveLayer(layer.id, 'down');
                          }}
                          title="Move Down"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-[10px] flex items-center gap-1"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicateLayer(layer.id);
                          }}
                          title="Duplicate"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-blue-400 text-[10px] flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteLayer(layer.id);
                          }}
                          title="Delete"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-red-400 text-[10px] flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {layers.length === 0 && (
              <div className="text-center py-8 text-white/30 text-xs">
                কোনো লেয়ার নেই
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
