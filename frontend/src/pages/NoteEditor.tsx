import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { JSONContent } from "@tiptap/core";

import NoteEditorInput from "@/components/notes/NoteEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearCurrentNote,
  createNote,
  getNoteById,
  updateNote,
} from "@/store/noteSlice";

const emptyContent: JSONContent = {
  type: "doc",
  content: [
    {
      type: "paragraph",
    },
  ],
};

interface NoteEditorFormProps {
  noteId?: string;
  folderId?: string;
  initialTitle: string;
  initialContent: JSONContent;
  isLoading: boolean;
  error: string | null;
}

function NoteEditorForm({
  noteId,
  folderId,
  initialTitle,
  initialContent,
  isLoading,
  error,
}: Readonly<NoteEditorFormProps>) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const isEditing = Boolean(noteId);
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState<JSONContent>(initialContent);

  const handleBack = () => {
    navigate(-1);
  };

  const handleSave = async () => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return;
    }

    try {
      if (isEditing && noteId) {
        await dispatch(
          updateNote({
            id: noteId,
            payload: {
              title: trimmedTitle,
              content,
            },
          }),
        ).unwrap();

        navigate(`/dashboard/notes/${noteId}`);
        return;
      }

      const result = await dispatch(
        createNote({
          title: trimmedTitle,
          content,
          parentFolder: folderId ?? null,
        }),
      ).unwrap();

      navigate(`/dashboard/notes/${result._id}`);
    } catch {
      // rejection already captured in redux
    }
  };

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="size-4" />
          Cancel
        </Button>

        <Button onClick={handleSave} disabled={isLoading || !title.trim()}>
          <Save className="size-4" />
          {isLoading ? "Saving..." : "Save"}
        </Button>
      </div>

      <div className="space-y-6">
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Note title"
          maxLength={200}
          className="border-0 px-0 py-2 text-3xl font-semibold shadow-none focus-visible:ring-0 lg:text-4xl"
        />

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <NoteEditorInput content={content} onChange={setContent} />
      </div>
    </section>
  );
}

function NoteEditor() {
  const { id, folderId } = useParams<{
    id: string;
    folderId: string;
  }>();
  const dispatch = useAppDispatch();

  const isEditing = Boolean(id);

  const { currentNote, isLoading, error } = useAppSelector(
    (state) => state.notes,
  );

  useEffect(() => {
    if (!id) {
      dispatch(clearCurrentNote());
      return;
    }

    dispatch(getNoteById(id));

    return () => {
      dispatch(clearCurrentNote());
    };
  }, [dispatch, id]);

  const noteForEditor =
    isEditing && currentNote?._id === id ? currentNote : null;

  if (isEditing && isLoading && !noteForEditor) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        Loading note...
      </div>
    );
  }

  if (isEditing && !noteForEditor) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        {error || "Note not found."}
      </div>
    );
  }

  return (
    <NoteEditorForm
      key={id ?? `new-${folderId ?? "root"}`}
      noteId={id}
      folderId={folderId}
      initialTitle={noteForEditor?.title ?? ""}
      initialContent={noteForEditor?.content ?? emptyContent}
      isLoading={isLoading}
      error={error}
    />
  );
}

export default NoteEditor;
