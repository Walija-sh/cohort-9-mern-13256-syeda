import { useEffect } from "react";
import { EditorContent, useEditor, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";

import NoteEditorToolbar from "@/components/notes/NoteEditorToolbar";

interface NoteEditorProps {
  content?: JSONContent;
  onChange: (content: JSONContent) => void;
}

function NoteEditor({ content, onChange }: Readonly<NoteEditorProps>) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: content ?? {
      type: "doc",
      content: [
        {
          type: "paragraph",
        },
      ],
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[400px] px-6 py-5 outline-none prose prose-sm max-w-none dark:prose-invert",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });

  useEffect(() => {
    if (!editor || !content) {
      return;
    }

    const currentContent = editor.getJSON();

    if (JSON.stringify(currentContent) !== JSON.stringify(content)) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  if (!editor) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <NoteEditorToolbar editor={editor} />

      <EditorContent editor={editor} />
    </div>
  );
}

export default NoteEditor;
