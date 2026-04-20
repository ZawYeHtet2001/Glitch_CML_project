"use client";

import { ReactNode } from "react";

interface MachineViewportProps {
  label?: string;
  id?: string;
  ledColor?: "red" | "amber" | "green" | "teal";
  screws?: boolean;
  /** Full CRT treatment — scanlines + beam sweep + amber phosphor text. */
  crt?: boolean;
  /** Apply amber phosphor VT323 to content. Only used when crt is true. */
  phosphor?: boolean;
  /** Recessed dark metal cavity without CRT effects. Defaults to true when
   * crt is false — gives the "inside the machine" depth feel for media
   * like 3D viewers or images. Set false for a completely flat chamber. */
  chamber?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Bone-metal bezel wrapping a recessed content area. Three inner modes:
 *   - crt=true  (default)              : full CRT (scanlines + phosphor)
 *   - crt=false, chamber=true (default): recessed dark cavity, no FX
 *   - crt=false, chamber=false         : flat — just the bone bezel
 */
export default function MachineViewport({
  label,
  id,
  ledColor = "amber",
  screws = true,
  crt = true,
  phosphor = true,
  chamber = true,
  className,
  children,
}: MachineViewportProps) {
  let innerClass = "";
  if (crt) innerClass = "viewport-inner";
  else if (chamber) innerClass = "viewport-chamber";

  const phosphorStyle = phosphor && crt
    ? { fontFamily: "var(--font-matrix-stack)", color: "var(--amber-phosphor)" }
    : undefined;

  return (
    <div className={`machine-viewport ${className ?? ""}`}>
      {label && <div className="machine-viewport-label">{label}</div>}
      {(id || ledColor) && (
        <div className="machine-viewport-id">
          {id && <span>{id}</span>}
          <span className={`led-bezel led-${ledColor}`} />
        </div>
      )}
      {screws && (
        <>
          <span className="viewport-screw" style={{ top: 6, left: 6 }} />
          <span className="viewport-screw" style={{ top: 6, right: 6 }} />
          <span className="viewport-screw" style={{ bottom: 6, left: 6 }} />
          <span className="viewport-screw" style={{ bottom: 6, right: 6 }} />
        </>
      )}
      <div className={innerClass} style={phosphorStyle}>
        {children}
      </div>
    </div>
  );
}
