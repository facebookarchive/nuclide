'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FileCache = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _simpleTextBuffer;

function _load_simpleTextBuffer() {
  return _simpleTextBuffer = _interopRequireDefault(require('simple-text-buffer'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _FileVersionNotifier;

function _load_FileVersionNotifier() {
  return _FileVersionNotifier = require('./FileVersionNotifier');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
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
 */

class FileCache {

  constructor() {
    this._buffers = new Map();
    this._fileEvents = new _rxjsBundlesRxMinJs.Subject();
    this._directoryEvents = new _rxjsBundlesRxMinJs.BehaviorSubject(new Set());
    this._requests = new (_FileVersionNotifier || _load_FileVersionNotifier()).FileVersionNotifier();

    this._resources = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._resources.add(this._requests);
    this._resources.add(this._fileEvents.subscribe(event => {
      this._requests.onEvent(event);
    }));
  }

  // If any out of sync state is detected then an Error is thrown.
  // This will force the client to send a 'sync' event to get back on track.
  onFileEvent(event) {
    const filePath = event.fileVersion.filePath;
    const changeCount = event.fileVersion.version;
    const buffer = this._buffers.get(filePath);
    switch (event.kind) {
      case (_constants || _load_constants()).FileEventKind.OPEN:
        if (!(buffer == null)) {
          throw new Error('Invariant violation: "buffer == null"');
        }

        this._open(filePath, event.contents, changeCount);
        break;
      case (_constants || _load_constants()).FileEventKind.CLOSE:
        if (buffer != null) {
          this._buffers.delete(filePath);
          this._emitClose(filePath, buffer);
          buffer.destroy();
        }
        break;
      case (_constants || _load_constants()).FileEventKind.EDIT:
        if (!(buffer != null)) {
          throw new Error('Invariant violation: "buffer != null"');
        }

        if (!(buffer.changeCount === changeCount - 1)) {
          throw new Error('Invariant violation: "buffer.changeCount === (changeCount - 1)"');
        }

        if (!(buffer.getTextInRange(event.oldRange) === event.oldText)) {
          throw new Error('Invariant violation: "buffer.getTextInRange(event.oldRange) === event.oldText"');
        }

        buffer.setTextInRange(event.oldRange, event.newText);

        if (!(buffer.changeCount === changeCount)) {
          throw new Error('Invariant violation: "buffer.changeCount === changeCount"');
        }

        this._fileEvents.next(event);
        break;
      case (_constants || _load_constants()).FileEventKind.SYNC:
        if (buffer == null) {
          this._open(filePath, event.contents, changeCount);
        } else {
          this._syncEdit(filePath, buffer, event.contents, changeCount);
        }
        break;
      default:
        throw new Error(`Unexpected FileEvent.kind: ${event.kind}`);
    }
    return Promise.resolve(undefined);
  }

  onDirectoriesChanged(openDirectories) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      _this._directoryEvents.next(openDirectories);
    })();
  }

  _syncEdit(filePath, buffer, contents, changeCount) {
    // messages are out of order
    if (changeCount < buffer.changeCount) {
      return;
    }

    const oldText = buffer.getText();
    const oldRange = buffer.getRange();
    buffer.setText(contents);
    const newRange = buffer.getRange();
    buffer.changeCount = changeCount;
    this._fileEvents.next(createEditEvent(this.createFileVersion(filePath, changeCount), oldRange, oldText, newRange, buffer.getText()));
  }

  _open(filePath, contents, changeCount) {
    // We never call setPath on these TextBuffers as that will
    // start the TextBuffer attempting to sync with the file system.
    const newBuffer = new (_simpleTextBuffer || _load_simpleTextBuffer()).default(contents);
    newBuffer.changeCount = changeCount;
    this._buffers.set(filePath, newBuffer);
    this._fileEvents.next(createOpenEvent(this.createFileVersion(filePath, changeCount), contents));
  }

  dispose() {
    for (const [filePath, buffer] of this._buffers.entries()) {
      this._emitClose(filePath, buffer);
      buffer.destroy();
    }
    this._buffers.clear();
    this._resources.dispose();
    this._fileEvents.complete();
    this._directoryEvents.complete();
  }

  getBuffer(filePath) {
    return this._buffers.get(filePath);
  }

  getBufferAtVersion(fileVersion) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (!(yield _this2._requests.waitForBufferAtVersion(fileVersion))) {
        return null;
      }
      const buffer = _this2.getBuffer(fileVersion.filePath);
      return buffer != null && buffer.changeCount === fileVersion.version ? buffer : null;
    })();
  }

  getOpenDirectories() {
    return this._directoryEvents.getValue();
  }

  // Returns directory which contains this path if any.
  // Remote equivalent of atom.project.relativizePath()[1]
  // TODO: Return the most nested open directory.
  //       Note that Atom doesn't do this, though it should.
  getContainingDirectory(filePath) {
    for (const dir of this.getOpenDirectories()) {
      if ((_nuclideUri || _load_nuclideUri()).default.contains(dir, filePath)) {
        return dir;
      }
    }
    return null;
  }

  getOpenFiles() {
    return this._buffers.keys();
  }

  observeFileEvents() {
    return _rxjsBundlesRxMinJs.Observable.from(Array.from(this._buffers.entries()).map(([filePath, buffer]) => {
      if (!(buffer != null)) {
        throw new Error('Invariant violation: "buffer != null"');
      }

      return createOpenEvent(this.createFileVersion(filePath, buffer.changeCount), buffer.getText());
    })).concat(this._fileEvents);
  }

  observeDirectoryEvents() {
    return this._directoryEvents;
  }

  _emitClose(filePath, buffer) {
    this._fileEvents.next(createCloseEvent(this.createFileVersion(filePath, buffer.changeCount)));
  }

  createFileVersion(filePath, version) {
    return {
      notifier: this,
      filePath,
      version
    };
  }
}

exports.FileCache = FileCache;
function createOpenEvent(fileVersion, contents) {
  return {
    kind: (_constants || _load_constants()).FileEventKind.OPEN,
    fileVersion,
    contents
  };
}

function createCloseEvent(fileVersion) {
  return {
    kind: (_constants || _load_constants()).FileEventKind.CLOSE,
    fileVersion
  };
}

function createEditEvent(fileVersion, oldRange, oldText, newRange, newText) {
  return {
    kind: (_constants || _load_constants()).FileEventKind.EDIT,
    fileVersion,
    oldRange,
    oldText,
    newRange,
    newText
  };
}