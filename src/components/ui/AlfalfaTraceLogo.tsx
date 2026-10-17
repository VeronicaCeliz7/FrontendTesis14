import { useId } from "react";

type AlfalfaTraceLogoProps = {
  /** Tamaño del ícono en px (alto y ancho). */
  size?: number;
  /** Muestra el nombre "AlfalfaTrace" al lado del ícono. */
  showText?: boolean;
  /** "luxe": esmeralda con hoja blanca y brillo. "mono": solo la hoja con currentColor. */
  variant?: "luxe" | "mono";
  /** Activa las animaciones (entrada, vaivén, destello, brillo). */
  animated?: boolean;
  className?: string;
  title?: string;
};

// Un foliolo apuntando hacia arriba, con la base en (0,0).
// La alfalfa es trifoliada: tres foliolos que salen del mismo punto.
const LEAFLET =
  "M0 0 C -6 -3 -9 -10 -8 -17 C -7.5 -20.5 -5 -23 -3.5 -24 L -2.5 -25.5 L -1.2 -24.2 L 0 -26 L 1.2 -24.2 L 2.5 -25.5 L 3.5 -24 C 5 -23 7.5 -20.5 8 -17 C 9 -10 6 -3 0 0 Z";
const LEAFLET_HALF =
  "M0 0 C 6 -3 9 -10 8 -17 C 7.5 -20.5 5 -23 3.5 -24 L 2.5 -25.5 L 1.2 -24.2 L 0 -26 Z"; // mitad derecha, para dar volumen
// Nervadura central + nervaduras laterales, como en la hoja real
const MIDRIB = "M0 -3 L0 -22 M0 -8 L-4 -13 M0 -8 L4 -13 M0 -13 L-4.5 -18 M0 -13 L4.5 -18";

export default function AlfalfaTraceLogo({
  size = 56,
  showText = false,
  variant = "luxe",
  animated = true,
  className,
  title = "AlfalfaTrace",
}: AlfalfaTraceLogoProps) {
  const uid = "at" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const luxe = variant === "luxe";

  const leafFill = luxe ? `url(#${uid}-white)` : "currentColor";
  const vein = luxe ? "#064e3b" : "transparent";

  const css = `
    .${uid} { display: inline-flex; align-items: center; gap: ${size * 0.28}px; }
    .${uid} svg { overflow: visible; transition: transform .5s cubic-bezier(.2,.8,.2,1); }
    ${luxe ? `.${uid} svg { filter: drop-shadow(0 8px 16px rgba(6,78,59,.45)); }` : ""}
    .${uid}:hover svg { transform: scale(1.07) rotate(-3deg); }

    .${uid} .text { font-family: "Playfair Display", "Cormorant Garamond", Georgia, serif;
      font-size: ${size * 0.52}px; font-weight: 600; letter-spacing: .01em; line-height: 1; }
    .${uid} .text b { font-weight: 700; background: linear-gradient(100deg,#34d399,#059669 55%,#047857);
      -webkit-background-clip: text; background-clip: text; color: transparent; }

    ${
      animated
        ? `
    /* Entrada: el tallo se dibuja y los foliolos brotan uno tras otro */
    .${uid} .stem { stroke-dasharray: 16; stroke-dashoffset: 16;
      animation: ${uid}-draw .6s ease-out .1s forwards; }
    .${uid} .grow { animation: ${uid}-grow .9s cubic-bezier(.34,1.56,.64,1) both; }
    .${uid} .g-center { animation-delay: .55s; }
    .${uid} .g-left   { animation-delay: .8s; }
    .${uid} .g-right  { animation-delay: 1s; }

    /* Vaivén suave, como brisa en el alfalfar */
    .${uid} .sway { animation: ${uid}-sway 5s ease-in-out 1.8s infinite alternate; }

    /* Brillo de fondo que respira */
    .${uid} .glow { transform-origin: 32px 28px; animation: ${uid}-pulse 4s ease-in-out infinite; }

    /* Destello que cruza el ícono cada tanto */
    .${uid} .shine { animation: ${uid}-sweep 6s ease-in-out 2s infinite; }

    @keyframes ${uid}-draw   { to { stroke-dashoffset: 0; } }
    @keyframes ${uid}-grow   { 0% { transform: scale(0); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
    @keyframes ${uid}-sway   { from { transform: rotate(-2.5deg); } to { transform: rotate(2.5deg); } }
    @keyframes ${uid}-pulse  { 0%,100% { opacity: .35; transform: scale(.92); } 50% { opacity: .75; transform: scale(1.08); } }
    @keyframes ${uid}-sweep  { 0% { transform: translateX(-40px); } 28%,100% { transform: translateX(110px); } }

    @media (prefers-reduced-motion: reduce) {
      .${uid} *, .${uid} svg { animation: none !important; transition: none !important; }
      .${uid} .stem { stroke-dashoffset: 0; }
    }`
        : ""
    }
  `;

  return (
    <span className={`${uid} ${className ?? ""}`}>
      <style>{css}</style>

      <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label={title} xmlns="http://www.w3.org/2000/svg">
        <title>{title}</title>

        <defs>
          {/* Esmeralda profundo */}
          <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0f7a50" />
            <stop offset="55%" stopColor="#064e3b" />
            <stop offset="100%" stopColor="#022c22" />
          </linearGradient>
          {/* Blanco perlado */}
          <linearGradient id={`${uid}-white`} x1="0" y1="-26" x2="0" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#dcf1e6" />
          </linearGradient>
          <linearGradient id={`${uid}-rim`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity=".85" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity=".15" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity=".6" />
          </linearGradient>
          <radialGradient id={`${uid}-glow`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#d1fae5" stopOpacity=".9" />
            <stop offset="100%" stopColor="#d1fae5" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${uid}-gloss`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity=".28" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${uid}-shine`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fff" stopOpacity="0" />
            <stop offset="50%" stopColor="#fff" stopOpacity=".5" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <clipPath id={`${uid}-clip`}>
            <rect width="64" height="64" rx="16" />
          </clipPath>
        </defs>

        {luxe && (
          <g clipPath={`url(#${uid}-clip)`}>
            <rect width="64" height="64" fill={`url(#${uid}-bg)`} />
            {/* brillo detrás de la hoja */}
            <circle className="glow" cx="32" cy="28" r="26" fill={`url(#${uid}-glow)`} opacity=".45" />
            {/* reflejo superior tipo vidrio */}
            <ellipse cx="26" cy="6" rx="36" ry="24" fill={`url(#${uid}-gloss)`} />
            {/* destello que cruza */}
            <g transform="skewX(-20)">
              <rect className="shine" x="0" y="-4" width="14" height="72" fill={`url(#${uid}-shine)`} />
            </g>
          </g>
        )}
        {luxe && (
          <rect x=".75" y=".75" width="62.5" height="62.5" rx="15.25" fill="none" stroke={`url(#${uid}-rim)`} strokeWidth="1.5" />
        )}

        {/* Hoja: base en (32,38) */}
        <g transform="translate(32 38)">
          <g className="sway">
            <path className="stem" d="M0 0 L0 14" stroke={luxe ? "#f0fdf6" : "currentColor"} strokeWidth="3" strokeLinecap="round" fill="none" />

            {/* Foliolo izquierdo */}
            <g transform="rotate(-52) scale(.85)">
              <g className="grow g-left">
                <path d={LEAFLET} fill={leafFill} />
                {luxe && <path d={LEAFLET_HALF} fill="#7cc7a3" opacity=".35" />}
                <path d={MIDRIB} stroke={vein} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" opacity=".55" fill="none" />
              </g>
            </g>

            {/* Foliolo derecho */}
            <g transform="rotate(52) scale(.85)">
              <g className="grow g-right">
                <path d={LEAFLET} fill={leafFill} />
                {luxe && <path d={LEAFLET_HALF} fill="#7cc7a3" opacity=".35" />}
                <path d={MIDRIB} stroke={vein} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" opacity=".55" fill="none" />
              </g>
            </g>

            {/* Foliolo central */}
            <g className="grow g-center">
              <path d={LEAFLET} fill={leafFill} />
              {luxe && <path d={LEAFLET_HALF} fill="#7cc7a3" opacity=".35" />}
              <path d={MIDRIB} stroke={vein} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" opacity=".55" fill="none" />
            </g>
          </g>
        </g>

      </svg>

      {showText && (
        <span className="text">
          Alfa<b>Trace</b>
        </span>
      )}
    </span>
  );
}
