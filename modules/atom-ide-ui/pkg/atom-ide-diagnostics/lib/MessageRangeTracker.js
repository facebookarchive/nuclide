'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _textEditor;

function _load_textEditor() {
  return _textEditor = require('nuclide-commons-atom/text-editor');
}

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * This class tracks the position of messages as the contents of the editor changes. It does this
 * using markers. Note that there's no visible change to the editor; the markers are just a means to
 * track ranges as surrounding lines change.
 */
/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

class MessageRangeTracker {

  /**
   * Stores all current markers, indexed by DiagnosticMessage.
   * invariant: No messages for closed files, no destroyed markers.
   */
  constructor() {
    this._messageToMarker = new Map();
    this._fileToMessages = new (_collection || _load_collection()).MultiMap();

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default((0, (_textEditor || _load_textEditor()).observeTextEditors)(editor => {
      const path = editor.getPath();
      if (path == null) {
        return;
      }
      const messagesForPath = this._fileToMessages.get(path);
      for (const message of messagesForPath) {
        // There might already be a marker because there can be multiple TextEditors open for a
        // given file.
        if (!this._messageToMarker.has(message)) {
          this._addMarker(editor, message);
        }
      }
    }), () => {
      for (const marker of this._messageToMarker.values()) {
        marker.destroy();
      }
      this._fileToMessages.clear();
      this._messageToMarker.clear();
    });
  }
  /**
   * Stores all current DiagnosticMessages, indexed by file. Includes those for files that are
   * not open.
   */


  dispose() {
    this._disposables.dispose();
  }

  /** Return a Range if the marker is still valid, otherwise return null */
  getCurrentRange(message) {
    this._assertNotDisposed();
    const marker = this._messageToMarker.get(message);

    if (marker != null && marker.isValid()) {
      return marker.getBufferRange();
    } else {
      return null;
    }
  }

  addFileMessages(messages) {
    this._assertNotDisposed();

    for (const message of messages) {
      if (!(message.fix != null)) {
        throw new Error('Invariant violation: "message.fix != null"');
      }

      this._fileToMessages.add(message.filePath, message);

      // If the file is currently open, create a marker.

      // TODO If there is a long delay between when the file is saved and results appear, the file
      // may have changed in the mean time. Meaning that the markers we place here may be in the
      // wrong place already. Consider detecting such cases (perhaps with a checksum included in the
      // fix) and rejecting the fixes, since we can't accurately track their locations.

      const editorForFile = atom.workspace.getTextEditors().filter(editor => editor.getPath() === message.filePath)[0];
      if (editorForFile != null) {
        this._addMarker(editorForFile, message);
      }
    }
  }

  /** Remove the given messages, if they are currently present */
  removeFileMessages(messages) {
    this._assertNotDisposed();

    for (const message of messages) {
      this._fileToMessages.delete(message.filePath, message);

      const marker = this._messageToMarker.get(message);
      if (marker != null) {
        // No need to remove from the set explicitly since we do that on the marker's onDidDestroy
        // handler.
        marker.destroy();
      }
    }
  }

  _addMarker(editor, message) {
    const fix = message.fix;

    if (!(fix != null)) {
      throw new Error('Invariant violation: "fix != null"');
    }

    const marker = editor.markBufferRange(fix.oldRange, {
      // 'touch' is the least permissive invalidation strategy: It will invalidate for
      // changes that touch the marked region in any way. We want to invalidate
      // aggressively because an incorrect fix application is far worse than a failed
      // application.
      invalidate: 'touch'
    });
    this._messageToMarker.set(message, marker);

    // The marker will be destroyed automatically when its associated TextBuffer is destroyed. Clean
    // up when that happens.
    const markerSubscription = marker.onDidDestroy(() => {
      this._messageToMarker.delete(message);
      markerSubscription.dispose();
      this._disposables.remove(markerSubscription);
    });
    this._disposables.add(markerSubscription);
  }

  _assertNotDisposed() {
    if (!!this._disposables.disposed) {
      throw new Error(`${this.constructor.name} has been disposed`);
    }
  }
}
exports.default = MessageRangeTracker;