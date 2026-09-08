"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useSession } from "next-auth/react";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { saveAs } from "file-saver";
import ToolShell from "@/components/ToolShell";
import UpgradeGate from "@/components/UpgradeGate";

export default function WordEditorTool() {
  const { data: session } = useSession();

  const editor = useEditor({
    extensions: [StarterKit],
    content: "<h1>Untitled document</h1><p>Start typing…</p>",
    immediatelyRender: false
  });

  async function exportDocx() {
    if (!editor) return;
    const json = editor.getJSON();
    const paragraphs: Paragraph[] = [];

    for (const node of json.content || []) {
      const text = (node.content || []).map((c: any) => c.text || "").join("");
      if (node.type === "heading") {
        paragraphs.push(
          new Paragraph({
            text,
            heading: node.attrs?.level === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2
          })
        );
      } else if (node.type === "bulletList" || node.type === "orderedList") {
        for (const item of node.content || []) {
          const itemText = (item.content?.[0]?.content || []).map((c: any) => c.text || "").join("");
          paragraphs.push(new Paragraph({ text: `•  ${itemText}` }));
        }
      } else {
        paragraphs.push(new Paragraph({ children: [new TextRun(text)] }));
      }
    }

    const doc = new Document({ sections: [{ children: paragraphs }] });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, "document.docx");
  }

  return (
    <ToolShell slug="word-editor">
      <UpgradeGate isPro={true}>
        <div className="bg-white text-black rounded-md p-4">
          <div className="flex gap-2 mb-3 border-b border-gray-200 pb-2">
            <button onClick={() => editor?.chain().focus().toggleBold().run()} className="px-2 py-1 text-sm font-bold hover:bg-gray-100 rounded">B</button>
            <button onClick={() => editor?.chain().focus().toggleItalic().run()} className="px-2 py-1 text-sm italic hover:bg-gray-100 rounded">I</button>
            <button onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} className="px-2 py-1 text-sm hover:bg-gray-100 rounded">H1</button>
            <button onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className="px-2 py-1 text-sm hover:bg-gray-100 rounded">H2</button>
            <button onClick={() => editor?.chain().focus().toggleBulletList().run()} className="px-2 py-1 text-sm hover:bg-gray-100 rounded">• List</button>
          </div>
          <EditorContent editor={editor} className="min-h-[16rem] prose prose-sm max-w-none focus:outline-none" />
        </div>

        <button
          onClick={exportDocx}
          className="mt-6 bg-amber text-ink font-medium px-5 py-2.5 rounded-sm hover:bg-amberDeep transition-colors"
        >
          Export as .docx
        </button>
      </UpgradeGate>
    </ToolShell>
  );
}
