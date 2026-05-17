"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type SectionId = "summary" | "experience" | "projects" | "skills" | "contact";

/* ─── Sprite-sheet text ─── */
// Four 512×32 sheets covering ASCII 51 ('3') through 126 ('~'), 19 chars each.
const SPRITE_SHEETS = [
  { src: "/tex1_512x32_b9315d7550dc913a_0.png", startCode: 51  },
  { src: "/tex1_512x32_26c073ce7aadf652_0.png",  startCode: 70  },
  { src: "/tex1_512x32_4dabda3cb34b27dc_0.png",  startCode: 89  },
  { src: "/tex1_512x32_28fde9a0d7c7d4fd_0.png",  startCode: 108 },
] as const;

const SHEET_W = 512;
const SHEET_H = 32;
const CELL_W  = 26;
const CELL_X0 = 1;

/* ─── Per-glyph pixel bounds, measured once via canvas ─── */
type GlyphBounds = { left: number; width: number };

const _promiseCache = new Map<string, Promise<GlyphBounds[]>>();

function measureSheetAsync(src: string): Promise<GlyphBounds[]> {
  if (!_promiseCache.has(src)) {
    _promiseCache.set(src, new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width  = SHEET_W;
        canvas.height = SHEET_H;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, SHEET_W, SHEET_H).data;
        const result: GlyphBounds[] = [];
        for (let i = 0; i < 19; i++) {
          const cx = CELL_X0 + i * CELL_W;
          let minX = CELL_W, maxX = -1;
          for (let y = 0; y < SHEET_H; y++) {
            for (let x = 0; x < CELL_W; x++) {
              const a = data[((y * SHEET_W) + cx + x) * 4 + 3];
              if (a > 16) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); }
            }
          }
          result.push(maxX < 0
            ? { left: 0, width: CELL_W }
            : { left: minX, width: maxX - minX + 1 });
        }
        resolve(result);
      };
      img.onerror = () => resolve(Array(19).fill({ left: 0, width: CELL_W }));
      img.src = src;
    }));
  }
  return _promiseCache.get(src)!;
}

// gap: consistent px space between characters (at scale=1)
function WiiText({ text, scale = 1.3, gap = 3, glyphFilter = "invert(1)" }: {
  text: string; scale?: number; gap?: number; glyphFilter?: string;
}) {
  const [metrics, setMetrics] = useState<Map<string, GlyphBounds[]> | null>(null);
  const dispH = SHEET_H * scale;

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      SPRITE_SHEETS.map(s => measureSheetAsync(s.src).then(m => [s.src, m] as [string, GlyphBounds[]]))
    ).then(entries => { if (!cancelled) setMetrics(new Map(entries)); });
    return () => { cancelled = true; };
  }, []);

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: gap * scale }}>
      {[...text].map((char, i) => {
        const code  = char.charCodeAt(0);
        const sheet = SPRITE_SHEETS.find(s => code >= s.startCode && code < s.startCode + 19);

        if (!sheet) {
          return <span key={i} style={{ display: "inline-block", width: dispH * 0.3, height: dispH }} />;
        }

        const idx    = code - sheet.startCode;
        const bounds = metrics?.get(sheet.src)?.[idx];
        const glyphL = bounds?.left  ?? 0;
        const glyphW = bounds?.width ?? CELL_W;
        const bgX    = -((CELL_X0 + idx * CELL_W + glyphL) * scale);

        return (
          <span
            key={i}
            style={{
              display:            "inline-block",
              width:              glyphW * scale,
              height:             dispH,
              overflow:           "hidden",
              backgroundImage:    `url('${sheet.src}')`,
              backgroundSize:     `${SHEET_W * scale}px ${SHEET_H * scale}px`,
              backgroundPosition: `${bgX}px 0`,
              backgroundRepeat:   "no-repeat",
              filter:             glyphFilter,
              flexShrink:         0,
            }}
          />
        );
      })}
    </span>
  );
}

const SECTIONS: { id: SectionId; label: string }[] = [
  { id: "summary",    label: "Summary"    },
  { id: "experience", label: "Experience" },
  { id: "projects",   label: "Projects"   },
  { id: "skills",     label: "Skills"     },
  { id: "contact",    label: "Contact"    },
];


/* ─── Hover content panels ─── */

const panelText: React.CSSProperties = { color: "#fff", fontFamily: "var(--font-wii)" };

function SummaryContent() {
  return (
    <div style={{ padding: "1.4rem 1.8rem", display: "flex", flexDirection: "column", gap: "0.9rem" }}>
      <p style={{ ...panelText, fontSize: "0.82rem", lineHeight: 1.65, opacity: 0.92 }}>
        Computer Engineering student at the University of Waterloo with experience in full-stack
        development, workflow automation, and embedded systems. Passionate about building interactive
        systems and polished user experiences.
      </p>
      <div>
        <p style={{ ...panelText, fontSize: "0.72rem", opacity: 0.55, marginBottom: "0.4rem", letterSpacing: "0.08em" }}>CURRENT FOCUS</p>
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {["Full-stack web development", "Embedded systems & robotics", "UI/UX experimentation", "Workflow automation"].map(item => (
            <li key={item} style={{ ...panelText, fontSize: "0.78rem", opacity: 0.88, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#7ee8f4", flexShrink: 0, display: "inline-block" }} />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: "0.7rem" }}>
        <p style={{ ...panelText, fontSize: "0.75rem", opacity: 0.88 }}>University of Waterloo — BASc Computer Engineering</p>
        <p style={{ ...panelText, fontSize: "0.7rem", opacity: 0.5, marginTop: "0.2rem" }}>President's Scholarship of Distinction</p>
      </div>
    </div>
  );
}

function SkillsContent() {
  const cols = [
    { title: "Languages",   items: ["Java", "Python", "C / C++", "JavaScript"] },
    { title: "Frameworks",  items: ["React", "Next.js", "Node.js", "Tailwind", "Bootstrap"] },
    { title: "Tools",       items: ["Git", "npm", "MySQL", "STM32CubeIDE", "Arduino"] },
  ];

  const logos = [
    { icon: "java",      label: "Java"       },
    { icon: "py",        label: "Python"     },
    { icon: "cpp",       label: "C/C++"      },
    { icon: "js",        label: "JavaScript" },
    { icon: "react",     label: "React"      },
    { icon: "nextjs",    label: "Next.js"    },
    { icon: "nodejs",    label: "Node.js"    },
    { icon: "tailwind",  label: "Tailwind"   },
    { icon: "bootstrap", label: "Bootstrap"  },
    { icon: "git",       label: "Git"        },
    { icon: "mysql",     label: "MySQL"      },
    { icon: "arduino",   label: "Arduino"    },
  ];

  return (
    <div style={{ padding: "2rem 1.8rem 0.4rem", display: "flex", flexDirection: "column", gap: "1rem", height: "100%", justifyContent: "flex-start" }}>
      {/* Text columns */}
      <div style={{ display: "flex", gap: "1.5rem" }}>
        {cols.map(col => (
          <div key={col.title} style={{ flex: 1 }}>
            <p style={{ ...panelText, fontSize: "0.68rem", opacity: 0.5, letterSpacing: "0.08em", marginBottom: "0.5rem" }}>{col.title.toUpperCase()}</p>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
              {col.items.map(item => (
                <li key={item} style={{ ...panelText, fontSize: "0.78rem", opacity: 0.88, display: "flex", alignItems: "center", gap: "0.45rem" }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#7ee8f4", flexShrink: 0, display: "inline-block" }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Logo carousel */}
      <style>{`@keyframes logo-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
      <div style={{ overflow: "hidden", width: "100%", marginTop: "1.5rem" }}>
        <div style={{
          display:       "flex",
          flexDirection: "row",
          flexWrap:      "nowrap",
          gap:           "1.4rem",
          width:         "max-content",
          alignItems:    "center",
          animation:     "logo-scroll 14s linear infinite",
        }}>
          {[...logos, ...logos].map((l, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={`https://skillicons.dev/icons?i=${l.icon}`}
              alt={l.label}
              width={54}
              height={54}
              style={{ display: "block", flexShrink: 0 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ContactContent() {
  return (
    <div style={{ padding: "1.4rem 1.8rem", display: "flex", flexDirection: "column", gap: "1rem", justifyContent: "center", height: "100%" }}>
      <p style={{ ...panelText, fontSize: "0.78rem", opacity: 0.6 }}>Feel free to reach out through any of the following.</p>
      {[
        { label: "Email",    value: "omarsaraj164@gmail.com" },
        { label: "LinkedIn", value: "linkedin.com/in/omar-saraj" },
        { label: "GitHub",   value: "github.com/1sarajoma" },
      ].map(({ label, value }) => (
        <div key={label} style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
          <p style={{ ...panelText, fontSize: "0.65rem", opacity: 0.45, letterSpacing: "0.08em" }}>{label.toUpperCase()}</p>
          <p style={{ ...panelText, fontSize: "0.82rem", opacity: 0.92 }}>{value}</p>
        </div>
      ))}
    </div>
  );
}

/* ─── Preview panels ─── */

function SummaryPreview() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-8 preview-content">
      <div className="w-28 h-28 rounded-full bg-gradient-to-br from-sky-200 to-blue-400 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
        <svg viewBox="0 0 60 70" className="w-24 h-24 mt-4" fill="none">
          <circle cx="30" cy="20" r="13" fill="rgba(255,255,255,0.8)" />
          <ellipse cx="30" cy="57" rx="20" ry="16" fill="rgba(255,255,255,0.8)" />
        </svg>
      </div>
      <div className="w-36 h-3 bg-sky-200 rounded-full" />
      <div className="flex flex-col gap-2.5 w-full max-w-[220px]">
        <div className="h-2 bg-sky-100 rounded-full w-full" />
        <div className="h-2 bg-sky-100 rounded-full w-5/6 mx-auto" />
        <div className="h-2 bg-sky-100 rounded-full w-4/6 mx-auto" />
      </div>
      <div className="flex flex-wrap gap-2 justify-center mt-1">
        {["React", "TypeScript", "Node.js"].map((s) => (
          <span key={s} className="px-3 py-1 bg-sky-50 border border-sky-200 rounded-full text-xs font-bold text-sky-600">
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

function ExperiencePreview() {
  return (
    <div className="flex flex-col justify-center h-full px-10 py-8 gap-0 preview-content">
      {[
        { titleW: "w-3/5", lines: ["w-4/5", "w-2/5"] },
        { titleW: "w-2/3", lines: ["w-3/4", "w-1/3"] },
        { titleW: "w-1/2", lines: ["w-2/3", "w-2/5"] },
      ].map((item, i, arr) => (
        <div key={i} className="flex gap-5 items-start">
          <div className="flex flex-col items-center pt-1 flex-shrink-0">
            <div className="w-3.5 h-3.5 rounded-full bg-sky-400 border-2 border-white shadow-md" />
            {i < arr.length - 1 && <div className="w-0.5 h-12 bg-sky-200 mt-1" />}
          </div>
          <div className="pb-5">
            <div className={`h-3 bg-sky-300 rounded-full ${item.titleW} mb-2.5`} />
            {item.lines.map((w, j) => (
              <div key={j} className={`h-2 bg-sky-100 rounded-full ${w} mb-2`} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProjectsPreview() {
  return (
    <div className="grid grid-cols-2 gap-4 h-full p-5 preview-content">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200 p-4 flex flex-col gap-2.5 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-sky-200 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="rgb(8 145 178)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <div className="h-2.5 bg-sky-200 rounded-full w-3/4" />
          <div className="h-1.5 bg-sky-100 rounded-full w-full" />
          <div className="h-1.5 bg-sky-100 rounded-full w-2/3" />
        </div>
      ))}
    </div>
  );
}

function ContactPreview() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 py-8 gap-6 preview-content">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-sky-300 to-blue-500 flex items-center justify-center shadow-lg">
        <svg viewBox="0 0 24 24" className="w-11 h-11" fill="none" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8" />
          <rect x="3" y="6" width="18" height="13" rx="2" />
        </svg>
      </div>
      <div className="flex flex-col gap-4 w-full max-w-[220px]">
        {["Email", "LinkedIn", "GitHub"].map((label) => (
          <div key={label} className="flex items-center gap-3.5">
            <div className="w-8 h-8 rounded-full bg-sky-200 flex-shrink-0" />
            <div className="flex flex-col gap-1.5 flex-1">
              <div className="h-2 bg-sky-200 rounded-full w-full" />
              <div className="h-1.5 bg-sky-100 rounded-full w-3/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const PREVIEW_MAP: Record<SectionId, React.ReactNode> = {
  summary:    <SummaryPreview />,
  experience: <ExperiencePreview />,
  projects:   <ProjectsPreview />,
  skills:     <ProjectsPreview />,
  contact:    <ContactPreview />,
};

/* ─── Page ─── */

export default function Home() {
  const router   = useRouter();
  const [active,  setActive]  = useState<SectionId>("summary");
  const [hovered, setHovered] = useState<SectionId | null>(null);

  /* Preview follows hover; falls back to the active section */
  const shown = hovered ?? active;

  /* Button highlight: hover takes priority; if nothing hovered, active is highlighted */
  function isHighlighted(id: SectionId) {
    return hovered === id;
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      {/* ── Background video ── */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: 0, objectPosition: "center 20%" }}
      >
        <source src="/Video Object Remover-1778799876000.mp4" type="video/mp4" />
      </video>

      {/* ── Full-screen content ── */}
      <div className="relative z-10 flex flex-col h-full">

        {/* Main layout — fills full height */}
        <div className="flex flex-1 gap-4 px-5 py-5 min-h-0">

          {/* ── Left: big menu buttons ── */}
          <div className="flex flex-col gap-1 justify-center min-h-0" style={{ width: "41%", marginLeft: "2.8%", marginTop: "2.5%" }}>
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                className={`wii-button flex-none ${isHighlighted(s.id) ? "highlighted" : ""}`}
                style={{ height: "calc((100% - 36px) / 4 * 0.75)" }}
                onClick={() => s.id === "experience" ? router.push("/experience") : setActive(s.id)}
                onMouseEnter={() => setHovered(s.id)}
                onMouseLeave={() => setHovered(null)}
              >
                <span style={{ position: "relative", zIndex: 1 }}>
                  <WiiText text={s.label} />
                </span>
              </button>
            ))}
          </div>

          {/* ── Right: transparent — video shows through ── */}
          <div className="flex-1 min-h-0" />

        </div>
      </div>

      {/* ── Dark overlay over the centre-right panel to suppress the globe ── */}
      <div style={{
        position:        "absolute",
        left:            "45.3%",
        top:             "13%",
        width:           "50%",
        height:          "52.5%",
        background:      "rgba(0, 0, 0, 0.7)",
        borderRadius:    "2rem",
        zIndex:          5,
        pointerEvents:   "none",
      }} />

      {/* ── Name / info panel ── */}
      <div
        style={{
          position:  "absolute",
          left:      "45.3%",
          top:       "13%",
          width:     "50%",
          height:    "52.5%",
          zIndex:    15,
          display:   "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {hovered && (hovered === "summary" || hovered === "skills" || hovered === "contact") ? (
          <div style={{ width: "100%", height: "100%" }}>
            {hovered === "summary" && <SummaryContent />}
            {hovered === "skills"  && <SkillsContent />}
            {hovered === "contact" && <ContactContent />}
          </div>
        ) : hovered ? (
          <div style={{ textAlign: "center" }}>
            <WiiText text={SECTIONS.find(s => s.id === hovered)?.label ?? ""} scale={2.2} glyphFilter="none" />
            {hovered === "experience" && (
              <p style={{
                fontFamily: "var(--font-wii)",
                fontSize:   "0.9rem",
                color:      "#fff",
                marginTop:  "0.6rem",
                opacity:    0.8,
              }}>
                Click on the Experience button to view my technical experience
              </p>
            )}
          </div>
        ) : (
          <div style={{ textAlign: "center" }}>
            <WiiText text="Omar Saraj" scale={2.7} glyphFilter="none" />
            <p style={{
              fontFamily: "var(--font-wii)",
              fontSize:   "1rem",
              color:      "#fff",
              marginTop:  "0.6rem",
              whiteSpace: "nowrap",
            }}>
              Computer Engineering student at the University of Waterloo
            </p>
          </div>
        )}
      </div>

      {/* ── Icon tiles — tex1_168x128 texture, pinned over the video's coloured icon boxes ── */}

      {/* GitHub — over the purple dumbbell box (~58% × 74% on 16:9) */}
      <button
        className="wii-icon-tile flex flex-col items-center justify-center gap-1"
        onClick={() => window.open("https://github.com/1sarajoma", "_blank")}
        style={{
          position:            "absolute",
          left:                "58.5%",
          top:                 "81.5%",
          width:               "clamp(227px, 22.7vw, 392px)",
          height:              "calc(clamp(178px, 17.8vw, 308px) * 128 / 168)",
          zIndex:              20,
          backgroundImage:     "url('/tex1_168x128_2dc2b15cda7148e3_5.png')",
          backgroundSize:      "100% 100%",
          backgroundRepeat:    "no-repeat",
          backgroundPosition:  "center",
          border:              "none",
          outline:             "none",
        }}
      >
        <span style={{ position: "relative", zIndex: 1 }}>
          <svg viewBox="0 0 24 24" className="w-20 h-20 text-slate-700" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
          </svg>
        </span>
      </button>

      {/* LinkedIn — over the green triangle box (~84.5% × 74% on 16:9) */}
      <button
        className="wii-icon-tile flex flex-col items-center justify-center gap-1"
        onClick={() => window.open("https://www.linkedin.com/in/omar-saraj-1993a433a/", "_blank")}
        style={{
          position:            "absolute",
          left:                "82%",
          top:                 "81.5%",
          width:               "clamp(227px, 22.7vw, 392px)",
          height:              "calc(clamp(178px, 17.8vw, 308px) * 128 / 168)",
          zIndex:              20,
          backgroundImage:     "url('/tex1_168x128_2dc2b15cda7148e3_5.png')",
          backgroundSize:      "100% 100%",
          backgroundRepeat:    "no-repeat",
          backgroundPosition:  "center",
          border:              "none",
          outline:             "none",
        }}
      >
        <span style={{ position: "relative", zIndex: 1 }}>
          <svg viewBox="0 0 24 24" className="w-20 h-20 text-slate-700" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
            <rect x="2" y="9" width="4" height="12" />
            <circle cx="4" cy="4" r="2" />
          </svg>
        </span>
      </button>

    </main>
  );
}
