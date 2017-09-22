'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _TextDocument;

function _load_TextDocument() {
  return _TextDocument = _interopRequireDefault(require('./TextDocument'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _eventKit;

function _load_eventKit() {
  return _eventKit = require('event-kit');
}

var _vscodeLanguageserver;

function _load_vscodeLanguageserver() {
  return _vscodeLanguageserver = require('vscode-languageserver');
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

function textDocumentFromLSPTextDocument(textDocument) {
  return new (_TextDocument || _load_TextDocument()).default(textDocument.uri, textDocument.languageId, textDocument.version, textDocument.text);
}

class TextDocuments {

  constructor() {
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._documents = new Map();
    this._emitter = new (_eventKit || _load_eventKit()).Emitter();

    this._handleDidStopChanging = document => {
      this._emitter.emit('didChangeContent', { document });
    };

    this._handleDidSave = document => {
      this._emitter.emit('didSave', { document });
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
    return (_vscodeLanguageserver || _load_vscodeLanguageserver()).TextDocumentSyncKind.Incremental;
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
      const { textDocument } = e;
      const document = textDocumentFromLSPTextDocument(textDocument);
      this.addDocument(textDocument.uri, document);
    });

    connection.onDidChangeTextDocument(e => {
      const { contentChanges, textDocument } = e;
      const document = this.get(textDocument.uri);
      document.updateMany(contentChanges, textDocument.version);
    });

    connection.onDidCloseTextDocument(e => {
      this.removeDocument(e.textDocument.uri);
    });

    connection.onDidSaveTextDocument(e => {
      const document = this.get(e.textDocument.uri);
      document.save(e.textDocument.version, e.text);
    });
  }

  addDocument(uri, document) {
    this._documents.set(uri, document);
    this._disposables.add(document);
    this._emitter.emit('didOpenTextDocument', { textDocument: document });
    document.onDidStopChanging(this._handleDidStopChanging);
    document.onDidSave(this._handleDidSave);
  }

  removeDocument(uri) {
    const document = this.get(uri);
    this._emitter.emit('didClose', { textDocument: document });
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