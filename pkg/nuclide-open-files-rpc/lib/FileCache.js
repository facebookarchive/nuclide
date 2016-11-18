'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FileCache = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

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

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let FileCache = exports.FileCache = class FileCache {

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
        throw new Error(`Unexpected FileEvent.kind: ${ event.kind }`);
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
    for (const _ref of this._buffers.entries()) {
      var _ref2 = _slicedToArray(_ref, 2);

      const filePath = _ref2[0];
      const buffer = _ref2[1];

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

  getOpenFiles() {
    return this._buffers.keys();
  }

  observeFileEvents() {
    return _rxjsBundlesRxMinJs.Observable.from(Array.from(this._buffers.entries()).map((_ref3) => {
      var _ref4 = _slicedToArray(_ref3, 2);

      let filePath = _ref4[0],
          buffer = _ref4[1];

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
      filePath: filePath,
      version: version
    };
  }
};


function createOpenEvent(fileVersion, contents) {
  return {
    kind: (_constants || _load_constants()).FileEventKind.OPEN,
    fileVersion: fileVersion,
    contents: contents
  };
}

function createCloseEvent(fileVersion) {
  return {
    kind: (_constants || _load_constants()).FileEventKind.CLOSE,
    fileVersion: fileVersion
  };
}

function createEditEvent(fileVersion, oldRange, oldText, newRange, newText) {
  return {
    kind: (_constants || _load_constants()).FileEventKind.EDIT,
    fileVersion: fileVersion,
    oldRange: oldRange,
    oldText: oldText,
    newRange: newRange,
    newText: newText
  };
}