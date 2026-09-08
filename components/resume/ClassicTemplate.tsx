import { ResumeData } from "./types";

export default function ClassicTemplate({ data }: { data: ResumeData }) {
  const skills = data.skills.split(",").map((s) => s.trim()).filter(Boolean);

  return (
    <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: "#1a1a1a", padding: "40px 48px" }}>
      <div style={{ textAlign: "center", borderBottom: "2px solid #1a1a1a", paddingBottom: 16 }}>
        <h1 style={{ fontSize: 28, margin: 0, letterSpacing: "0.02em" }}>{data.name || "Your Name"}</h1>
        {data.title && <p style={{ fontSize: 14, margin: "4px 0 0", color: "#555" }}>{data.title}</p>}
        <p style={{ fontSize: 12, margin: "8px 0 0", color: "#555" }}>
          {[data.email, data.phone, data.location, data.website].filter(Boolean).join("  ·  ")}
        </p>
      </div>

      {data.summary && (
        <section style={{ marginTop: 20 }}>
          <p style={{ fontSize: 13, lineHeight: 1.6, margin: 0 }}>{data.summary}</p>
        </section>
      )}

      {data.experience.some((e) => e.title || e.company) && (
        <section style={{ marginTop: 24 }}>
          <h2 style={sectionHeading}>Experience</h2>
          {data.experience.map((exp) => (
            <div key={exp.id} style={{ marginTop: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <strong>{exp.title}{exp.company ? `, ${exp.company}` : ""}</strong>
                <span style={{ color: "#666" }}>{[exp.start, exp.end].filter(Boolean).join(" – ")}</span>
              </div>
              <ul style={{ margin: "6px 0 0", paddingLeft: 18, fontSize: 12.5, lineHeight: 1.6 }}>
                {exp.bullets.split("\n").filter(Boolean).map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {data.education.some((e) => e.school || e.degree) && (
        <section style={{ marginTop: 24 }}>
          <h2 style={sectionHeading}>Education</h2>
          {data.education.map((ed) => (
            <div key={ed.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 6 }}>
              <span><strong>{ed.degree}</strong>{ed.school ? `, ${ed.school}` : ""}</span>
              <span style={{ color: "#666" }}>{ed.year}</span>
            </div>
          ))}
        </section>
      )}

      {skills.length > 0 && (
        <section style={{ marginTop: 24 }}>
          <h2 style={sectionHeading}>Skills</h2>
          <p style={{ fontSize: 12.5, margin: 0 }}>{skills.join("  ·  ")}</p>
        </section>
      )}
    </div>
  );
}

const sectionHeading: React.CSSProperties = {
  fontSize: 14,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  borderBottom: "1px solid #ccc",
  paddingBottom: 4,
  margin: 0
};
