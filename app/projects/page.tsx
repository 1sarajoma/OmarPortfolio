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
          <img src={src} alt="" style={{ display: "block", filter, height: 36, width: "auto", position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)" }} />
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

const PROJECTS = [
  {
    id: "pawprint",
    name: "PawPrint",
    subtitle: "AI-Powered Adoption Campaign Platform",
    badge: "AI",
    badgeColor: "#10b981",
    github: "https://github.com/Jarank-git/HackCanada2026",
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
    github: "https://github.com/Jarank-git/GenAI2026",
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
    github: "https://github.com/IshaanMittal07/ArcticAnalytics",
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
    github: "https://github.com/1sarajoma/EnvironmentalRoomRegulator",
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
    github: "https://github.com/1sarajoma/PomoPrep",
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
    github: "https://github.com/1sarajoma/Sustainable-Saga",
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
    github: "https://github.com/1sarajoma/OmarPortfolio",
    overview: "A portfolio experience built around the Wii Sports interface — recreating its navigation style, texture assets, and interaction patterns using modern web technologies.",
    highlights: [
      "Engineered a custom sprite-sheet font renderer with canvas-based pixel measurement for authentic Wii typography",
      "Rebuilt Wii Sports button textures and hover effects using sprite sheet masking and CSS clip-path",
      "Recreated the Wii Sports Resort back button with a masked circle asset, off-screen arrow badge, and animated blue hover state",
      "Built staggered card entrance animations and frosted-glass overlays for subpages",
      "Implemented client-side routing with Next.js App Router for experience and project detail pages",
      "Structured the entire UI using inline CSS-in-JS with no external component libraries",
    ],
    tech: ["Next.js", "TypeScript", "Canvas API", "CSS-in-JS"],
    focus: ["UI/UX Design", "Frontend Engineering", "Motion Design"],
  },
] as const;

const PROJECT_IMAGES: Record<string, { src: string; caption: string }[]> = {
  "pawprint": [
    { src: "/project_images/pawprint/ppmenu.jpg",     caption: "The landing page for PawPrint, here users can start a pet profile or view other pets." },
    { src: "/project_images/pawprint/pp_form.jpg",    caption: "The form that volunteers would fill out for completing pet profiles." },
    { src: "/project_images/pawprint/pp_profile.jpg", caption: "The profile of the pet, generated from the completed pet form." },
    { src: "/project_images/pawprint/pp_captions.jpg",caption: "Sample social media captions for the pet, optimized for different social media." },
  ],
};

/* ─── Page ─── */

export default function ProjectsPage() {
  const router = useRouter();
  const [entered, setEntered] = useState(false);
  const [backHovered, setBackHovered] = useState(false);
  const [hoveredGithub, setHoveredGithub] = useState<string | null>(null);
  const [lightboxId,    setLightboxId]    = useState<string | null>(null);
  const [lightboxIdx,   setLightboxIdx]   = useState(0);
  const [hoveredImgBtn, setHoveredImgBtn] = useState<string | null>(null);
  const [closeHovered,  setCloseHovered]  = useState(false);
  const [hoveredNav,    setHoveredNav]    = useState<"prev" | "next" | null>(null);

  useEffect(() => { requestAnimationFrame(() => setEntered(true)); }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!lightboxId) return;
      const imgs = PROJECT_IMAGES[lightboxId] ?? [];
      if (e.key === "Escape") { setLightboxId(null); return; }
      if (e.key === "ArrowRight" && lightboxIdx < imgs.length - 1) setLightboxIdx(i => i + 1);
      if (e.key === "ArrowLeft"  && lightboxIdx > 0)               setLightboxIdx(i => i - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxId, lightboxIdx]);

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
              position: "relative",
              flexShrink: 0,
              opacity: entered ? 1 : 0,
              transform: entered ? "translateY(0)" : "translateY(20px)",
              transition: `opacity 0.4s ease ${i * 0.07}s, transform 0.4s ease ${i * 0.07}s`,
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.88)",
                backdropFilter: "blur(8px)",
                borderRadius: "1.5rem",
                border: "1.5px solid rgba(255,255,255,0.75)",
                boxShadow: "0 8px 28px rgba(0,60,120,0.13), 0 2px 8px rgba(0,40,90,0.07)",
                overflow: "hidden",
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
                <a
                  href={proj.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => setHoveredGithub(proj.id)}
                  onMouseLeave={() => setHoveredGithub(null)}
                  style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, opacity: 0.9, marginLeft: "0.6rem", padding: "4px", lineHeight: 0, position: "relative", zIndex: 5 }}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" pointerEvents="all" style={{ display: "block", filter: hoveredGithub === proj.id ? "brightness(0.6)" : "none", transition: "filter 0.12s ease-out" }}>
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                </a>
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


              {/* Tech stack */}
              <p style={{ fontSize: "0.59rem", letterSpacing: "0.12em", color: "#c0c0c0", marginBottom: "0.45rem" }}>
                TECH STACK
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem" }}>
                {proj.tech.map(t => <TechTile key={t} tech={t} />)}
              </div>
            </div>
            </div>
            {/* Image gallery button */}
            <button
              onClick={() => {
                const imgs = PROJECT_IMAGES[proj.id];
                if (imgs && imgs.length > 0) { setLightboxId(proj.id); setLightboxIdx(0); }
              }}
              onMouseEnter={() => setHoveredImgBtn(proj.id)}
              onMouseLeave={() => setHoveredImgBtn(null)}
              style={{
                position: "absolute",
                bottom: 2,
                right: 260,
                width: 140,
                height: 107,
                backgroundImage: "url('/tex1_168x128_2dc2b15cda7148e3_5.png')",
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
                border: "none",
                outline: "none",
                cursor: PROJECT_IMAGES[proj.id]?.length ? "pointer" : "default",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: hoveredImgBtn === proj.id && PROJECT_IMAGES[proj.id]?.length ? "translateY(-2px) scale(1.05)" : "none",
                transition: "transform 0.08s ease-out",
                zIndex: 2,
                opacity: PROJECT_IMAGES[proj.id]?.length ? 1 : 0.4,
              }}
            >
              <svg width="37" height="37" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              {hoveredImgBtn === proj.id && !!PROJECT_IMAGES[proj.id]?.length && (
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(102,214,229,0.52)",
                  maskImage: "url('/tex1_168x128_2dc2b15cda7148e3_5.png')",
                  maskSize: "100% 100%",
                  WebkitMaskImage: "url('/tex1_168x128_2dc2b15cda7148e3_5.png')",
                  WebkitMaskSize: "100% 100%",
                  pointerEvents: "none",
                }} />
              )}
            </button>
          </div>
        ))}
      </div>
      {/* ── Lightbox ── */}
      {lightboxId && (() => {
        const imgs = PROJECT_IMAGES[lightboxId] ?? [];
        if (imgs.length === 0) return null;
        const img = imgs[lightboxIdx];
        return (
          <div
            onClick={() => { setLightboxId(null); setCloseHovered(false); }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.82)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              zIndex: 500,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.9rem",
                maxWidth: "min(82vw, 960px)",
                width: "100%",
              }}
            >
              {/* Image with close + counter overlaid at corners */}
              <div style={{ position: "relative", maxWidth: "100%", display: "inline-block" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={img.caption}
                  style={{
                    maxHeight: "58vh",
                    maxWidth: "100%",
                    objectFit: "contain",
                    borderRadius: "0.75rem",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                    display: "block",
                  }}
                />
                {/* Close — top-left corner of image */}
                <button
                  onClick={() => { setLightboxId(null); setCloseHovered(false); }}
                  onMouseEnter={() => setCloseHovered(true)}
                  onMouseLeave={() => setCloseHovered(false)}
                  style={{ position: "absolute", top: -40, left: 6, background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}
                >
                  <svg width={36} height={36} viewBox="0 0 44 44" fill="none" style={{ display: "block", opacity: closeHovered ? 0.55 : 1, transition: "opacity 0.12s ease-out" }}>
                    <circle cx={22} cy={22} r={19} stroke="white" strokeWidth={2.5}/>
                    <line x1={13} y1={13} x2={31} y2={31} stroke="white" strokeWidth={2.5} strokeLinecap="round"/>
                    <line x1={31} y1={13} x2={13} y2={31} stroke="white" strokeWidth={2.5} strokeLinecap="round"/>
                  </svg>
                </button>
                {/* Counter — top-right corner of image */}
                <span style={{
                  position: "absolute", top: -30, right: 12,
                  color: "rgba(255,255,255,0.7)", fontSize: "1rem", fontFamily: "sans-serif",
                  textShadow: "0 1px 4px rgba(0,0,0,0.6)",
                }}>
                  {lightboxIdx + 1} / {imgs.length}
                </span>
              </div>

              {/* Caption */}
              <p style={{
                color: "rgba(255,255,255,0.82)",
                fontSize: "0.86rem",
                textAlign: "center",
                maxWidth: "620px",
                lineHeight: 1.6,
                fontFamily: "sans-serif",
              }}>
                {img.caption}
              </p>

              {/* Navigation */}
              <div style={{ display: "flex", gap: "1.2rem", alignItems: "center" }}>
                {lightboxIdx > 0 && (
                  <button
                    onClick={() => setLightboxIdx(i => i - 1)}
                    onMouseEnter={() => setHoveredNav("prev")}
                    onMouseLeave={() => setHoveredNav(null)}
                    style={{
                      width: 72, height: 55,
                      backgroundImage: "url('/tex1_168x128_2dc2b15cda7148e3_5.png')",
                      backgroundSize: "100% 100%", backgroundRepeat: "no-repeat",
                      border: "none", outline: "none", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transform: hoveredNav === "prev" ? "translateY(-2px) scale(1.05)" : "none",
                      transition: "transform 0.08s ease-out",
                      position: "relative",
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6"/>
                    </svg>
                    {hoveredNav === "prev" && (
                      <div style={{
                        position: "absolute", inset: 0,
                        background: "rgba(102,214,229,0.52)",
                        maskImage: "url('/tex1_168x128_2dc2b15cda7148e3_5.png')", maskSize: "100% 100%",
                        WebkitMaskImage: "url('/tex1_168x128_2dc2b15cda7148e3_5.png')", WebkitMaskSize: "100% 100%",
                        pointerEvents: "none",
                      }} />
                    )}
                  </button>
                )}
                {lightboxIdx < imgs.length - 1 && (
                  <button
                    onClick={() => setLightboxIdx(i => i + 1)}
                    onMouseEnter={() => setHoveredNav("next")}
                    onMouseLeave={() => setHoveredNav(null)}
                    style={{
                      width: 72, height: 55,
                      backgroundImage: "url('/tex1_168x128_2dc2b15cda7148e3_5.png')",
                      backgroundSize: "100% 100%", backgroundRepeat: "no-repeat",
                      border: "none", outline: "none", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transform: hoveredNav === "next" ? "translateY(-2px) scale(1.05)" : "none",
                      transition: "transform 0.08s ease-out",
                      position: "relative",
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                    {hoveredNav === "next" && (
                      <div style={{
                        position: "absolute", inset: 0,
                        background: "rgba(102,214,229,0.52)",
                        maskImage: "url('/tex1_168x128_2dc2b15cda7148e3_5.png')", maskSize: "100% 100%",
                        WebkitMaskImage: "url('/tex1_168x128_2dc2b15cda7148e3_5.png')", WebkitMaskSize: "100% 100%",
                        pointerEvents: "none",
                      }} />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </main>
  );
}
