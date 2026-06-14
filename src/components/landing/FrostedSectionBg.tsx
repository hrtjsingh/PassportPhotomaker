import React from 'react';

interface FrostedSectionBgProps {
  /** Subtle accent glow orbs */
  glow?: boolean;
  /** Soft mesh tint on top of the frost layer */
  mesh?: boolean;
  meshOpacity?: string;
}

export const FrostedSectionBg = ({ glow = true, mesh = false, meshOpacity = 'opacity-50' }: FrostedSectionBgProps) => (
  <>
    <div className="absolute inset-0 bg-snapid-bg" aria-hidden="true" />
    {mesh && <div className={`absolute inset-0 mesh-gradient ${meshOpacity}`} aria-hidden="true" />}
    <div className="absolute inset-0 frosted-section-glass" aria-hidden="true" />
    {glow && (
      <>
        <div
          className="frosted-section-glow top-0 left-[15%] w-[28rem] h-[28rem] bg-white/[0.04]"
          aria-hidden="true"
        />
        <div
          className="frosted-section-glow bottom-0 right-[15%] w-[32rem] h-[32rem] bg-brand-500/[0.06]"
          aria-hidden="true"
        />
      </>
    )}
  </>
);
