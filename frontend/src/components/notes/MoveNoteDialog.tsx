import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getAllFolders } from "@/store/folderSlice";
import { updateNote } from "@/store/noteSlice";
import type { Note } from "@/types/note";

interface MoveNoteDialogProps {
  note: Note;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMoved?: () => void;
}

function MoveNoteDialog({
  note,
  open,
  onOpenChange,
  onMoved,
}: Readonly<MoveNoteDialogProps>) {
  const dispatch = useAppDispatch();

  const { folders } = useAppSelector((state) => state.folders);
  const { isLoading } = useAppSelector((state) => state.notes);

  const [selectedFolder, setSelectedFolder] = useState(note.parentFolder ?? "");

  useEffect(() => {
    if (!open) {
      return;
    }

    if (folders.length === 0) {
      dispatch(getAllFolders());
    }
  }, [open, note.parentFolder, folders.length, dispatch]);

  const handleMove = async () => {
    try {
      await dispatch(
        updateNote({
          id: note._id,
          payload: {
            parentFolder: selectedFolder || null,
          },
        }),
      ).unwrap();

      onOpenChange(false);
      onMoved?.();
    } catch {
      // rejection already captured in redux
    }
  };

  const isSameFolder = (note.parentFolder ?? "") === selectedFolder;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move note</DialogTitle>

          <DialogDescription>
            Choose where you want to move "{note.title}".
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label htmlFor="note-folder" className="text-sm font-medium">
            Folder
          </label>

          <select
            id="note-folder"
            value={selectedFolder}
            onChange={(event) => setSelectedFolder(event.target.value)}
            disabled={isLoading}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
          >
            <option value="">No Folder</option>

            {folders.map((folder) => (
              <option key={folder._id} value={folder._id}>
                {folder.name}
              </option>
            ))}
          </select>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>

          <Button
            onClick={() => void handleMove()}
            disabled={isLoading || isSameFolder}
          >
            {isLoading ? "Moving..." : "Move note"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default MoveNoteDialog;
