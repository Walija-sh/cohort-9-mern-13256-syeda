import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import FolderCard from "@/components/folders/FolderCard";
import FolderDialog from "@/components/folders/FolderDialog";
import NoteCard from "@/components/notes/NoteCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getExplorerContents } from "@/store/folderSlice";
import { clearError as clearFolderError } from "@/store/folderSlice";
import {
  clearError as clearNoteError,
  clearNotes,
  setNotes,
} from "@/store/noteSlice";

function Explorer() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { folderId } = useParams<{ folderId: string }>();

  const [folderDialogOpen, setFolderDialogOpen] = useState(false);

  const {
    folders,
    currentFolder,
    isLoading: foldersLoading,
    error: folderError,
  } = useAppSelector((state) => state.folders);

  const {
    notes,
    isLoading: notesLoading,
    error: noteError,
  } = useAppSelector((state) => state.notes);

  const isLoading = foldersLoading || notesLoading;
  const error = folderError || noteError;

  const loadExplorer = useCallback(async () => {
    dispatch(clearNotes());

    const result = await dispatch(getExplorerContents(folderId));

    if (getExplorerContents.fulfilled.match(result)) {
      dispatch(setNotes(result.payload.data.notes));
    }
  }, [dispatch, folderId]);

  useEffect(() => {
    void loadExplorer();
  }, [loadExplorer]);

  const handleFolderClick = (folderId: string) => {
    navigate(`/dashboard/folders/${folderId}`);
  };

  const handleNoteClick = (noteId: string) => {
    navigate(`/dashboard/notes/${noteId}`);
  };

  const handleCreateNote = () => {
    if (folderId) {
      navigate(`/dashboard/folders/${folderId}/notes/new`);
      return;
    }

    navigate("/dashboard/notes/new");
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  const handleRetry = () => {
    dispatch(clearFolderError());
    dispatch(clearNoteError());
    void loadExplorer();
  };

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold tracking-tight">
            {currentFolder ? currentFolder.name : "Notes"}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {currentFolder
              ? "Notes inside this folder."
              : "Your notes and folders."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {!currentFolder && (
            <Button
              variant="outline"
              onClick={() => setFolderDialogOpen(true)}
            >
              <Plus className="size-4" />
              New Folder
            </Button>
          )}

          <Button onClick={handleCreateNote}>
            <Plus className="size-4" />
            New Note
          </Button>
        </div>
      </div>

      {/* Create Folder Dialog */}
      <FolderDialog
        open={folderDialogOpen}
        onOpenChange={setFolderDialogOpen}
      />

      {/* Back button when inside a folder */}
      {currentFolder && (
        <Button
          variant="ghost"
          className="-ml-2"
          onClick={handleBack}
        >
          <span aria-hidden="true">&larr;</span>
          Back to notes
        </Button>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="py-12 text-center text-sm text-muted-foreground">
          Loading...
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <Card className="border-destructive/30">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-destructive">{error}</p>

            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={handleRetry}
            >
              Try again
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && (
        <>
          {/* Root folders */}
          {!currentFolder && (
            <section className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold">Folders</h2>
              </div>

              {folders.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {folders.map((folder) => (
                    <FolderCard
                      key={folder._id}
                      folder={folder}
                      onClick={() => handleFolderClick(folder._id)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No folders yet.
                </p>
              )}
            </section>
          )}

          {/* Notes */}
          <section className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold">Notes</h2>
            </div>

            {notes.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {notes.map((note) => (
                  <NoteCard
                    key={note._id}
                    note={note}
                    onClick={() => handleNoteClick(note._id)}
                    onChanged={() => void loadExplorer()}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    {currentFolder
                      ? "This folder has no notes yet."
                      : "You don't have any notes yet."}
                  </p>

                  <Button
                    className="mt-4"
                    onClick={handleCreateNote}
                  >
                    <Plus className="size-4" />
                    Create note
                  </Button>
                </CardContent>
              </Card>
            )}
          </section>
        </>
      )}
    </section>
  );
}

export default Explorer;
