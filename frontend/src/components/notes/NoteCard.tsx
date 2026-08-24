import { MoreVertical, Trash2, FolderInput } from "lucide-react";
import { useState } from "react";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import MoveNoteDialog from "@/components/notes/MoveNoteDialog";

import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { deleteNote } from "@/store/noteSlice";
import type { Note } from "@/types/note";

interface NoteCardProps {
  note: Note;
  onClick: (note: Note) => void;
  onChanged?: () => void;
}

function NoteCard({ note, onClick, onChanged }: NoteCardProps) {
  const dispatch = useAppDispatch();

  const { isLoading } = useAppSelector((state) => state.notes);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isMoveOpen, setIsMoveOpen] = useState(false);

  const handleDelete = async () => {
    const result = await dispatch(deleteNote(note._id));

    if (deleteNote.fulfilled.match(result)) {
      setIsDeleteOpen(false);
      onChanged?.();
    }
  };

  const handleCardClick = () => {
    onClick(note);
  };

  return (
    <>
      <Card
        role="button"
        tabIndex={0}
        className="cursor-pointer transition-colors hover:border-primary/40"
        onClick={handleCardClick}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleCardClick();
          }
        }}
      >
        <CardContent className="flex items-start gap-3 p-4">
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-sm font-semibold">{note.title}</h3>

            <p className="mt-3 text-xs text-muted-foreground">
              Updated{" "}
              {new Date(note.updatedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label={`Actions for ${note.title}`}
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              <MoreVertical className="size-4" />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation();
                  setIsMoveOpen(true);
                }}
              >
                <FolderInput className="size-4" />
                Move to folder
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                variant="destructive"
                onClick={(event) => {
                  event.stopPropagation();
                  setIsDeleteOpen(true);
                }}
              >
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>

      <MoveNoteDialog
        note={note}
        open={isMoveOpen}
        onOpenChange={setIsMoveOpen}
        onMoved={onChanged}
      />

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title={`Delete "${note.title}"?`}
        description="This will permanently delete this note. This action cannot be undone."
        confirmLabel="Delete note"
        isLoading={isLoading}
        onConfirm={() => void handleDelete()}
      />
    </>
  );
}

export default NoteCard;
