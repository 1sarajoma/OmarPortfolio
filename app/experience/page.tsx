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

/* ─── Tech stack tiles ─── */

const SIMPLE_ICONS: Record<string, string> = {
  "React":         "https://cdn.simpleicons.org/react/1a1a1a",
  "JSX":           "https://cdn.simpleicons.org/react/1a1a1a",
  "TypeScript":    "https://cdn.simpleicons.org/typescript/1a1a1a",
  "JavaScript":    "https://cdn.simpleicons.org/javascript/1a1a1a",
  "Python":        "https://cdn.simpleicons.org/python/1a1a1a",
  "Next.js":       "https://cdn.simpleicons.org/nextdotjs/1a1a1a",
  "Tailwind CSS":  "https://cdn.simpleicons.org/tailwindcss/1a1a1a",
  "Vite":          "https://cdn.simpleicons.org/vite/1a1a1a",
  "Arduino":       "https://cdn.simpleicons.org/arduino/1a1a1a",
  "C++":           "https://cdn.simpleicons.org/cplusplus/1a1a1a",
  "Git":           "https://cdn.simpleicons.org/git/1a1a1a",
  "Vercel":        "https://cdn.simpleicons.org/vercel/1a1a1a",
  "Raspberry Pi":  "https://cdn.simpleicons.org/raspberrypi/1a1a1a",
  "Google Gemini": "https://cdn.simpleicons.org/googlegemini/1a1a1a",
  "ElevenLabs":    "https://cdn.simpleicons.org/elevenlabs/1a1a1a",
  "Make.com":      "https://cdn.simpleicons.org/make/1a1a1a",
  "STM32":         "https://cdn.simpleicons.org/stmicroelectronics/1a1a1a",
  "STM32CubeIDE":  "https://cdn.simpleicons.org/stmicroelectronics/1a1a1a",
  "Cloudinary":    "https://cdn.simpleicons.org/cloudinary/1a1a1a",
};

const LOCAL_LOGOS: Record<string, { src: string; filter: string; cropTop?: number }> = {
  "C":         { src: "/logos/image.png",         filter: "grayscale(1) brightness(0.75) contrast(100)" },
  "Salesforce": { src: "/logos/image copy.png",   filter: "grayscale(1) brightness(0.75) contrast(100)" },
  "CSS-in-JS":  { src: "/logos/image copy 2.png", filter: "grayscale(1) brightness(0.75) contrast(100)" },
  "Pygame":     { src: "/logos/image copy 3.png", filter: "grayscale(1) brightness(0.6)" },
};

const SVG_FB = { viewBox: "0 0 24 24" as const, width: 22, height: 22, fill: "none" as const, stroke: "#1a1a1a", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

function getTechIcon(tech: string): React.ReactNode {
  if (tech in LOCAL_LOGOS) {
    const { src, filter, cropTop } = LOCAL_LOGOS[tech];
    if (cropTop) {
      return (
        <div style={{ width: 22, height: 22, overflow: "hidden", flexShrink: 0, position: "relative" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" style={{ display: "block", filter, height: 27, width: "auto", position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)" }} />
        </div>
      );
    }
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} width={22} height={22} alt="" style={{ display: "block", filter }} />;
  }
  if (tech in SIMPLE_ICONS) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={SIMPLE_ICONS[tech]} width={22} height={22} alt="" style={{ display: "block" }} />;
  }
  switch (tech) {
    case "Embedded Systems":
      return <svg {...SVG_FB}><rect x="5" y="7" width="14" height="10" rx="1.5"/><line x1="9" y1="7" x2="9" y2="4"/><line x1="12" y1="7" x2="12" y2="4"/><line x1="15" y1="7" x2="15" y2="4"/><line x1="9" y1="17" x2="9" y2="20"/><line x1="12" y1="17" x2="12" y2="20"/><line x1="15" y1="17" x2="15" y2="20"/><line x1="5" y1="11" x2="2" y2="11"/><line x1="5" y1="13" x2="2" y2="13"/><line x1="19" y1="11" x2="22" y2="11"/><line x1="19" y1="13" x2="22" y2="13"/></svg>;
    case "REST APIs":
      return <svg {...SVG_FB}><circle cx="5" cy="5" r="2.5"/><circle cx="19" cy="12" r="2.5"/><circle cx="5" cy="19" r="2.5"/><path d="M7.5 5h4l5 7"/><path d="M7.5 19h4l5-7"/></svg>;
    case "LocalStorage API":
      return <svg {...SVG_FB}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>;
    case "Sprite Sheets":
      return <svg {...SVG_FB}><rect x="2" y="2" width="9" height="9" rx="1"/><rect x="13" y="2" width="9" height="9" rx="1"/><rect x="2" y="13" width="9" height="9" rx="1"/><rect x="13" y="13" width="9" height="9" rx="1"/></svg>;
    case "CSS-in-JS":
      return <svg {...SVG_FB}><path d="M9 3C7 3 6 4 6 5.5L6 9C6 10.5 4 11 4 12C4 13 6 13.5 6 15L6 18.5C6 20 7 21 9 21"/><path d="M15 3C17 3 18 4 18 5.5L18 9C18 10.5 20 11 20 12C20 13 18 13.5 18 15L18 18.5C18 20 17 21 15 21"/></svg>;
    case "Canvas API":
      return <svg {...SVG_FB}><rect x="3" y="3" width="18" height="14" rx="2"/><path d="M7 21h10M12 17v4"/><path d="M8 10l2-2 3 3 2-2 3 3"/></svg>;
    case "UI Development":
      return <svg {...SVG_FB}><rect x="2" y="3" width="20" height="15" rx="2"/><line x1="6" y1="9" x2="18" y2="9"/><line x1="6" y1="13" x2="13" y2="13"/><line x1="2" y1="21" x2="22" y2="21"/></svg>;
    default:
      return <svg {...SVG_FB}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="14" x2="15" y2="14"/></svg>;
  }
}

function TechTile({ tech }: { tech: string }) {
  return (
    <div style={{
      width: 66,
      height: 60,
      backgroundImage: "url('/tex1_168x128_2dc2b15cda7148e3_5.png')",
      backgroundSize: "100% 100%",
      backgroundRepeat: "no-repeat",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      flexShrink: 0,
      cursor: "default",
      userSelect: "none",
    }}>
      {getTechIcon(tech)}
      <span style={{
        fontSize: "0.5rem",
        color: "#1a1a1a",
        fontWeight: 700,
        textAlign: "center",
        lineHeight: 1.15,
        maxWidth: 58,
        wordBreak: "break-word",
        fontFamily: "sans-serif",
        letterSpacing: "0.01em",
      }}>
        {tech}
      </span>
    </div>
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
        {/* Wii-style back button: circle + grey arrow badge */}
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
          {/* Grey arrow-shaped badge — extends past circle off screen to the left */}
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
            {/* B button icon — cropped from icon sprite sheet */}
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
        <WiiText text="Career Record" scale={1.6} />
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
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem" }}>
                {exp.tech.map(t => <TechTile key={t} tech={t} />)}
              </div>
            </div>
          </div>
        ))}

      </div>
    </main>
  );
}
