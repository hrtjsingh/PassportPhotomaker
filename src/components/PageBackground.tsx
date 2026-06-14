export function PageBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
      {/* Base */}
      <div className="absolute inset-0 bg-[#f8f7ff] dark:bg-[#06060a]" />

      {/* Mesh orbs */}
      <div className="absolute -top-[20%] -left-[10%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] rounded-full bg-[#818cf8] opacity-[0.22] dark:opacity-[0.14] blur-[100px] animate-orb-1" />
      <div className="absolute top-[10%] -right-[15%] w-[50vw] h-[50vw] max-w-[650px] max-h-[650px] rounded-full bg-[#c084fc] opacity-[0.18] dark:opacity-[0.10] blur-[110px] animate-orb-2" />
      <div className="absolute bottom-[5%] left-[20%] w-[45vw] h-[45vw] max-w-[600px] max-h-[600px] rounded-full bg-[#67e8f9] opacity-[0.16] dark:opacity-[0.08] blur-[100px] animate-orb-3" />
      <div className="absolute -bottom-[15%] right-[10%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-[#a5b4fc] opacity-[0.20] dark:opacity-[0.12] blur-[90px] animate-orb-4" />

      {/* Center spotlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[60vh] max-w-[900px] rounded-full bg-white opacity-60 dark:opacity-0 blur-[120px]" />

      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.12]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgb(99 102 241 / 0.18) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 40%, black 20%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 40%, black 20%, transparent 75%)',
        }}
      />

      {/* Fine grid lines */}
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(rgb(99 102 241 / 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgb(99 102 241 / 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Noise grain */}
      <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04] bg-noise" />

      {/* Bottom fade — content legibility */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-[#f8f7ff] dark:from-[#06060a] to-transparent" />
    </div>
  );
}
