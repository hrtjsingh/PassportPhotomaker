import React from 'react';

interface FrostedSectionBgProps {
  glow?: boolean;
  mesh?: boolean;
  meshOpacity?: string;
}

export const FrostedSectionBg = ({ glow = true, mesh = false, meshOpacity = 'opacity-50' }: FrostedSectionBgProps) => (
  <>
    <div className="absolute inset-0 bg-snapid-bg" aria-hidden="true" />
    {mesh && <div className={`absolute inset-0 mesh-gradient ${meshOpacity}`} aria-hidden="true" />}
    <div className="absolute inset-0 frosted-section-glass" aria-hidden="true" />
    <div className="absolute inset-0 pattern-asanoha opacity-30" aria-hidden="true" />
    {glow && (
      <>
        <div
          className="frosted-section-glow top-0 left-[10%] w-[26rem] h-[26rem] bg-brand-700/[0.08]"
          aria-hidden="true"
        />
        <div
          className="frosted-section-glow bottom-0 right-[10%] w-[30rem] h-[30rem] bg-brand-500/[0.06]"
          aria-hidden="true"
        />
        <div
          className="frosted-section-glow top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[20rem] h-[20rem] bg-brand-300/[0.04]"
          aria-hidden="true"
        />
      </>
    )}
  </>
);
