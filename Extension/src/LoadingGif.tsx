export function LoadingGif({ size = 72 }) {
  const outer = { r: 34, stroke: 4, dash: 0.7, duration: "1.6s" };
  const inner = { r: 22, stroke: 3, dash: 0.5, duration: "1.1s" };

  const arc = (ring:any) => 2 * Math.PI * ring.r;

  return (
    <>
      <style>{`
        @keyframes spinCW  { to { transform: rotate(360deg);  } }
        @keyframes spinCCW { to { transform: rotate(-360deg); } }
        @keyframes glow {
          0%, 100% { opacity: 0.5; filter: drop-shadow(0 0 2px #fff); }
          50%       { opacity: 1;  filter: drop-shadow(0 0 8px #fff); }
        }
      `}</style>

      <svg width={size} height={size} viewBox="0 0 100 100">
        <defs>
          <linearGradient id="g1" gradientUnits="userSpaceOnUse" x1="16" y1="16" x2="84" y2="84">
            <stop offset="0%"   stopColor="#ffffff" stopOpacity="0" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="g2" gradientUnits="userSpaceOnUse" x1="28" y1="28" x2="72" y2="72">
            <stop offset="0%"   stopColor="#aaaaaa" stopOpacity="0" />
            <stop offset="100%" stopColor="#aaaaaa" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Outer track */}
        <circle cx="50" cy="50" r={outer.r} fill="none" stroke="#ffffff10" strokeWidth={outer.stroke} />
        {/* Outer arc */}
        <circle
          cx="50" cy="50" r={outer.r}
          fill="none"
          stroke="url(#g1)"
          strokeWidth={outer.stroke}
          strokeLinecap="round"
          strokeDasharray={arc(outer)}
          strokeDashoffset={arc(outer) * (1 - outer.dash)}
          style={{
            transformOrigin: "50px 50px",
            animation: `spinCW ${outer.duration} linear infinite, glow 2s ease-in-out infinite`,
          }}
        />

        {/* Inner track */}
        <circle cx="50" cy="50" r={inner.r} fill="none" stroke="#ffffff08" strokeWidth={inner.stroke} />
        {/* Inner arc */}
        <circle
          cx="50" cy="50" r={inner.r}
          fill="none"
          stroke="url(#g2)"
          strokeWidth={inner.stroke}
          strokeLinecap="round"
          strokeDasharray={arc(inner)}
          strokeDashoffset={arc(inner) * (1 - inner.dash)}
          style={{
            transformOrigin: "50px 50px",
            animation: `spinCCW ${inner.duration} linear infinite, glow 2s ease-in-out 0.4s infinite`,
          }}
        />
      </svg>
    </>
  );
}
