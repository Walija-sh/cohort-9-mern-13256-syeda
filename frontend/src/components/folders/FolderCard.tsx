import {
  Folder as FolderIcon,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import FolderDialog from "@/components/folders/FolderDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { deleteFolder } from "@/store/folderSlice";
import type { Folder } from "@/types/folder";

interface FolderCardProps {
  folder: Folder;
  onClick: (folder: Folder) => void;
}

function FolderCard({ folder, onClick }: FolderCardProps) {
  const dispatch = useAppDispatch();

  const { isLoading } = useAppSelector((state) => state.folders);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleDelete = async () => {
    const result = await dispatch(deleteFolder(folder._id));

    if (deleteFolder.fulfilled.match(result)) {
      setIsDeleteOpen(false);
    }
  };

  return (
    <>
      <Card className="transition-colors hover:border-primary/40">
        <CardContent className="flex items-center gap-3 p-4">
          <div
            role="button"
            tabIndex={0}
            className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 outline-none"
            onClick={() => onClick(folder)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick(folder);
              }
            }}
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <FolderIcon className="size-4" />
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold">{folder.name}</h3>

              <p className="mt-0.5 text-xs text-muted-foreground">Folder</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0"
                  aria-label={`Actions for ${folder.name}`}
                >
                  <MoreVertical className="size-4" />
                </Button>
              }
            />

            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setIsEditOpen(true);
                }}
              >
                <Pencil className="size-4" />
                Rename
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
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

      <FolderDialog
        folder={folder}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title={`Delete "${folder.name}"?`}
        description="This will permanently delete this folder and all notes inside it. This action cannot be undone."
        confirmLabel="Delete folder"
        isLoading={isLoading}
        onConfirm={() => void handleDelete()}
      />
    </>
  );
}

export default FolderCard;
