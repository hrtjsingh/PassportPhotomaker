import { THEME } from '../config/theme';

export function PageBackground() {
  const { colors } = THEME;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
      <div className="absolute inset-0 bg-snapid-bg" />

      {/* Ink wash orbs — ai, aka, kinpaku */}
      <div
        className="absolute -top-[20%] -left-[10%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] rounded-full opacity-[0.14] blur-[100px] animate-orb-1"
        style={{ backgroundColor: colors.indigo }}
      />
      <div
        className="absolute top-[10%] -right-[15%] w-[50vw] h-[50vw] max-w-[650px] max-h-[650px] rounded-full opacity-[0.1] blur-[110px] animate-orb-2"
        style={{ backgroundColor: colors.violet }}
      />
      <div
        className="absolute bottom-[5%] left-[20%] w-[45vw] h-[45vw] max-w-[600px] max-h-[600px] rounded-full opacity-[0.08] blur-[100px] animate-orb-3"
        style={{ backgroundColor: colors.gold }}
      />
      <div
        className="absolute -bottom-[15%] right-[10%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full opacity-[0.09] blur-[90px] animate-orb-4"
        style={{ backgroundColor: colors.sakura }}
      />

      {/* Asanoha pattern */}
      <div className="absolute inset-0 pattern-asanoha opacity-60" />

      {/* Fine washi lines */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(rgb(232 220 200 / 0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgb(232 220 200 / 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '72px 72px',
        }}
      />

      <div className="absolute inset-0 opacity-[0.04] bg-noise" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-snapid-bg to-transparent" />
    </div>
  );
}
