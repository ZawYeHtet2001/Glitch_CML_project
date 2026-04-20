"use client";

import { Suspense, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  Center,
  Bounds,
  Environment,
  Grid,
  GizmoHelper,
  GizmoViewport,
} from "@react-three/drei";
import * as THREE from "three";
import { OBJExporter, STLExporter } from "three-stdlib";

type LightingMode = "studio" | "moody";

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

interface Model3DViewerProps {
  glbUrl: string;
  artifactName?: string;
  subjectId?: string;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function Model3DViewer({
  glbUrl,
  artifactName,
  subjectId,
}: Model3DViewerProps) {
  const sceneRef = useRef<THREE.Group>(null);
  const [lighting, setLighting] = useState<LightingMode>("studio");
  // Bump this key whenever the WebGL context is lost so the entire Canvas
  // (and its GL context) gets torn down and remounted cleanly.
  const [canvasKey, setCanvasKey] = useState(0);
  const slugged = artifactName ? slugify(artifactName) : "";
  const baseName =
    slugged ||
    (subjectId ? `memory-artifact-${subjectId}` : "memory-artifact");

  const downloadGLB = async () => {
    const res = await fetch(glbUrl);
    const blob = await res.blob();
    triggerDownload(blob, `${baseName}.glb`);
  };

  const exportOBJ = () => {
    if (!sceneRef.current) return;
    const exporter = new OBJExporter();
    const data = exporter.parse(sceneRef.current);
    triggerDownload(new Blob([data], { type: "text/plain" }), `${baseName}.obj`);
  };

  const exportSTL = () => {
    if (!sceneRef.current) return;
    const exporter = new STLExporter();
    const data = exporter.parse(sceneRef.current, { binary: true });
    triggerDownload(
      new Blob([data as unknown as ArrayBuffer], { type: "application/octet-stream" }),
      `${baseName}.stl`
    );
  };

  const buttonStyle: React.CSSProperties = {
    flex: 1,
    padding: "10px 14px",
    background: "transparent",
    border: "1px solid var(--muted-strong)",
    color: "var(--muted-strong)",
    fontFamily: "var(--font-mono-stack)",
    fontSize: 11,
    letterSpacing: "0.2em",
    cursor: "pointer",
    transition: "all 0.2s ease",
  };

  return (
    <div>
      <div
        style={{
          height: 500,
          border: "1px solid var(--border)",
          background: "var(--card)",
        }}
      >
        <Canvas
          key={canvasKey}
          camera={{ position: [0, 0, 3], fov: 45 }}
          dpr={[1, 1.5]}
          gl={{
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: lighting === "studio" ? 1.1 : 1.0,
            powerPreference: "high-performance",
            failIfMajorPerformanceCaveat: false,
          }}
          onCreated={({ gl }) => {
            const canvas = gl.domElement;
            canvas.addEventListener(
              "webglcontextlost",
              (e) => {
                e.preventDefault();
                // eslint-disable-next-line no-console
                console.warn("WebGL context lost — remounting Canvas");
                setTimeout(() => setCanvasKey((k) => k + 1), 300);
              },
              false
            );
          }}
        >
          <color
            attach="background"
            args={[lighting === "studio" ? "#1a1a1a" : "#080808"]}
          />
          {lighting === "studio" ? (
            <>
              <ambientLight intensity={0.9} />
              <directionalLight position={[5, 5, 5]} intensity={1.4} />
              <directionalLight position={[-5, 3, -5]} intensity={0.8} />
              <directionalLight position={[0, -5, 3]} intensity={0.5} />
              <Environment preset="warehouse" />
            </>
          ) : (
            <>
              <ambientLight intensity={0.35} />
              <directionalLight position={[6, 4, 5]} intensity={1.5} />
              <directionalLight position={[-6, -2, -3]} intensity={0.3} />
              <Environment preset="city" />
            </>
          )}
          <Suspense fallback={null}>
            <Bounds fit clip observe margin={1.3}>
              <group ref={sceneRef}>
                <Center>
                  <Model url={glbUrl} />
                </Center>
              </group>
            </Bounds>
          </Suspense>
          {/* Ground grid — plinth reference */}
          <Grid
            position={[0, -1.2, 0]}
            args={[20, 20]}
            cellSize={0.25}
            cellThickness={0.6}
            cellColor="#2a2a2a"
            sectionSize={1}
            sectionThickness={1.1}
            sectionColor={lighting === "studio" ? "#3a3a3a" : "#4a3820"}
            fadeDistance={14}
            fadeStrength={1.2}
            infiniteGrid
          />
          {/* Axis gizmo — bottom-left */}
          <GizmoHelper alignment="bottom-left" margin={[56, 56]}>
            <GizmoViewport
              axisColors={["#e8b84a", "#9a9a9a", "#ededed"]}
              labelColor="#0a0a0a"
            />
          </GizmoHelper>
          <OrbitControls
            makeDefault
            enablePan
            enableZoom
            enableRotate
            minDistance={0.5}
            maxDistance={20}
          />
        </Canvas>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 8,
        }}
      >
        <p
          style={{
            fontSize: 10,
            color: "var(--muted)",
            letterSpacing: "0.15em",
            fontFamily: "var(--font-mono-stack)",
          }}
        >
          DRAG TO ROTATE · SCROLL TO ZOOM · RIGHT-CLICK DRAG TO PAN
        </p>
        <div style={{ display: "flex", gap: 4 }}>
          {(["studio", "moody"] as LightingMode[]).map((mode) => {
            const active = lighting === mode;
            return (
              <button
                key={mode}
                onClick={() => setLighting(mode)}
                style={{
                  padding: "4px 10px",
                  background: active ? "var(--accent)" : "transparent",
                  border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                  color: active ? "var(--background)" : "var(--muted)",
                  fontFamily: "var(--font-mono-stack)",
                  fontSize: 9,
                  letterSpacing: "0.2em",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {mode.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button
          onClick={downloadGLB}
          style={{ ...buttonStyle, borderColor: "var(--accent)", color: "var(--accent)" }}
        >
          DOWNLOAD .GLB
        </button>
        <button onClick={exportOBJ} style={buttonStyle}>
          EXPORT .OBJ
        </button>
        <button onClick={exportSTL} style={buttonStyle}>
          EXPORT .STL
        </button>
      </div>
      <p
        style={{
          fontSize: 9,
          color: "var(--muted)",
          letterSpacing: "0.1em",
          marginTop: 6,
          fontFamily: "var(--font-mono-stack)",
        }}
      >
        GLB — WEB/AR · OBJ — 3D SOFTWARE · STL — 3D PRINTING
      </p>
    </div>
  );
}
