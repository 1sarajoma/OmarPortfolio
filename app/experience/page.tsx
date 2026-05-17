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

const EXPERIENCES = [
  {
    id: "ffg",
    company: "Food For Good",
    role: "Application Development Intern",
    period: "Jan 2026 — May 2026",
    badge: "INTERNSHIP",
    badgeColor: "#f59e0b",
    overview: "Worked on operational software systems and workflow automation tools to improve reliability, reduce manual processes, and streamline inventory and payment management across internal company systems.",
    highlights: [
      "Created and maintained automated workflows using Make.com",
      "Troubleshot and updated JavaScript middleware hosted on Vercel",
      "Resolved 10+ system integration issues to improve operational reliability",
      "Automated Salesforce procedures using Flows to reduce manual workload",
      "Implemented major application features for payment management and inventory tracking",
      "Improved visibility for operational order records and reduced administrative overhead",
    ],
    tech: ["JavaScript", "Make.com", "Salesforce", "Vercel"],
    miiSrc: "/RSPE01/tex1_512x256_480c03c9ce52db2e_14.png",
  },
  {
    id: "warg",
    company: "Waterloo Aerial Robotics Group",
    role: "Embedded Software Developer",
    period: "Sep 2025 — Present",
    badge: "DESIGN TEAM",
    badgeColor: "#8b5cf6",
    overview: "Contributing to embedded flight software development for robotics systems using STM32 hardware and low-level firmware programming concepts.",
    highlights: [
      "Completed a multi-week onboarding bootcamp focused on embedded flight systems",
      "Worked with STM32 microcontrollers and external ADC systems",
      "Interfaced with hardware peripherals including SPI, GPIO, and Timers",
      "Supported system operation using 50 Hz PWM outputs",
      "Collaborated with senior firmware developers on flight software and control systems",
      "Contributed to the development of embedded robotics infrastructure and workflows",
    ],
    tech: ["C", "STM32", "STM32CubeIDE", "Embedded Systems"],
    miiSrc: "/RSPE01/tex1_512x256_d11bb6ae6b422af2_14.png",
  },
  {
    id: "halo",
    company: "Halo Halo",
    role: "Software Developer Intern",
    period: "Jun 2024 — Aug 2024",
    badge: "INTERNSHIP",
    badgeColor: "#f59e0b",
    overview: "Worked within a small development team to prototype interactive software products and evaluate user engagement strategies through game development.",
    highlights: [
      "Developed a React-based Mancala game prototype",
      "Collaborated in a 4-member development team using Git workflows",
      "Designed and implemented game logic and UI systems",
      "Led 5+ project progress meetings with R&D members and senior mentors",
      "Improved project delivery efficiency by over 30% through iterative feedback and coordination",
    ],
    tech: ["React", "JavaScript", "Git", "UI Development"],
    miiSrc: "/RSPE01/tex1_512x256_249391d55cdfcfc0_14.png",
  },
] as const;

/* ─── Page ─── */

export default function ExperiencePage() {
  const router = useRouter();
  const [entered, setEntered] = useState(false);

  useEffect(() => { requestAnimationFrame(() => setEntered(true)); }, []);

  return (
    <main style={{
      height: "100vh",
      width: "100vw",
      display: "flex",
      flexDirection: "column",
      background: "linear-gradient(180deg, #9dd9ef 0%, #cdeefa 40%, #eaf8ff 100%)",
      fontFamily: "var(--font-wii), sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>

      {/* Wii Sports logo watermark */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/RSPE01/tex1_512x256_fa4e897a8e21f9e1_14.png"
        alt=""
        style={{
          position: "absolute", right: "2.5rem", bottom: "1.5rem",
          width: "220px", opacity: 0.07, pointerEvents: "none", zIndex: 0,
        }}
      />

      {/* ── Header ── */}
      <header style={{
        flexShrink: 0,
        background: "linear-gradient(180deg, rgba(255,255,255,0.97) 0%, rgba(220,244,255,0.93) 100%)",
        backdropFilter: "blur(12px)",
        borderBottom: "2px solid rgba(78,196,219,0.25)",
        padding: "0.85rem 2.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 10,
        position: "relative",
      }}>

        {/* Left: back + title */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.4rem" }}>
          <button
            className="wii-button"
            onClick={() => router.push("/")}
            style={{ width: 100, height: 36, flexShrink: 0 }}
          >
            <span style={{ position: "relative", zIndex: 1 }}>
              <WiiText text="Back" scale={0.95} />
            </span>
          </button>
          <WiiText text="Career Record" scale={1.6} />
        </div>

        {/* Right: stats */}
        <div style={{ display: "flex", gap: "2.5rem", alignItems: "center" }}>
          {([
            { value: "3",   label: "POSITIONS"    },
            { value: "2",   label: "INTERNSHIPS"  },
            { value: "10+", label: "TECHNOLOGIES" },
          ] as const).map(stat => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "#2ba8c0", lineHeight: 1 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: "0.58rem", letterSpacing: "0.12em", color: "#999", marginTop: "0.15rem" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
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
        {EXPERIENCES.map((exp, i) => (
          <div
            key={exp.id}
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
              transition: `opacity 0.4s ease ${i * 0.1}s, transform 0.4s ease ${i * 0.1}s`,
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
                  background: exp.badgeColor,
                  color: "white",
                  fontSize: "0.56rem",
                  letterSpacing: "0.1em",
                  padding: "0.22rem 0.7rem",
                  borderRadius: "999px",
                  fontWeight: 700,
                  flexShrink: 0,
                }}>
                  {exp.badge}
                </span>
                <WiiText text={exp.company} scale={1.2} glyphFilter="none" />
              </div>
              <span style={{
                color: "rgba(255,255,255,0.9)",
                fontSize: "0.8rem",
                whiteSpace: "nowrap",
                background: "rgba(0,0,0,0.15)",
                padding: "0.22rem 0.8rem",
                borderRadius: "999px",
              }}>
                {exp.period}
              </span>
            </div>

            {/* Role subtitle */}
            <div style={{
              padding: "0.45rem 1.6rem",
              background: "rgba(78,196,219,0.07)",
              borderBottom: "1px solid rgba(78,196,219,0.12)",
            }}>
              <p style={{ color: "#1d9ab8", fontSize: "0.84rem" }}>{exp.role}</p>
            </div>

            {/* Body */}
            <div style={{ padding: "1.2rem 1.6rem", position: "relative" }}>

              {/* Mii silhouette watermark */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={exp.miiSrc}
                alt=""
                style={{
                  position: "absolute",
                  right: "-1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "230px",
                  opacity: 0.055,
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              />

              {/* Overview */}
              <p style={{ color: "#555", fontSize: "0.85rem", lineHeight: 1.65, marginBottom: "1rem" }}>
                {exp.overview}
              </p>

              {/* Highlights */}
              <p style={{ fontSize: "0.59rem", letterSpacing: "0.12em", color: "#c0c0c0", marginBottom: "0.5rem" }}>
                HIGHLIGHTS
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.32rem 1.4rem", marginBottom: "1rem" }}>
                {exp.highlights.map(h => (
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

              {/* Tech stack */}
              <p style={{ fontSize: "0.59rem", letterSpacing: "0.12em", color: "#c0c0c0", marginBottom: "0.45rem" }}>
                TECH STACK
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.38rem" }}>
                {exp.tech.map(t => (
                  <span key={t} style={{
                    background: "rgba(78,196,219,0.1)",
                    color: "#1a9ab8",
                    border: "1px solid rgba(78,196,219,0.22)",
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

        {/* Bottom Mii silhouette decorations */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "3rem",
          marginTop: "0.5rem",
          opacity: 0.12,
          pointerEvents: "none",
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/RSPE01/tex1_512x256_480c03c9ce52db2e_14.png" alt="" style={{ width: "200px" }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/RSPE01/tex1_512x256_8ed18833fab4807e_14.png" alt="" style={{ width: "200px" }} />
        </div>
      </div>
    </main>
  );
}
