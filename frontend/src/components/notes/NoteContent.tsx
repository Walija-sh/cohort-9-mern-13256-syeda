import { renderToReactElement } from "@tiptap/static-renderer";
import type { JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";

interface NoteContentProps {
  content: JSONContent;
}

const extensions = [
  StarterKit,
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
];

function NoteContent({ content }: Readonly<NoteContentProps>) {
  return (
    <div className="tiptap">
      {renderToReactElement({
        content,
        extensions,
      })}
    </div>
  );
}

export default NoteContent;
