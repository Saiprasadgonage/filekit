import { ResumeData } from "./types";

export default function ModernTemplate({ data }: { data: ResumeData }) {
  const skills = data.skills.split(",").map((s) => s.trim()).filter(Boolean);
  const accent = "#C1553A";

  return (
    <div style={{ fontFamily: "Helvetica, Arial, sans-serif", color: "#1a1a1a", display: "flex", minHeight: 700 }}>
      <aside style={{ width: "34%", background: "#1f2430", color: "#fff", padding: "36px 24px" }}>
        <h1 style={{ fontSize: 22, margin: 0, fontWeight: 700, lineHeight: 1.2 }}>{data.name || "Your Name"}</h1>
        {data.title && <p style={{ fontSize: 12, margin: "6px 0 0", color: accent, fontWeight: 600 }}>{data.title}</p>}

        <div style={{ marginTop: 28 }}>
          <h3 style={sideHeading(accent)}>Contact</h3>
          <ul style={{ listStyle: "none", padding: 0, margin: "8px 0 0", fontSize: 11, lineHeight: 1.9 }}>
            {data.email && <li>{data.email}</li>}
            {data.phone && <li>{data.phone}</li>}
            {data.location && <li>{data.location}</li>}
            {data.website && <li>{data.website}</li>}
          </ul>
        </div>

        {skills.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <h3 style={sideHeading(accent)}>Skills</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
              {skills.map((s, i) => (
                <span
                  key={i}
                  style={{ fontSize: 10.5, background: "rgba(255,255,255,0.1)", padding: "4px 9px", borderRadius: 3 }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {data.education.some((e) => e.school || e.degree) && (
          <div style={{ marginTop: 24 }}>
            <h3 style={sideHeading(accent)}>Education</h3>
            {data.education.map((ed) => (
              <div key={ed.id} style={{ marginTop: 10, fontSize: 11, lineHeight: 1.5 }}>
                <strong>{ed.degree}</strong>
                <div style={{ color: "#c7c9d1" }}>{ed.school}</div>
                <div style={{ color: "#8b8e99" }}>{ed.year}</div>
              </div>
            ))}
          </div>
        )}
      </aside>

      <main style={{ flex: 1, padding: "36px 32px" }}>
        {data.summary && (
          <section>
            <h2 style={mainHeading(accent)}>Profile</h2>
            <p style={{ fontSize: 12.5, lineHeight: 1.7, marginTop: 8 }}>{data.summary}</p>
          </section>
        )}

        {data.experience.some((e) => e.title || e.company) && (
          <section style={{ marginTop: 26 }}>
            <h2 style={mainHeading(accent)}>Experience</h2>
            {data.experience.map((exp) => (
              <div key={exp.id} style={{ marginTop: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <strong>{exp.title}</strong>
                  <span style={{ color: "#888", fontSize: 11 }}>{[exp.start, exp.end].filter(Boolean).join(" – ")}</span>
                </div>
                <div style={{ fontSize: 12, color: accent, fontWeight: 600 }}>{exp.company}</div>
                <ul style={{ margin: "6px 0 0", paddingLeft: 16, fontSize: 12, lineHeight: 1.6 }}>
                  {exp.bullets.split("\n").filter(Boolean).map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

function sideHeading(accent: string): React.CSSProperties {
  return { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: accent, margin: 0 };
}
function mainHeading(accent: string): React.CSSProperties {
  return {
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    margin: 0,
    borderBottom: `2px solid ${accent}`,
    display: "inline-block",
    paddingBottom: 4
  };
}
