import { beforeEach, describe, expect, it, vi } from "vitest";

import api from "@/lib/axios";
import folderService from "@/services/folderService";
import type {
  DeleteFolderResponse,
  ExplorerFolderResponse,
  ExplorerRootResponse,
  Folder,
  FolderResponse,
  FoldersResponse,
} from "@/types/folder";

vi.mock("@/lib/axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedApi = vi.mocked(api);

const mockFolder: Folder = {
  _id: "folder-1",
  name: "Work",
  owner: "user-1",
  createdAt: "2026-08-30T00:00:00.000Z",
  updatedAt: "2026-08-30T00:00:00.000Z",
};

const mockFolderResponse: FolderResponse = {
  success: true,
  data: {
    folder: mockFolder,
  },
};

const mockFoldersResponse: FoldersResponse = {
  success: true,
  results: 1,
  data: {
    folders: [mockFolder],
  },
};

const mockDeleteResponse: DeleteFolderResponse = {
  success: true,
  message: "Folder deleted successfully",
};

const mockExplorerRootResponse: ExplorerRootResponse = {
  success: true,
  results: 1,
  data: {
    folders: [mockFolder],
    notes: [],
  },
};

const mockExplorerFolderResponse: ExplorerFolderResponse = {
  success: true,
  results: 0,
  data: {
    folder: mockFolder,
    notes: [],
  },
};

describe("folderService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createFolder", () => {
    it("creates a folder and returns the response data", async () => {
      const payload = {
        name: "Work",
      };

      mockedApi.post.mockResolvedValue({
        data: mockFolderResponse,
      });

      const result = await folderService.createFolder(payload);

      expect(mockedApi.post).toHaveBeenCalledWith("/folders", payload);
      expect(result).toEqual(mockFolderResponse);
    });
  });

  describe("getAllFolders", () => {
    it("gets all folders and returns the response data", async () => {
      mockedApi.get.mockResolvedValue({
        data: mockFoldersResponse,
      });

      const result = await folderService.getAllFolders();

      expect(mockedApi.get).toHaveBeenCalledWith("/folders");
      expect(result).toEqual(mockFoldersResponse);
    });
  });

  describe("getFolderById", () => {
    it("gets a folder by id and returns the response data", async () => {
      mockedApi.get.mockResolvedValue({
        data: mockFolderResponse,
      });

      const result = await folderService.getFolderById("folder-1");

      expect(mockedApi.get).toHaveBeenCalledWith("/folders/folder-1");
      expect(result).toEqual(mockFolderResponse);
    });
  });

  describe("updateFolder", () => {
    it("updates a folder and returns the response data", async () => {
      const payload = {
        name: "Updated Work",
      };

      mockedApi.patch.mockResolvedValue({
        data: mockFolderResponse,
      });

      const result = await folderService.updateFolder(
        "folder-1",
        payload,
      );

      expect(mockedApi.patch).toHaveBeenCalledWith(
        "/folders/folder-1",
        payload,
      );

      expect(result).toEqual(mockFolderResponse);
    });
  });

  describe("deleteFolder", () => {
    it("deletes a folder and returns the response data", async () => {
      mockedApi.delete.mockResolvedValue({
        data: mockDeleteResponse,
      });

      const result = await folderService.deleteFolder("folder-1");

      expect(mockedApi.delete).toHaveBeenCalledWith("/folders/folder-1");
      expect(result).toEqual(mockDeleteResponse);
    });
  });

  describe("getExplorerContents", () => {
    it("gets root explorer contents when no folder id is provided", async () => {
      mockedApi.get.mockResolvedValue({
        data: mockExplorerRootResponse,
      });

      const result = await folderService.getExplorerContents();

      expect(mockedApi.get).toHaveBeenCalledWith("/folders/explorer", {
        params: undefined,
      });

      expect(result).toEqual(mockExplorerRootResponse);
    });

    it("gets explorer contents for a specific folder", async () => {
      mockedApi.get.mockResolvedValue({
        data: mockExplorerFolderResponse,
      });

      const result = await folderService.getExplorerContents("folder-1");

      expect(mockedApi.get).toHaveBeenCalledWith("/folders/explorer", {
        params: {
          folderId: "folder-1",
        },
      });

      expect(result).toEqual(mockExplorerFolderResponse);
    });
  });
});