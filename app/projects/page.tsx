"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

/* ─── Sprite-sheet text ─── */
const SPRITE_SHEETS = [
  { src: "/tex1_512x32_b9315d7550dc913a_0.png", startCode: 51  },
  { src: "/tex1_512x32_26c073ce7aadf652_0.png",  startCode: 70  },
  { src: "/tex1_512x32_4dabda3cb34b27dc_0.png",  startCode: 89  },
  { src: "/tex1_512x32_28fde9a0d7c7d4fd_0.png",  startCode: 108 },
] as const;

const SHEET_W = 512, SHEET_H = 32, CELL_W = 26, CELL_X0 = 1;
type GlyphBounds = { left: number; width: number };
const _cache = new Map<string, Promise<GlyphBounds[]>>();

function measureSheet(src: string): Promise<GlyphBounds[]> {
  if (!_cache.has(src)) {
    _cache.set(src, new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = SHEET_W; canvas.height = SHEET_H;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, SHEET_W, SHEET_H).data;
        const result: GlyphBounds[] = [];
        for (let i = 0; i < 19; i++) {
          const cx = CELL_X0 + i * CELL_W;
          let minX = CELL_W, maxX = -1;
          for (let y = 0; y < SHEET_H; y++)
            for (let x = 0; x < CELL_W; x++) {
              const a = data[((y * SHEET_W) + cx + x) * 4 + 3];
              if (a > 16) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); }
            }
          result.push(maxX < 0 ? { left: 0, width: CELL_W } : { left: minX, width: maxX - minX + 1 });
        }
        resolve(result);
      };
      img.onerror = () => resolve(Array(19).fill({ left: 0, width: CELL_W }));
      img.src = src;
    }));
  }
  return _cache.get(src)!;
}

function WiiText({ text, scale = 1.3, gap = 3, glyphFilter = "invert(1)" }: {
  text: string; scale?: number; gap?: number; glyphFilter?: string;
}) {
  const [metrics, setMetrics] = useState<Map<string, GlyphBounds[]> | null>(null);
  const dispH = SHEET_H * scale;
  useEffect(() => {
    let cancelled = false;
    Promise.all(SPRITE_SHEETS.map(s => measureSheet(s.src).then(m => [s.src, m] as [string, GlyphBounds[]])))
      .then(entries => { if (!cancelled) setMetrics(new Map(entries)); });
    return () => { cancelled = true; };
  }, []);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: gap * scale }}>
      {[...text].map((char, i) => {
        const code = char.charCodeAt(0);
        const sheet = SPRITE_SHEETS.find(s => code >= s.startCode && code < s.startCode + 19);
        if (!sheet) return <span key={i} style={{ display: "inline-block", width: dispH * 0.3, height: dispH }} />;
        const idx = code - sheet.startCode;
        const bounds = metrics?.get(sheet.src)?.[idx];
        const glyphL = bounds?.left ?? 0;
        const glyphW = bounds?.width ?? CELL_W;
        const bgX = -((CELL_X0 + idx * CELL_W + glyphL) * scale);
        return (
          <span key={i} style={{
            display: "inline-block", width: glyphW * scale, height: dispH, overflow: "hidden",
            backgroundImage: `url('${sheet.src}')`,
            backgroundSize: `${SHEET_W * scale}px ${SHEET_H * scale}px`,
            backgroundPosition: `${bgX}px 0`, backgroundRepeat: "no-repeat",
            filter: glyphFilter, flexShrink: 0,
          }} />
        );
      })}
    </span>
  );
}

/* ─── Data ─── */

const PROJECTS = [
  {
    id: "pawprint",
    name: "PawPrint",
    subtitle: "AI-Powered Adoption Campaign Platform",
    badge: "AI",
    badgeColor: "#10b981",
    overview: "PawPrint helps shelter volunteers generate polished, platform-ready adoption campaigns using AI-generated captions, automated media optimization, and downloadable social media packs.",
    highlights: [
      "Built a multi-step upload workflow for managing pet profiles, photos, and videos",
      "Integrated Google Gemini to generate platform-specific adoption captions",
      "Used Cloudinary as both a media platform and structured metadata database",
      "Generated downloadable social media packs with QR codes and platform-sized assets",
      "Implemented automatic hero image selection using AI quality analysis",
      "Built Vercel serverless APIs for caption generation and metadata operations",
    ],
    tech: ["React", "TypeScript", "Vite", "Cloudinary", "Google Gemini", "Vercel"],
    focus: ["Full-Stack Development", "AI Integration", "Media Processing"],
  },
  {
    id: "ecolens",
    name: "EcoLens",
    subtitle: "Sustainability Scanner for Canadian Shoppers",
    badge: "DATA",
    badgeColor: "#db2777",
    overview: "EcoLens is a sustainability-focused shopping assistant that calculates the environmental and financial impact of products using live pricing, localized data, and AI-powered analysis.",
    highlights: [
      "Developed barcode, label, and receipt scanning workflows for product analysis",
      "Calculated True Cost using shelf price, fuel cost, and environmental externalities",
      "Built localized sustainability scoring based on province-specific infrastructure data",
      "Integrated AI-powered sustainability research and alternative recommendations",
      "Connected live retailer pricing systems and external sustainability datasets",
      "Added multiple comparison modes for balancing price and sustainability",
    ],
    tech: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Google Gemini"],
    focus: ["AI Systems", "Sustainability Tech", "Consumer Applications"],
  },
  {
    id: "arctic",
    name: "Arctic Analytics",
    subtitle: "Real-Time Robotics Telemetry Platform",
    badge: "ROBOTICS",
    badgeColor: "#3b82f6",
    overview: "Arctic Analytics is a robotics telemetry system that transforms raw sensor logs into real-time dashboards and AI-generated voice feedback for debugging and performance analysis.",
    highlights: [
      "Built a live telemetry dashboard for visualizing robot sensor data",
      "Streamed Arduino sensor output through a Python-based data bridge",
      "Integrated an AI voice mascot using ElevenLabs text-to-speech APIs",
      "Structured firmware systems for motors, sensors, and navigation logic",
      "Logged motor RPM, ultrasonic distance, and line-following sensor data",
      "Designed the project around a Winter Olympics-inspired robotics theme",
    ],
    tech: ["Arduino", "C++", "Python", "React", "ElevenLabs"],
    focus: ["Robotics", "Real-Time Systems", "Embedded Software"],
  },
  {
    id: "envroom",
    name: "Environmental Room Regulator",
    subtitle: "Hospital Environmental Monitoring System",
    badge: "EMBEDDED",
    badgeColor: "#8b5cf6",
    overview: "An embedded monitoring system designed to reduce hospital-induced delirium by tracking environmental conditions and automating calming feedback systems.",
    highlights: [
      "Collected real-time temperature, humidity, sound, and proximity data",
      "Developed automated sound alerts and LED breathing feedback systems",
      "Streamed sensor data to a live dashboard using REST APIs",
      "Designed a modular architecture for future multi-room scalability",
      "Achieved near real-time sensor updates with sub-100ms latency",
      "Used multithreading for concurrent sensor monitoring and animation handling",
    ],
    tech: ["Python", "Raspberry Pi", "REST APIs", "Embedded Systems"],
    focus: ["Embedded Systems", "IoT", "Automation"],
  },
  {
    id: "pomoprep",
    name: "PomoPrep",
    subtitle: "Pomodoro Study Tracker",
    badge: "WEB",
    badgeColor: "#f59e0b",
    overview: "PomoPrep is a productivity-focused study tracker that combines the Pomodoro technique with detailed subject-based study logging.",
    highlights: [
      "Built a Pomodoro timer with focus sessions and break cycles",
      "Implemented subject-based organization and persistent study logs",
      "Designed responsive layouts for desktop and mobile study environments",
      "Added animated SVG progress indicators and smooth UI transitions",
      "Structured state management using React Hooks and memoization patterns",
      "Logged study sessions with timestamps, notes, and cycle tracking",
    ],
    tech: ["React", "JSX", "Tailwind CSS", "LocalStorage API"],
    focus: ["Frontend Development", "Productivity Systems", "UI/UX Design"],
  },
  {
    id: "saga",
    name: "Sustainable Saga",
    subtitle: "Educational Sustainability Adventure Game",
    badge: "GAME",
    badgeColor: "#ef4444",
    overview: "Sustainable Saga is a 2D educational adventure game that teaches sustainability concepts through exploration, platforming, and interactive quizzes.",
    highlights: [
      "Developed multiple gameplay systems including exploration and platformer mechanics",
      "Built animated sprite systems, enemy AI, and NPC dialogue interactions",
      "Implemented sustainability-themed quizzes and progression systems",
      "Integrated music, sound effects, and collectible eco-items for immersion",
      "Designed explorable environments spanning forests, towns, and oceans",
      "Added health systems, platforming mechanics, and villain combat behaviors",
    ],
    tech: ["Python", "Pygame"],
    focus: ["Game Development", "Educational Software", "Interactive Systems"],
  },
  {
    id: "portfolio",
    name: "Wii Sports Portfolio",
    subtitle: "Interactive Portfolio Experience",
    badge: "WEB",
    badgeColor: "#f59e0b",
    overview: "A portfolio experience built around the Wii Sports interface — recreating its navigation style, texture assets, and interaction patterns using modern web technologies.",
    highlights: [
      "Engineered a custom sprite-sheet font renderer with canvas-based pixel measurement for authentic Wii typography",
      "Rebuilt Wii Sports button textures and hover effects using sprite sheet masking and CSS clip-path",
      "Recreated the Wii Sports Resort back button with a masked circle asset, off-screen arrow badge, and animated blue hover state",
      "Built staggered card entrance animations and frosted-glass overlays for subpages",
      "Implemented client-side routing with Next.js App Router for experience and project detail pages",
      "Structured the entire UI using inline CSS-in-JS with no external component libraries",
    ],
    tech: ["Next.js", "TypeScript", "Canvas API", "Sprite Sheets", "CSS-in-JS"],
    focus: ["UI/UX Design", "Frontend Engineering", "Motion Design"],
  },
] as const;

/* ─── Page ─── */

export default function ProjectsPage() {
  const router = useRouter();
  const [entered, setEntered] = useState(false);
  const [backHovered, setBackHovered] = useState(false);

  useEffect(() => { requestAnimationFrame(() => setEntered(true)); }, []);

  return (
    <main style={{
      height: "100vh",
      width: "100vw",
      display: "flex",
      flexDirection: "column",
      background: "#000",
      fontFamily: "var(--font-wii), sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>

      {/* Background video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
        }}
      >
        <source src="/wsresort.mp4" type="video/mp4" />
      </video>

      {/* ── Header ── */}
      <header style={{
        flexShrink: 0,
        background: "linear-gradient(180deg, rgba(255,255,255,0.97) 0%, rgba(220,244,255,0.93) 100%)",
        backdropFilter: "blur(12px)",
        borderBottom: "2px solid rgba(78,196,219,0.25)",
        padding: "0.85rem 2.5rem",
        display: "flex",
        alignItems: "center",
        zIndex: 10,
        position: "relative",
        gap: "1.4rem",
      }}>
        {/* Wii-style back button */}
        <button
          onClick={() => router.push("/")}
          onMouseEnter={() => setBackHovered(true)}
          onMouseLeave={() => setBackHovered(false)}
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            height: 64,
            flexShrink: 0,
            marginLeft: "calc(-2.5rem - 30px)",
          }}
        >
          {/* Grey arrow-shaped badge */}
          <div style={{
            background: backHovered
              ? "linear-gradient(rgba(102,214,229,0.52), rgba(102,214,229,0.52)), linear-gradient(180deg, #868686 0%, #5c5c5c 50%, #4a4a4a 100%)"
              : "linear-gradient(180deg, #868686 0%, #5c5c5c 50%, #4a4a4a 100%)",
            height: 38,
            paddingLeft: 165,
            paddingRight: 20,
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginLeft: -50,
            clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 5px rgba(0,0,0,0.45)",
            transition: "background 0.1s ease-out",
          }}>
            <div style={{
              width: 21,
              height: 28,
              backgroundImage: "url('/RSPE01/tex1_512x32_d1413bb8187a8df9_0.png')",
              backgroundSize: `${512 * (28 / 32)}px ${28}px`,
              backgroundPosition: `-24px 0`,
              backgroundRepeat: "no-repeat",
              flexShrink: 0,
            }} />
            <WiiText text="Back" scale={0.9} glyphFilter="none" />
          </div>

          {/* Silver circle with back arrow */}
          <div style={{
            position: "absolute",
            left: 50,
            top: "50%",
            transform: backHovered ? "translateY(-50%) scale(1.13)" : "translateY(-50%) scale(1)",
            transition: "transform 0.1s ease-out",
            width: 64,
            height: 64,
            backgroundImage: "url('/RSPE01/tex1_64x64_2f3a0f47a8e13cb4_3.png')",
            backgroundSize: "100% 100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/RSPE01/tex1_32x32_b5e9b9843d63fe5b_2.png"
              alt=""
              width={28}
              height={28}
              style={{ display: "block", filter: "brightness(0.3)" }}
            />
            {backHovered && (
              <div style={{
                position: "absolute",
                inset: 0,
                background: "rgba(102,214,229,0.52)",
                maskImage: "url('/RSPE01/tex1_64x64_2f3a0f47a8e13cb4_3.png')",
                maskSize: "100% 100%",
                WebkitMaskImage: "url('/RSPE01/tex1_64x64_2f3a0f47a8e13cb4_3.png')",
                WebkitMaskSize: "100% 100%",
                pointerEvents: "none",
              }} />
            )}
          </div>
        </button>
        <WiiText text="Project Log" scale={1.6} />
      </header>

      {/* ── Scrollable cards ── */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "1.8rem 3rem 2.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.6rem",
        position: "relative",
        zIndex: 1,
      }}>
        {PROJECTS.map((proj, i) => (
          <div
            key={proj.id}
            style={{
              background: "rgba(255,255,255,0.88)",
              backdropFilter: "blur(8px)",
              borderRadius: "1.5rem",
              border: "1.5px solid rgba(255,255,255,0.75)",
              boxShadow: "0 8px 28px rgba(0,60,120,0.13), 0 2px 8px rgba(0,40,90,0.07)",
              overflow: "hidden",
              flexShrink: 0,
              opacity: entered ? 1 : 0,
              transform: entered ? "translateY(0)" : "translateY(20px)",
              transition: `opacity 0.4s ease ${i * 0.07}s, transform 0.4s ease ${i * 0.07}s`,
            }}
          >
            {/* Card header bar */}
            <div style={{
              background: "linear-gradient(135deg, #4ec4db 0%, #29a4c2 100%)",
              padding: "0.85rem 1.6rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                <span style={{
                  background: proj.badgeColor,
                  color: "white",
                  fontSize: "0.56rem",
                  letterSpacing: "0.1em",
                  padding: "0.22rem 0.7rem",
                  borderRadius: "999px",
                  fontWeight: 700,
                  flexShrink: 0,
                }}>
                  {proj.badge}
                </span>
                <WiiText text={proj.name} scale={1.2} glyphFilter="none" />
              </div>
            </div>

            {/* Subtitle bar */}
            <div style={{
              padding: "0.45rem 1.6rem",
              background: "rgba(78,196,219,0.07)",
              borderBottom: "1px solid rgba(78,196,219,0.12)",
            }}>
              <p style={{ color: "#1d9ab8", fontSize: "0.84rem" }}>{proj.subtitle}</p>
            </div>

            {/* Body */}
            <div style={{ padding: "1.2rem 1.6rem" }}>

              {/* Overview */}
              <p style={{ color: "#555", fontSize: "0.85rem", lineHeight: 1.65, marginBottom: "1rem" }}>
                {proj.overview}
              </p>

              {/* Highlights */}
              <p style={{ fontSize: "0.59rem", letterSpacing: "0.12em", color: "#c0c0c0", marginBottom: "0.5rem" }}>
                HIGHLIGHTS
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.32rem 1.4rem", marginBottom: "1rem" }}>
                {proj.highlights.map(h => (
                  <div
                    key={h}
                    style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.79rem", color: "#444", lineHeight: 1.45 }}
                  >
                    <span style={{
                      width: 5, height: 5, borderRadius: "50%",
                      background: "#4ec4db", flexShrink: 0, marginTop: "0.38em",
                    }} />
                    {h}
                  </div>
                ))}
              </div>

              {/* Focus areas */}
              <p style={{ fontSize: "0.59rem", letterSpacing: "0.12em", color: "#c0c0c0", marginBottom: "0.45rem" }}>
                FOCUS
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.38rem", marginBottom: "0.8rem" }}>
                {proj.focus.map(f => (
                  <span key={f} style={{
                    background: "rgba(78,196,219,0.1)",
                    color: "#1a9ab8",
                    border: "1px solid rgba(78,196,219,0.22)",
                    borderRadius: "999px",
                    padding: "0.18rem 0.75rem",
                    fontSize: "0.75rem",
                  }}>
                    {f}
                  </span>
                ))}
              </div>

              {/* Tech stack */}
              <p style={{ fontSize: "0.59rem", letterSpacing: "0.12em", color: "#c0c0c0", marginBottom: "0.45rem" }}>
                TECH STACK
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.38rem" }}>
                {proj.tech.map(t => (
                  <span key={t} style={{
                    background: "rgba(139,92,246,0.08)",
                    color: "#7c3aed",
                    border: "1px solid rgba(139,92,246,0.2)",
                    borderRadius: "999px",
                    padding: "0.18rem 0.75rem",
                    fontSize: "0.75rem",
                  }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
