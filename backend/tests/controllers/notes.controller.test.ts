/// <reference types="mocha" />

import { expect } from "chai";
import sinon from "sinon";
import Note from "../../src/models/Notes.model";
import {
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
  deleteNote
} from "../../src/controllers/note.controller.ts";
import { NextFunction } from "express";
import AppError from "../../src/utils/appError";

describe("Notes controller", () => {
  afterEach(() => {
    sinon.restore();
  });

  describe("createNote", () => {
    it("should create a note successfully", async () => {
      const note = {
        _id: "123456789",
        title: "Test Note",
        content: {
          type: "doc",
          content: []
        },
        owner: "987654321"
      };

      const createStub = sinon.stub(Note, "create").resolves(note as any);

      const json = sinon.stub();
      const status = sinon.stub().returns({ json });

      const req = {
        body: {
          title: "Test Note",
          content: {
            type: "doc",
            content: []
          }
        },
        user: {
          _id: "987654321"
        }
      };

      createNote(
        req as any,
        { status } as any,
        sinon.stub() as unknown as NextFunction
      );

      await new Promise(resolve => setImmediate(resolve));

      expect(createStub.calledOnce).to.equal(true);
      expect(createStub.firstCall.args[0]).to.deep.equal({
        title: "Test Note",
        content: {
          type: "doc",
          content: []
        },
        owner: "987654321",
        parentFolder: null
      });

      expect(status.calledOnceWith(201)).to.equal(true);
      expect(json.calledOnce).to.equal(true);
    });

    it("should return an error when title is missing", async () => {
      const next = sinon.stub();

      const req = {
        body: {
          content: {
            type: "doc",
            content: []
          }
        },
        user: {
          _id: "987654321"
        }
      };

      createNote(
        req as any,
        {} as any,
        next as unknown as NextFunction
      );

      await new Promise(resolve => setImmediate(resolve));

      expect(next.calledOnce).to.equal(true);

      const error = next.firstCall.args[0] as AppError;

      expect(error).to.be.instanceOf(AppError);
      expect(error.statusCode).to.equal(400);
      expect(error.message).to.equal("Title is required");
    });
  });
  describe("getAllNotes", () => {
  it("should return the user's root notes", async () => {
    const notes = [
      {
        _id: "123",
        title: "First Note",
      },
      {
        _id: "456",
        title: "Second Note",
      }
    ];

    const sortStub = sinon.stub().resolves(notes);

    const findStub = sinon.stub(Note, "find").returns({
      sort: sortStub
    } as any);

    const json = sinon.stub();
    const status = sinon.stub().returns({ json });

    const req = {
      user: {
        _id: "987654321"
      },
      query: {}
    };

    getAllNotes(
      req as any,
      { status } as any,
  sinon.stub() as unknown as NextFunction
    );

    await new Promise(resolve => setImmediate(resolve));

    expect(findStub.calledOnce).to.equal(true);
    expect(findStub.firstCall.args[0]).to.deep.equal({
      owner: "987654321",
      parentFolder: null
    });

    expect(sortStub.calledOnceWith({ createdAt: -1 })).to.equal(true);
    expect(status.calledOnceWith(200)).to.equal(true);
    expect(json.calledOnce).to.equal(true);
  });
});

describe("getNoteById", () => {
  it("should return a note successfully", async () => {
    const note = {
      _id: "123456789",
      title: "Test Note",
      content: {
        type: "doc",
        content: []
      },
      owner: "987654321"
    };

    const findOneStub = sinon.stub(Note, "findOne").resolves(note as any);

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

    getNoteById(
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

  it("should return an error when note is not found", async () => {
    const findOneStub = sinon.stub(Note, "findOne").resolves(null);
    const next = sinon.stub();

    const req = {
      params: {
        id: "123456789"
      },
      user: {
        _id: "987654321"
      }
    };

    getNoteById(
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
    expect(error.message).to.equal("Note not found");
  });
});
describe("updateNote", () => {
  it("should update a note successfully", async () => {
    const note = {
      _id: "123456789",
      title: "Updated Note",
      content: {
        type: "doc",
        content: []
      },
      owner: "987654321"
    };

    const findOneAndUpdateStub = sinon
      .stub(Note, "findOneAndUpdate")
      .resolves(note as any);

    const json = sinon.stub();
    const status = sinon.stub().returns({ json });

    const req = {
      params: {
        id: "123456789"
      },
      body: {
        title: "Updated Note"
      },
      user: {
        _id: "987654321"
      }
    };

    updateNote(
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
      title: "Updated Note"
    });

    expect(findOneAndUpdateStub.firstCall.args[2]).to.deep.equal({
      new: true,
      runValidators: true
    });

    expect(status.calledOnceWith(200)).to.equal(true);
    expect(json.calledOnce).to.equal(true);
  });

  it("should return an error when no fields are provided", async () => {
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

    updateNote(
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
describe("deleteNote", () => {
  it("should delete a note successfully", async () => {
    const note = {
      _id: "123456789",
      title: "Test Note",
      owner: "987654321"
    };

    const findOneAndDeleteStub = sinon
      .stub(Note, "findOneAndDelete")
      .resolves(note as any);

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

    deleteNote(
      req as any,
      { status } as any,
      sinon.stub() as unknown as NextFunction
    );

    await new Promise(resolve => setImmediate(resolve));

    expect(findOneAndDeleteStub.calledOnce).to.equal(true);

    expect(findOneAndDeleteStub.firstCall.args[0]).to.deep.equal({
      _id: "123456789",
      owner: "987654321"
    });

    expect(status.calledOnceWith(200)).to.equal(true);

    expect(
      json.calledOnceWith({
        success: true,
        message: "Note deleted successfully"
      })
    ).to.equal(true);
  });

  it("should return an error when note is not found", async () => {
    const findOneAndDeleteStub = sinon
      .stub(Note, "findOneAndDelete")
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

    deleteNote(
      req as any,
      {} as any,
      next as unknown as NextFunction
    );

    await new Promise(resolve => setImmediate(resolve));

    expect(findOneAndDeleteStub.calledOnce).to.equal(true);
    expect(next.calledOnce).to.equal(true);

    const error = next.firstCall.args[0] as AppError;

    expect(error).to.be.instanceOf(AppError);
    expect(error.statusCode).to.equal(404);
    expect(error.message).to.equal("Note not found");
  });
});

});

