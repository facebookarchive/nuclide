'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _simpleTextBuffer;

function _load_simpleTextBuffer() {
  return _simpleTextBuffer = _interopRequireDefault(require('simple-text-buffer'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _eventKit;

function _load_eventKit() {
  return _eventKit = require('event-kit');
}

var _util;

function _load_util() {
  return _util = require('./utils/util');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class TextDocument {

  constructor(uri, languageId, version, text) {
    this.isDirty = false;
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._emitter = new (_eventKit || _load_eventKit()).Emitter();

    this._handleDidStopChanging = () => {
      this.assertNotDisposed();
      this._emitter.emit('didStopChanging', this);
    };

    this.uri = uri;
    this.languageId = languageId;
    this.version = version;
    this.buffer = new (_simpleTextBuffer || _load_simpleTextBuffer()).default(text);

    this._disposables.add(this._emitter);
    this._disposables.add(this.buffer.onDidStopChanging(this._handleDidStopChanging));
  }

  assertNotDisposed() {
    if (!!this.disposed) {
      throw new Error(`TextDocument with uri ${this.uri} was already disposed`);
    }
  }

  dispose() {
    this.assertNotDisposed();
    this._disposables.dispose();
  }

  get disposed() {
    return this._disposables.disposed;
  }

  get lineCount() {
    this.assertNotDisposed();
    return this.buffer.getLineCount();
  }

  getText() {
    this.assertNotDisposed();
    return this.buffer.getText();
  }

  offsetAt(position) {
    this.assertNotDisposed();
    return this.buffer.characterIndexForPosition((0, (_util || _load_util()).lspPositionToAtomPoint)(position));
  }

  onDidStopChanging(handler) {
    this.assertNotDisposed();
    return this._emitter.on('didStopChanging', handler);
  }

  onDidSave(handler) {
    this.assertNotDisposed();
    return this._emitter.on('didSave', handler);
  }

  positionAt(offset) {
    this.assertNotDisposed();
    return (0, (_util || _load_util()).atomPointToLSPPosition)(this.buffer.positionForCharacterIndex(offset));
  }

  save(version, text) {
    this.assertNotDisposed();
    if (text != null) {
      this.buffer.setText(text);
    }

    this.version = version;
    this.isDirty = false;
    this._emitter.emit('didSave', this);
  }

  updateMany(changes, version) {
    this.assertNotDisposed();

    this.isDirty = true;
    this.version = version;

    // Ensure that ranged changes are sorted in reverse order.
    // Otherwise, the changes can't be applied cleanly.
    changes.sort((a, b) => {
      if (!(a.range != null && b.range != null)) {
        throw new Error('There should only be one full-text update.');
      }

      return (0, (_util || _load_util()).compareLspRange)(b.range, a.range);
    });

    for (const change of changes) {
      if (change.range != null) {
        // Incremental update
        this.buffer.setTextInRange((0, (_util || _load_util()).lspRangeToAtomRange)(change.range), change.text);
      } else {
        // Full text update
        this.buffer.setText(change.text);
      }
    }
  }

}
exports.default = TextDocument; /**
                                 * Copyright (c) 2015-present, Facebook, Inc.
                                 * All rights reserved.
                                 *
                                 * This source code is licensed under the license found in the LICENSE file in
                                 * the root directory of this source tree.
                                 *
                                 * 
                                 * @format
                                 */