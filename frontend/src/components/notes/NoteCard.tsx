import { MoreVertical, Trash2, FolderInput, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
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

const NOTE_COLORS = [
  "bg-yellow-100 dark:bg-yellow-900/40",
  "bg-blue-100 dark:bg-blue-900/40",
  "bg-pink-100 dark:bg-pink-900/40",
  "bg-green-100 dark:bg-green-900/40",
  "bg-purple-100 dark:bg-purple-900/40",
  "bg-orange-100 dark:bg-orange-900/40",
];

function NoteCard({ note, onClick, onChanged }: NoteCardProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { isLoading } = useAppSelector((state) => state.notes);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isMoveOpen, setIsMoveOpen] = useState(false);

  const colorIndex =
    note._id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) %
    NOTE_COLORS.length;

  const noteColor = NOTE_COLORS[colorIndex];

  const handleDelete = async () => {
    try {
      await dispatch(deleteNote(note._id)).unwrap();

      setIsDeleteOpen(false);
      onChanged?.();
    } catch {
      // rejection already captured in redux
    }
  };

  const handleCardClick = () => {
    onClick(note);
  };

  const handleEdit = () => {
    navigate(`/dashboard/notes/${note._id}/edit`);
  };

  return (
    <>
      <Card
        className={`group relative overflow-hidden rounded-none transition-all hover:shadow-md ${noteColor}`}
      >
        <CardContent className="flex p-5">
          <div
            role="button"
            tabIndex={0}
            className="flex flex-1 cursor-pointer flex-col"
            onClick={handleCardClick}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleCardClick();
              }
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="line-clamp-3 min-w-0 flex-1 text-lg font-semibold group-hover:text-primary">
                {note.title}
              </h3>
            </div>

            <div className="flex-1" />

            <p className="text-xs text-muted-foreground">
              [
              {new Date(note.updatedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
              ]
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground ml-auto"
              aria-label={`Actions for ${note.title}`}
            >
              <MoreVertical className="size-4" />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              <DropdownMenuItem onClick={handleEdit}>
                <Pencil className="size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsMoveOpen(true)}>
                <FolderInput className="size-4" />
                Move to folder
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                variant="destructive"
                onClick={() => setIsDeleteOpen(true)}
              >
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>

      {isMoveOpen && (
        <MoveNoteDialog
          note={note}
          open={isMoveOpen}
          onOpenChange={setIsMoveOpen}
          onMoved={onChanged}
        />
      )}

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
