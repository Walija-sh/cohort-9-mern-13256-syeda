import api from "@/lib/axios";
import type {
  CreateFolderPayload,
  DeleteFolderResponse,
  ExplorerFolderResponse,
  ExplorerRootResponse,
  FolderResponse,
  FoldersResponse,
  UpdateFolderPayload,
} from "@/types/folder";

const createFolder = async (
  payload: CreateFolderPayload,
): Promise<FolderResponse> => {
  const response = await api.post<FolderResponse>("/folders", payload);
  return response.data;
};

const getAllFolders = async (): Promise<FoldersResponse> => {
  const response = await api.get<FoldersResponse>("/folders");
  return response.data;
};

const getFolderById = async (id: string): Promise<FolderResponse> => {
  const response = await api.get<FolderResponse>(`/folders/${id}`);
  return response.data;
};

const updateFolder = async (
  id: string,
  payload: UpdateFolderPayload,
): Promise<FolderResponse> => {
  const response = await api.patch<FolderResponse>(
    `/folders/${id}`,
    payload,
  );
  return response.data;
};

const deleteFolder = async (
  id: string,
): Promise<DeleteFolderResponse> => {
  const response = await api.delete<DeleteFolderResponse>(
    `/folders/${id}`,
  );
  return response.data;
};

const getExplorerContents = async (
  folderId?: string,
): Promise<ExplorerRootResponse | ExplorerFolderResponse> => {
  const response = await api.get<
    ExplorerRootResponse | ExplorerFolderResponse
  >("/folders/explorer", {
    params: folderId ? { folderId } : undefined,
  });

  return response.data;
};

const folderService = {
  createFolder,
  getAllFolders,
  getFolderById,
  updateFolder,
  deleteFolder,
  getExplorerContents,
};

export default folderService;