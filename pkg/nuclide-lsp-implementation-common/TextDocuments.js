"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _TextDocument() {
  const data = _interopRequireDefault(require("./TextDocument"));

  _TextDocument = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _eventKit() {
  const data = require("event-kit");

  _eventKit = function () {
    return data;
  };

  return data;
}

function _vscodeLanguageserver() {
  const data = require("vscode-languageserver");

  _vscodeLanguageserver = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
// flowlint-next-line untyped-type-import:off
function textDocumentFromLSPTextDocument(textDocument) {
  return new (_TextDocument().default)(textDocument.uri, textDocument.languageId, textDocument.version, textDocument.text);
}

class TextDocuments {
  constructor() {
    this._disposables = new (_UniversalDisposable().default)();
    this._documents = new Map();
    this._emitter = new (_eventKit().Emitter)();

    this._handleDidStopChanging = textDocument => {
      this._emitter.emit('didChangeContent', {
        textDocument
      });
    };

    this._handleDidSave = textDocument => {
      this._emitter.emit('didSave', {
        textDocument
      });
    };

    this._disposables.add(this._emitter);
  }

  dispose() {
    this._disposables.dispose();
  }

  get disposed() {
    return this._disposables.disposed;
  }

  get syncKind() {
    return _vscodeLanguageserver().TextDocumentSyncKind.Incremental;
  }

  get(uri) {
    const document = this._documents.get(uri);

    if (!(document != null)) {
      throw new Error(`TextDocuments: asked for document with uri ${uri}, but no buffer was loaded`);
    }

    return document;
  }

  listen(connection) {
    connection.onDidOpenTextDocument(e => {
      const {
        textDocument
      } = e;
      const document = textDocumentFromLSPTextDocument(textDocument);
      this.addDocument(textDocument.uri, document);
    });
    connection.onDidChangeTextDocument(e => {
      const {
        contentChanges,
        textDocument
      } = e;
      const document = this.get(textDocument.uri);
      document.updateMany(contentChanges, textDocument.version);
    });
    connection.onDidCloseTextDocument(e => {
      this.removeDocument(e.textDocument.uri);
    });
    connection.onDidSaveTextDocument(e => {
      const document = this.get(e.textDocument.uri);
      document.save(e.text);
    });
  }

  addDocument(uri, document) {
    this._documents.set(uri, document);

    this._disposables.add(document);

    this._emitter.emit('didOpenTextDocument', {
      textDocument: document
    });

    document.onDidStopChanging(this._handleDidStopChanging);
    document.onDidSave(this._handleDidSave);
  }

  removeDocument(uri) {
    const document = this.get(uri);

    this._emitter.emit('didClose', {
      textDocument: document
    });

    this._disposables.remove(document);

    this._documents.delete(uri);

    document.dispose();
  }

  all() {
    return Array.from(this._documents.values());
  }

  onDidChangeContent(handler) {
    this._emitter.on('didChangeContent', handler);
  }

  onDidSave(handler) {
    this._emitter.on('didSave', handler);
  }

  onDidOpenTextDocument(handler) {
    this._emitter.on('didOpenTextDocument', handler);
  }

  onDidClose(handler) {
    this._emitter.on('didClose', handler);
  }

}

exports.default = TextDocuments;