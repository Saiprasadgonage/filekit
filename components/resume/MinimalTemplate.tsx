import { ResumeData } from "./types";

export default function MinimalTemplate({ data }: { data: ResumeData }) {
  const skills = data.skills.split(",").map((s) => s.trim()).filter(Boolean);

  return (
    <div style={{ fontFamily: "'Courier New', monospace", color: "#111", padding: "36px 40px", fontSize: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h1 style={{ fontSize: 20, margin: 0, fontWeight: 700 }}>{data.name || "Your Name"}</h1>
        <span style={{ fontSize: 10.5, color: "#555" }}>{data.title}</span>
      </div>
      <p style={{ fontSize: 10.5, color: "#555", margin: "4px 0 0" }}>
        {[data.email, data.phone, data.location, data.website].filter(Boolean).join(" / ")}
      </p>

      <hr style={{ border: 0, borderTop: "1px solid #ccc", margin: "16px 0" }} />

      {data.summary && (
        <section>
          <p style={{ margin: 0, lineHeight: 1.6 }}>{data.summary}</p>
        </section>
      )}

      {data.experience.some((e) => e.title || e.company) && (
        <section style={{ marginTop: 18 }}>
          <p style={label}>EXPERIENCE</p>
          {data.experience.map((exp) => (
            <div key={exp.id} style={{ marginTop: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>
                  <strong>{exp.title}</strong> — {exp.company}
                </span>
                <span style={{ color: "#666" }}>{[exp.start, exp.end].filter(Boolean).join(" - ")}</span>
              </div>
              {exp.bullets.split("\n").filter(Boolean).map((b, i) => (
                <div key={i} style={{ paddingLeft: 12, color: "#333", lineHeight: 1.6 }}>
                  - {b}
                </div>
              ))}
            </div>
          ))}
        </section>
      )}

      {data.education.some((e) => e.school || e.degree) && (
        <section style={{ marginTop: 18 }}>
          <p style={label}>EDUCATION</p>
          {data.education.map((ed) => (
            <div key={ed.id} style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span>{ed.degree} — {ed.school}</span>
              <span style={{ color: "#666" }}>{ed.year}</span>
            </div>
          ))}
        </section>
      )}

      {skills.length > 0 && (
        <section style={{ marginTop: 18 }}>
          <p style={label}>SKILLS</p>
          <p style={{ margin: 0 }}>{skills.join(", ")}</p>
        </section>
      )}
    </div>
  );
}

const label: React.CSSProperties = {
  fontSize: 10.5,
  letterSpacing: "0.1em",
  color: "#888",
  margin: 0,
  fontWeight: 700
};
