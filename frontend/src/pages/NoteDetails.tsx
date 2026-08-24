import { ArrowLeft, Pencil } from "lucide-react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import NoteContent from "@/components/notes/NoteContent";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearCurrentNote, getNoteById } from "@/store/noteSlice";

function NoteDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { currentNote, isLoading, error } = useAppSelector(
    (state) => state.notes,
  );

  useEffect(() => {
    if (!id) {
      return;
    }

    dispatch(getNoteById(id));

    return () => {
      dispatch(clearCurrentNote());
    };
  }, [dispatch, id]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleEdit = () => {
    if (!id) {
      return;
    }

    navigate(`/dashboard/notes/${id}/edit`);
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        Loading note...
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="size-4" />
          Back
        </Button>

        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  if (!currentNote) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="size-4" />
          Back
        </Button>

        <div className="py-12 text-center">
          <h1 className="font-medium">Note not found</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            This note may have been deleted or no longer exists.
          </p>
        </div>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="size-4" />
          Back
        </Button>

        <Button variant="outline" onClick={handleEdit}>
          <Pencil className="size-4" />
          Edit
        </Button>
      </div>

      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          {currentNote.title}
        </h1>

        <p className="text-sm text-muted-foreground">
          Updated{" "}
          {new Date(currentNote.updatedAt).toLocaleDateString(undefined, {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </header>

      <div className="border-t pt-8">
        <NoteContent content={currentNote.content} />
      </div>
    </article>
  );
}

export default NoteDetails;