'use client';

import React, { useState, useEffect } from 'react';
import { X, Dices, RotateCcw, Check, Sparkles, User, Palette, Glasses, Smile, Shirt } from 'lucide-react';
import {
  AvatarOptions,
  SKIN_TONES,
  HAIR_COLORS,
  CLOTHING_COLORS,
  BG_COLORS,
  HAIR_STYLES,
  CLOTHING_STYLES,
  ACCESSORIES,
  EXPRESSIONS,
  getDefaultAvatarOptions,
  getRandomAvatarOptions,
  generateAvatarSvg,
  getAvatarDataUrl,
  parseAvatarOptions,
} from '@/lib/avatar';

interface AvatarBuilderProps {
  isOpen: boolean;
  initialAvatarUrl?: string | null;
  onSave: (dataUrl: string) => void;
  onClose: () => void;
}

type TabType = 'skin' | 'hair' | 'clothes' | 'accessories' | 'face' | 'background';

export const AvatarBuilder: React.FC<AvatarBuilderProps> = ({
  isOpen,
  initialAvatarUrl,
  onSave,
  onClose,
}) => {
  const [options, setOptions] = useState<AvatarOptions>(() => {
    return parseAvatarOptions(initialAvatarUrl) || getDefaultAvatarOptions();
  });

  const [activeTab, setActiveTab] = useState<TabType>('skin');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setOptions(parseAvatarOptions(initialAvatarUrl) || getDefaultAvatarOptions());
    }
  }, [isOpen, initialAvatarUrl]);

  if (!isOpen) return null;

  const currentSvg = generateAvatarSvg(options);

  const handleRandomize = () => {
    setOptions(getRandomAvatarOptions());
  };

  const handleReset = () => {
    setOptions(getDefaultAvatarOptions());
  };

  const handleSave = () => {
    setIsSaving(true);
    const dataUrl = getAvatarDataUrl(options);
    onSave(dataUrl);
    setTimeout(() => {
      setIsSaving(false);
      onClose();
    }, 200);
  };

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'skin', label: 'Skin', icon: User },
    { id: 'hair', label: 'Hair', icon: Sparkles },
    { id: 'clothes', label: 'Clothing', icon: Shirt },
    { id: 'accessories', label: 'Accessories', icon: Glasses },
    { id: 'face', label: 'Face', icon: Smile },
    { id: 'background', label: 'Backdrop', icon: Palette },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-purple-50/50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#635BFF] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-gray-900 leading-none">Custom Volunteer Avatar</h2>
              <p className="text-[11px] text-gray-500 font-medium mt-1">Design your top-half volunteer persona</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content: Split Preview + Controls */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 bg-purple-50/40 p-5 rounded-2xl border border-purple-100/80">
            {/* Live Preview Avatar */}
            <div className="relative w-36 h-36 rounded-full shadow-lg border-4 border-white overflow-hidden bg-white shrink-0 group">
              <div
                className="w-full h-full"
                dangerouslySetInnerHTML={{ __html: currentSvg }}
              />
            </div>

            {/* Preview Controls & Quick Actions */}
            <div className="flex-1 text-center sm:text-left space-y-3">
              <div>
                <h3 className="text-sm font-extrabold text-gray-900">Your Volunteer Look</h3>
                <p className="text-xs text-gray-500 font-medium">
                  This custom avatar appears on your certificates, rosters, and dashboard.
                </p>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  onClick={handleRandomize}
                  className="px-3.5 py-1.5 bg-white hover:bg-purple-50 text-[#635BFF] rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all border border-purple-200 shadow-2xs active:scale-95"
                >
                  <Dices className="w-3.5 h-3.5" /> Randomize
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3.5 py-1.5 bg-white hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-gray-200 shadow-2xs active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Default
                </button>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-gray-100">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shrink-0 ${
                    isActive
                      ? 'bg-[#635BFF] text-white shadow-xs'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Tab Panels */}
          <div className="min-h-[160px]">
            {/* Skin Tone Tab */}
            {activeTab === 'skin' && (
              <div className="space-y-3">
                <label className="block text-xs font-extrabold text-gray-900">Select Skin Tone</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {(Object.keys(SKIN_TONES) as AvatarOptions['skinTone'][]).map((key) => {
                    const item = SKIN_TONES[key];
                    const isSelected = options.skinTone === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setOptions((prev) => ({ ...prev, skinTone: key }))}
                        className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all ${
                          isSelected
                            ? 'border-[#635BFF] bg-purple-50/50 shadow-xs ring-2 ring-[#635BFF]/20'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div
                          className="w-9 h-9 rounded-full shadow-inner border border-black/10 flex items-center justify-center text-white"
                          style={{ backgroundColor: item.fill }}
                        >
                          {isSelected && <Check className="w-4 h-4 drop-shadow" />}
                        </div>
                        <span className="text-[11px] font-bold text-gray-700">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Hair Style & Color Tab */}
            {activeTab === 'hair' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-extrabold text-gray-900 mb-2">Hair Style</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {HAIR_STYLES.map((h) => {
                      const isSelected = options.hairStyle === h.id;
                      return (
                        <button
                          key={h.id}
                          type="button"
                          onClick={() => setOptions((prev) => ({ ...prev, hairStyle: h.id }))}
                          className={`p-3 rounded-xl border text-left font-bold text-xs transition-all flex items-center justify-between ${
                            isSelected
                              ? 'border-[#635BFF] bg-purple-50 text-[#635BFF] shadow-2xs ring-1 ring-[#635BFF]'
                              : 'border-gray-200 text-gray-700 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <span>{h.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#635BFF]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {options.hairStyle !== 'bald' && (
                  <div>
                    <label className="block text-xs font-extrabold text-gray-900 mb-2">Hair Color</label>
                    <div className="grid grid-cols-3 sm:grid-cols-7 gap-2.5">
                      {(Object.keys(HAIR_COLORS) as AvatarOptions['hairColor'][]).map((key) => {
                        const item = HAIR_COLORS[key];
                        const isSelected = options.hairColor === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setOptions((prev) => ({ ...prev, hairColor: key }))}
                            className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                              isSelected
                                ? 'border-[#635BFF] bg-purple-50 ring-1 ring-[#635BFF]'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            <div
                              className="w-7 h-7 rounded-full shadow-inner border border-black/15 flex items-center justify-center text-white"
                              style={{ backgroundColor: item.fill }}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 drop-shadow" />}
                            </div>
                            <span className="text-[10px] font-bold text-gray-600 truncate max-w-full">
                              {item.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Clothing Style & Color Tab */}
            {activeTab === 'clothes' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-extrabold text-gray-900 mb-2">Clothing Style</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {CLOTHING_STYLES.map((c) => {
                      const isSelected = options.clothingStyle === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setOptions((prev) => ({ ...prev, clothingStyle: c.id }))}
                          className={`p-3 rounded-xl border text-center font-bold text-xs transition-all ${
                            isSelected
                              ? 'border-[#635BFF] bg-purple-50 text-[#635BFF] shadow-2xs ring-1 ring-[#635BFF]'
                              : 'border-gray-200 text-gray-700 hover:border-gray-300 bg-white'
                          }`}
                        >
                          {c.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-900 mb-2">Clothing Color</label>
                  <div className="grid grid-cols-3 sm:grid-cols-7 gap-2.5">
                    {(Object.keys(CLOTHING_COLORS) as AvatarOptions['clothingColor'][]).map((key) => {
                      const item = CLOTHING_COLORS[key];
                      const isSelected = options.clothingColor === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setOptions((prev) => ({ ...prev, clothingColor: key }))}
                          className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                            isSelected
                              ? 'border-[#635BFF] bg-purple-50 ring-1 ring-[#635BFF]'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div
                            className="w-7 h-7 rounded-full shadow-inner border border-black/15 flex items-center justify-center text-white"
                            style={{ backgroundColor: item.fill }}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 drop-shadow" />}
                          </div>
                          <span className="text-[10px] font-bold text-gray-600 truncate max-w-full">
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Accessories Tab */}
            {activeTab === 'accessories' && (
              <div className="space-y-3">
                <label className="block text-xs font-extrabold text-gray-900">Accessories</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {ACCESSORIES.map((a) => {
                    const isSelected = options.accessory === a.id;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setOptions((prev) => ({ ...prev, accessory: a.id }))}
                        className={`p-3 rounded-xl border text-left font-bold text-xs transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-[#635BFF] bg-purple-50 text-[#635BFF] shadow-2xs ring-1 ring-[#635BFF]'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <span>{a.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#635BFF]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Facial Expression Tab */}
            {activeTab === 'face' && (
              <div className="space-y-3">
                <label className="block text-xs font-extrabold text-gray-900">Facial Expression</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {EXPRESSIONS.map((e) => {
                    const isSelected = options.expression === e.id;
                    return (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => setOptions((prev) => ({ ...prev, expression: e.id }))}
                        className={`p-3 rounded-xl border text-left font-bold text-xs transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-[#635BFF] bg-purple-50 text-[#635BFF] shadow-2xs ring-1 ring-[#635BFF]'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <span>{e.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#635BFF]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Background Color Tab */}
            {activeTab === 'background' && (
              <div className="space-y-3">
                <label className="block text-xs font-extrabold text-gray-900">Background Backdrop</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {(Object.keys(BG_COLORS) as AvatarOptions['backgroundColor'][]).map((key) => {
                    const item = BG_COLORS[key];
                    const isSelected = options.backgroundColor === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setOptions((prev) => ({ ...prev, backgroundColor: key }))}
                        className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all ${
                          isSelected
                            ? 'border-[#635BFF] bg-purple-50/50 shadow-xs ring-2 ring-[#635BFF]/20'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div
                          className="w-9 h-9 rounded-full shadow-inner border border-black/10 flex items-center justify-center text-gray-800"
                          style={{ backgroundColor: item.fill }}
                        >
                          {isSelected && <Check className="w-4 h-4 text-gray-800" />}
                        </div>
                        <span className="text-[11px] font-bold text-gray-700">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-200/60 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 bg-[#635BFF] hover:bg-[#5046E5] text-white text-xs font-extrabold rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" /> Save Avatar
          </button>
        </div>
      </div>
    </div>
  );
};
