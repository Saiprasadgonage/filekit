export type ExperienceEntry = {
  id: string;
  title: string;
  company: string;
  start: string;
  end: string;
  bullets: string; // one bullet per line, split on render
};

export type EducationEntry = {
  id: string;
  school: string;
  degree: string;
  year: string;
};

export type ResumeData = {
  name: string;
  title: string; // e.g. "Product Designer"
  email: string;
  phone: string;
  location: string;
  website: string;
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: string; // comma-separated
};

export const emptyResume: ResumeData = {
  name: "",
  title: "",
  email: "",
  phone: "",
  location: "",
  website: "",
  summary: "",
  experience: [{ id: "e1", title: "", company: "", start: "", end: "", bullets: "" }],
  education: [{ id: "d1", school: "", degree: "", year: "" }],
  skills: ""
};

export type TemplateId = "classic" | "modern" | "minimal";

export const TEMPLATES: { id: TemplateId; name: string; blurb: string }[] = [
  { id: "classic", name: "Classic", blurb: "Serif headings, centered header. Safe for any industry." },
  { id: "modern", name: "Modern", blurb: "Sidebar layout with an accent color. Good for design/tech." },
  { id: "minimal", name: "Minimal", blurb: "Compact mono labels, no color. Fits on one page easily." }
];
