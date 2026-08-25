'use client';

import React, { useRef, useEffect } from 'react';

export interface AppleWheelOption {
  label: string;
  value: string | number;
}

interface AppleWheelPickerProps {
  options: AppleWheelOption[];
  value: string | number;
  onChange: (val: any) => void;
  label?: string;
  className?: string;
}

export const AppleWheelPicker: React.FC<AppleWheelPickerProps> = ({
  options,
  value,
  onChange,
  label,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemHeight = 40; // 40px per item height

  // Scroll to selected item on initial mount or value change
  useEffect(() => {
    if (!containerRef.current) return;
    const index = options.findIndex((o) => o.value.toString() === value.toString());
    if (index >= 0) {
      containerRef.current.scrollTop = index * itemHeight;
    }
  }, [value, options]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const index = Math.round(scrollTop / itemHeight);
    if (options[index] && options[index].value.toString() !== value.toString()) {
      onChange(options[index].value);
    }
  };

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {label && (
        <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1.5">
          {label}
        </span>
      )}
      <div className="relative w-full h-[160px] bg-slate-50/90 rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
        {/* Apple Center Highlight Band (Behind text, high contrast border) */}
        <div className="absolute inset-x-1.5 top-1/2 -translate-y-1/2 h-[40px] bg-[#635BFF]/10 border-2 border-[#635BFF] rounded-xl pointer-events-none z-0 shadow-xs" />

        {/* Top/Bottom Subtle Perspective Fades */}
        <div className="absolute inset-x-0 top-0 h-[50px] bg-gradient-to-b from-slate-50 via-slate-50/50 to-transparent z-20 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-[50px] bg-gradient-to-t from-slate-50 via-slate-50/50 to-transparent z-20 pointer-events-none" />

        {/* Scroll Container (Above highlight band, z-10) */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="relative z-10 h-full w-full overflow-y-auto snap-y snap-mandatory scrollbar-none py-[60px]"
          style={{ scrollSnapType: 'y mandatory', scrollbarWidth: 'none' }}
        >
          {options.map((opt) => {
            const isSelected = opt.value.toString() === value.toString();
            return (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  const index = options.findIndex((o) => o.value === opt.value);
                  if (containerRef.current && index >= 0) {
                    containerRef.current.scrollTo({ top: index * itemHeight, behavior: 'smooth' });
                  }
                }}
                className={`h-[40px] flex items-center justify-center snap-center cursor-pointer transition-all duration-150 px-1 ${
                  isSelected
                    ? 'font-black text-[#635BFF] text-sm scale-110 drop-shadow-2xs'
                    : 'font-bold text-gray-500 text-xs hover:text-gray-900'
                }`}
              >
                {opt.label}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
