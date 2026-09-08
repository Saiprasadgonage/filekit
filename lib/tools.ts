export type Tool = {
  slug: string;
  name: string;
  description: string;
  icon: string;
  format: string;
  pro: boolean;
  runsServerSide: boolean;
};

export const TOOLS: Tool[] = [
  {
    slug: "image-resize",
    name: "Image Crop & Resize",
    description: "Crop, resize and compress JPG/PNG/WebP images.",
    icon: "🖼️",
    format: "JPG · PNG · WEBP",
    pro: false,
    runsServerSide: false
  },
  {
    slug: "pdf-merge",
    name: "PDF Merge",
    description: "Combine multiple PDFs into one, in any order.",
    icon: "📎",
    format: "PDF",
    pro: false,
    runsServerSide: false
  },
  {
    slug: "pdf-compress",
    name: "PDF Size Reducer",
    description: "Shrink PDF file size by re-compressing embedded images.",
    icon: "📉",
    format: "PDF",
    pro: false,
    runsServerSide: false
  },
  {
    slug: "word-to-pdf",
    name: "Word to PDF",
    description: "Convert .docx files to PDF, formatting preserved.",
    icon: "📄",
    format: "DOCX → PDF",
    pro: false,
    runsServerSide: false
  },
  {
    slug: "background-remover",
    name: "Background Remover",
    description: "Cut the background out of a photo automatically.",
    icon: "✂️",
    format: "PNG · JPG",
    pro: false,
    runsServerSide: false
  },
  {
    slug: "noise-reducer",
    name: "Audio Noise Reducer",
    description: "Reduce steady background hiss and hum in a recording.",
    icon: "🎚️",
    format: "WAV · MP3",
    pro: false,
    runsServerSide: false
  },
  {
    slug: "pdf-editor",
    name: "PDF Editor",
    description: "Add text, rotate, reorder or delete pages in a PDF.",
    icon: "✏️",
    format: "PDF",
    pro: true,
    runsServerSide: false
  },
  {
    slug: "word-editor",
    name: "Word Editor",
    description: "Write and format a document, export straight to .docx.",
    icon: "📝",
    format: "DOCX",
    pro: true,
    runsServerSide: false
  },
  {
    slug: "watermark-remover",
    name: "Watermark Eraser (your own images)",
    description: "Paint over a mark you added to your own photo and blend it out.",
    icon: "🩹",
    format: "PNG · JPG",
    pro: true,
    runsServerSide: false
  },
  {
    slug: "resume-generator",
    name: "Resume Generator",
    description: "Answer a few questions, pick a style, get a polished resume PDF.",
    icon: "🧾",
    format: "ANSWERS → PDF",
    pro: true,
    runsServerSide: false
  },
  {
    slug: "ai-image",
    name: "AI Image Generator",
    description: "Generate an image from a text prompt.",
    icon: "✨",
    format: "PROMPT → PNG",
    pro: true,
    runsServerSide: true
  },
  {
    slug: "ai-sound",
    name: "AI Sound Generator",
    description: "Generate a short sound or music clip from a text prompt.",
    icon: "🔊",
    format: "PROMPT → WAV",
    pro: true,
    runsServerSide: true
  }
];

export function getTool(slug: string) {
  return TOOLS.find((t) => t.slug === slug);
}
