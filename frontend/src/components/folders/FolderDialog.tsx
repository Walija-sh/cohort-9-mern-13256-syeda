import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createFolder, updateFolder } from "@/store/folderSlice";
import type { Folder } from "@/types/folder";

interface FolderDialogProps {
  folder?: Folder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function FolderDialog({ folder, open, onOpenChange }: FolderDialogProps) {
  return (
    <FolderDialogForm
      key={`${folder?._id ?? "create"}-${open}`}
      folder={folder}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}

function FolderDialogForm({ folder, open, onOpenChange }: FolderDialogProps) {
  const dispatch = useAppDispatch();

  const { isLoading, error } = useAppSelector((state) => state.folders);

  const [name, setName] = useState(folder?.name ?? "");

  const isEditing = Boolean(folder);

  const handleSubmit = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    if (folder) {
      const result = await dispatch(
        updateFolder({
          id: folder._id,
          payload: {
            name: trimmedName,
          },
        }),
      );

      if (updateFolder.fulfilled.match(result)) {
        onOpenChange(false);
      }

      return;
    }

    const result = await dispatch(
      createFolder({
        name: trimmedName,
      }),
    );

    if (createFolder.fulfilled.match(result)) {
      onOpenChange(false);
      setName("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Rename folder" : "Create folder"}
          </DialogTitle>

          <DialogDescription>
            {isEditing
              ? "Update the name of this folder."
              : "Create a new folder to organize your notes."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Folder name"
            maxLength={100}
            autoFocus
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void handleSubmit();
              }
            }}
          />

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>

          <Button onClick={handleSubmit} disabled={isLoading || !name.trim()}>
            {isLoading
              ? isEditing
                ? "Saving..."
                : "Creating..."
              : isEditing
                ? "Save changes"
                : "Create folder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default FolderDialog;
