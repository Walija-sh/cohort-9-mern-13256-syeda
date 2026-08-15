/// <reference types="mocha" />

import { expect } from "chai";
import sinon from "sinon";
import mongoose from "mongoose";    
import Folder from "../../src/models/Folder.model";
import Note from "../../src/models/Notes.model";
import {
  createFolder,
  getAllFolders,
  getFolderById,
  updateFolder,
  deleteFolder,
  getExplorerContents
} from "../../src/controllers/folder.controller";
import { NextFunction } from "express";
import AppError from "../../src/utils/appError";

describe("Folder controller", () => {
  afterEach(() => {
    sinon.restore();
  });

  describe("createFolder", () => {
    it("should create a folder successfully", async () => {
      const folder = {
        _id: "123456789",
        name: "Work",
        owner: "987654321"
      };

      const createStub = sinon
        .stub(Folder, "create")
        .resolves(folder as any);

      const json = sinon.stub();
      const status = sinon.stub().returns({ json });

      const req = {
        body: {
          name: "Work"
        },
        user: {
          _id: "987654321"
        }
      };

      createFolder(
        req as any,
        { status } as any,
        sinon.stub() as unknown as NextFunction
      );

      await new Promise(resolve => setImmediate(resolve));

      expect(createStub.calledOnce).to.equal(true);

      expect(createStub.firstCall.args[0]).to.deep.equal({
        name: "Work",
        owner: "987654321"
      });

      expect(status.calledOnceWith(201)).to.equal(true);
      expect(json.calledOnce).to.equal(true);
    });

    it("should return an error when folder name is missing", async () => {
      const next = sinon.stub();

      const req = {
        body: {},
        user: {
          _id: "987654321"
        }
      };

      createFolder(
        req as any,
        {} as any,
        next as unknown as NextFunction
      );

      await new Promise(resolve => setImmediate(resolve));

      expect(next.calledOnce).to.equal(true);

      const error = next.firstCall.args[0] as AppError;

      expect(error).to.be.instanceOf(AppError);
      expect(error.statusCode).to.equal(400);
      expect(error.message).to.equal("Folder Name is required");
    });
  });
  describe("getAllFolders", () => {
  it("should return the user's folders", async () => {
    const folders = [
      {
        _id: "123",
        name: "Work",
        owner: "987654321"
      },
      {
        _id: "456",
        name: "Personal",
        owner: "987654321"
      }
    ];

    const sortStub = sinon.stub().resolves(folders);

    const findStub = sinon.stub(Folder, "find").returns({
      sort: sortStub
    } as any);

    const json = sinon.stub();
    const status = sinon.stub().returns({ json });

    const req = {
      user: {
        _id: "987654321"
      }
    };

    getAllFolders(
      req as any,
      { status } as any,
  sinon.stub() as unknown as NextFunction
    );

    await new Promise(resolve => setImmediate(resolve));

    expect(findStub.calledOnce).to.equal(true);

    expect(findStub.firstCall.args[0]).to.deep.equal({
      owner: "987654321"
    });

    expect(sortStub.calledOnceWith({ createdAt: -1 })).to.equal(true);
    expect(status.calledOnceWith(200)).to.equal(true);
    expect(json.calledOnce).to.equal(true);
  });
});

describe("getFolderById", () => {
  it("should return a folder successfully", async () => {
    const folder = {
      _id: "123456789",
      name: "Work",
      owner: "987654321"
    };

    const findOneStub = sinon
      .stub(Folder, "findOne")
      .resolves(folder as any);

    const json = sinon.stub();
    const status = sinon.stub().returns({ json });

    const req = {
      params: {
        id: "123456789"
      },
      user: {
        _id: "987654321"
      }
    };

    getFolderById(
      req as any,
      { status } as any,
      sinon.stub() as unknown as NextFunction
    );

    await new Promise(resolve => setImmediate(resolve));

    expect(findOneStub.calledOnce).to.equal(true);

    expect(findOneStub.firstCall.args[0]).to.deep.equal({
      _id: "123456789",
      owner: "987654321"
    });

    expect(status.calledOnceWith(200)).to.equal(true);
    expect(json.calledOnce).to.equal(true);
  });

  it("should return an error when folder is not found", async () => {
    const findOneStub = sinon
      .stub(Folder, "findOne")
      .resolves(null);

    const next = sinon.stub();

    const req = {
      params: {
        id: "123456789"
      },
      user: {
        _id: "987654321"
      }
    };

    getFolderById(
      req as any,
      {} as any,
      next as unknown as NextFunction
    );

    await new Promise(resolve => setImmediate(resolve));

    expect(findOneStub.calledOnce).to.equal(true);
    expect(next.calledOnce).to.equal(true);

    const error = next.firstCall.args[0] as AppError;

    expect(error).to.be.instanceOf(AppError);
    expect(error.statusCode).to.equal(404);
    expect(error.message).to.equal("Folder not found");
  });
});
describe("updateFolder", () => {
  it("should update a folder successfully", async () => {
    const folder = {
      _id: "123456789",
      name: "Updated Work",
      owner: "987654321"
    };

    const findOneAndUpdateStub = sinon
      .stub(Folder, "findOneAndUpdate")
      .resolves(folder as any);

    const json = sinon.stub();
    const status = sinon.stub().returns({ json });

    const req = {
      params: {
        id: "123456789"
      },
      body: {
        name: "Updated Work"
      },
      user: {
        _id: "987654321"
      }
    };

    updateFolder(
      req as any,
      { status } as any,
      sinon.stub() as unknown as NextFunction
    );

    await new Promise(resolve => setImmediate(resolve));

    expect(findOneAndUpdateStub.calledOnce).to.equal(true);

    expect(findOneAndUpdateStub.firstCall.args[0]).to.deep.equal({
      _id: "123456789",
      owner: "987654321"
    });

    expect(findOneAndUpdateStub.firstCall.args[1]).to.deep.equal({
      name: "Updated Work"
    });

    expect(findOneAndUpdateStub.firstCall.args[2]).to.deep.equal({
      new: true,
      runValidators: true
    });

    expect(status.calledOnceWith(200)).to.equal(true);
    expect(json.calledOnce).to.equal(true);
  });

  it("should return an error when no name is provided", async () => {
    const next = sinon.stub();

    const req = {
      params: {
        id: "123456789"
      },
      body: {},
      user: {
        _id: "987654321"
      }
    };

    updateFolder(
      req as any,
      {} as any,
      next as unknown as NextFunction
    );

    await new Promise(resolve => setImmediate(resolve));

    expect(next.calledOnce).to.equal(true);

    const error = next.firstCall.args[0] as AppError;

    expect(error).to.be.instanceOf(AppError);
    expect(error.statusCode).to.equal(400);
    expect(error.message).to.equal(
      "Please provide at least one field to update"
    );
  });
});
describe("deleteFolder", () => {
  it("should delete a folder and its notes successfully", async () => {
    const folder = {
      _id: "123456789",
      name: "Work",
      owner: "987654321",
      deleteOne: sinon.stub().resolves()
    };

    const session = {
      startTransaction: sinon.stub(),
      abortTransaction: sinon.stub().resolves(),
      commitTransaction: sinon.stub().resolves(),
      endSession: sinon.stub().resolves()
    };

    sinon.stub(mongoose, "startSession").resolves(session as any);

    const findOneStub = sinon
      .stub(Folder, "findOne")
      .resolves(folder as any);

    const deleteManyStub = sinon
      .stub(Note, "deleteMany")
      .resolves({} as any);

    const json = sinon.stub();
    const status = sinon.stub().returns({ json });

    const req = {
      params: {
        id: "123456789"
      },
      user: {
        _id: "987654321"
      }
    };

    deleteFolder(
      req as any,
      { status } as any,
      sinon.stub() as unknown as NextFunction
    );

    await new Promise(resolve => setImmediate(resolve));

    expect(findOneStub.calledOnce).to.equal(true);

    expect(findOneStub.firstCall.args[0]).to.deep.equal({
      _id: "123456789",
      owner: "987654321"
    });

    expect(deleteManyStub.calledOnce).to.equal(true);

    expect(deleteManyStub.firstCall.args[0]).to.deep.equal({
      parentFolder: "123456789",
      owner: "987654321"
    });

    expect(folder.deleteOne.calledOnce).to.equal(true);
    expect(session.startTransaction.calledOnce).to.equal(true);
    expect(session.commitTransaction.calledOnce).to.equal(true);
    expect(session.endSession.calledOnce).to.equal(true);

    expect(status.calledOnceWith(200)).to.equal(true);

    expect(
      json.calledOnceWith({
        success: true,
        message: "Folder and its notes deleted successfully"
      })
    ).to.equal(true);
  });

  it("should return an error when folder is not found", async () => {
    const session = {
      startTransaction: sinon.stub(),
      abortTransaction: sinon.stub().resolves(),
      commitTransaction: sinon.stub().resolves(),
      endSession: sinon.stub().resolves()
    };

    sinon.stub(mongoose, "startSession").resolves(session as any);

    const findOneStub = sinon
      .stub(Folder, "findOne")
      .resolves(null);

    const next = sinon.stub();

    const req = {
      params: {
        id: "123456789"
      },
      user: {
        _id: "987654321"
      }
    };

    deleteFolder(
      req as any,
      {} as any,
      next as unknown as NextFunction
    );

    await new Promise(resolve => setImmediate(resolve));

    expect(findOneStub.calledOnce).to.equal(true);
    expect(session.abortTransaction.calledOnce).to.equal(true);
    expect(session.commitTransaction.called).to.equal(false);
    expect(session.endSession.calledOnce).to.equal(true);

    expect(next.calledOnce).to.equal(true);

    const error = next.firstCall.args[0] as AppError;

    expect(error).to.be.instanceOf(AppError);
    expect(error.statusCode).to.equal(404);
    expect(error.message).to.equal("Folder not found");
  });
});

describe("getExplorerContents", () => {
  it("should return root folders and notes", async () => {
    const folders = [
      {
        _id: "123",
        name: "Work",
        owner: "987654321"
      }
    ];

    const notes = [
      {
        _id: "456",
        title: "Root Note",
        owner: "987654321",
        parentFolder: null
      }
    ];

    const folderSortStub = sinon.stub().resolves(folders);
    const noteSortStub = sinon.stub().resolves(notes);

    const folderFindStub = sinon.stub(Folder, "find").returns({
      sort: folderSortStub
    } as any);

    const noteFindStub = sinon.stub(Note, "find").returns({
      sort: noteSortStub
    } as any);

    const json = sinon.stub();
    const status = sinon.stub().returns({ json });

    const req = {
      query: {},
      user: {
        _id: "987654321"
      }
    };

    getExplorerContents(
      req as any,
      { status } as any,
      sinon.stub() as unknown as NextFunction
    );

    await new Promise(resolve => setImmediate(resolve));

    expect(folderFindStub.calledOnce).to.equal(true);
    expect(folderFindStub.firstCall.args[0]).to.deep.equal({
      owner: "987654321"
    });

    expect(folderSortStub.calledOnceWith({ createdAt: -1 })).to.equal(true);

    expect(noteFindStub.calledOnce).to.equal(true);
    expect(noteFindStub.firstCall.args[0]).to.deep.equal({
      owner: "987654321",
      parentFolder: null
    });

    expect(noteSortStub.calledOnceWith({ createdAt: -1 })).to.equal(true);

    expect(status.calledOnceWith(200)).to.equal(true);
    expect(json.calledOnce).to.equal(true);
  });

  it("should return a folder and its notes", async () => {
    const folder = {
      _id: "123456789",
      name: "Work",
      owner: "987654321"
    };

    const notes = [
      {
        _id: "456",
        title: "Work Note",
        owner: "987654321",
        parentFolder: "123456789"
      }
    ];

    const findOneStub = sinon
      .stub(Folder, "findOne")
      .resolves(folder as any);

    const sortStub = sinon.stub().resolves(notes);

    const noteFindStub = sinon.stub(Note, "find").returns({
      sort: sortStub
    } as any);

    const json = sinon.stub();
    const status = sinon.stub().returns({ json });

    const req = {
      query: {
        folderId: "123456789"
      },
      user: {
        _id: "987654321"
      }
    };

    getExplorerContents(
      req as any,
      { status } as any,
      sinon.stub() as unknown as NextFunction
    );

    await new Promise(resolve => setImmediate(resolve));

    expect(findOneStub.calledOnce).to.equal(true);

    expect(findOneStub.firstCall.args[0]).to.deep.equal({
      _id: "123456789",
      owner: "987654321"
    });

    expect(noteFindStub.calledOnce).to.equal(true);

    expect(noteFindStub.firstCall.args[0]).to.deep.equal({
      parentFolder: "123456789",
      owner: "987654321"
    });

    expect(sortStub.calledOnceWith({ createdAt: -1 })).to.equal(true);
    expect(status.calledOnceWith(200)).to.equal(true);
    expect(json.calledOnce).to.equal(true);
  });
});
});