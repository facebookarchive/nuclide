'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FileCache = undefined;

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
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * NB: although it is possible to change the language ID after the file has
 * already been opened, the file cache will not update to reflect that.
 */
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

class FileCache {
  // Care! update() is the only way you're allowed to update _buffers or _requests
  // or to fire a _fileEvents.next() event. That's to ensure that the three things
  // stay in sync.
  constructor() {
    this._buffers = new Map();
    this._fileEvents = new _rxjsBundlesRxMinJs.Subject();
    this._directoryEvents = new _rxjsBundlesRxMinJs.BehaviorSubject(new Set());
    this._requests = new (_FileVersionNotifier || _load_FileVersionNotifier()).FileVersionNotifier();

    this._resources = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._resources.add(this._requests);
  }

  update(updateBufferAndMakeEventFunc) {
    const event = updateBufferAndMakeEventFunc();
    this._requests.onEvent(event);

    // invariant: because the above two lines have updated both _buffers and _requests,
    // then getBufferAtVersion will necessarily return immediately and successfully.
    // And getBufferForFileEvent will also succeed.

    if (!(event.kind !== 'edit' || this.getBufferForFileEvent(event))) {
      throw new Error('Invariant violation: "event.kind !== \'edit\' || this.getBufferForFileEvent(event)"');
    }

    this._fileEvents.next(event);
  }

  // If any out of sync state is detected then an Error is thrown.
  // This will force the client to send a 'sync' event to get back on track.
  onFileEvent(event) {
    const filePath = event.fileVersion.filePath;
    const changeCount = event.fileVersion.version;
    const fileInfo = this._buffers.get(filePath);
    const buffer = fileInfo != null ? fileInfo.buffer : null;
    switch (event.kind) {
      case (_constants || _load_constants()).FileEventKind.OPEN:
        if (!(buffer == null)) {
          throw new Error('Invariant violation: "buffer == null"');
        }

        this._open(filePath, event.contents, changeCount, event.languageId);
        break;
      case (_constants || _load_constants()).FileEventKind.CLOSE:
        if (buffer != null) {
          this._close(filePath, buffer);
        }
        break;
      case (_constants || _load_constants()).FileEventKind.EDIT:
        if (!(buffer != null)) {
          throw new Error('Invariant violation: "buffer != null"');
        }

        if (!(buffer.changeCount === changeCount - 1)) {
          throw new Error('Invariant violation: "buffer.changeCount === changeCount - 1"');
        }

        if (!(buffer.getTextInRange(event.oldRange) === event.oldText)) {
          throw new Error('Invariant violation: "buffer.getTextInRange(event.oldRange) === event.oldText"');
        }

        this.update(() => {
          buffer.setTextInRange(event.oldRange, event.newText);

          if (!(buffer.changeCount === changeCount)) {
            throw new Error('Invariant violation: "buffer.changeCount === changeCount"');
          }

          return event;
        });
        break;
      case (_constants || _load_constants()).FileEventKind.SAVE:
        this._save(filePath, changeCount);
        break;
      case (_constants || _load_constants()).FileEventKind.SYNC:
        if (buffer == null) {
          this._open(filePath, event.contents, changeCount, event.languageId);
        } else {
          this._syncEdit(filePath, buffer, event.contents, changeCount);
        }
        break;
      default:
        event.kind;
        throw new Error(`Unexpected FileEvent.kind: ${event.kind}`);
    }
    return Promise.resolve(undefined);
  }

  async onDirectoriesChanged(openDirectories) {
    this._directoryEvents.next(openDirectories);
  }

  _syncEdit(filePath, buffer, contents, changeCount) {
    // messages are out of order
    if (changeCount < buffer.changeCount) {
      return;
    }

    const oldText = buffer.getText();
    const oldRange = buffer.getRange();
    this.update(() => {
      buffer.setText(contents);
      const newRange = buffer.getRange();
      buffer.changeCount = changeCount;
      return createEditEvent(this.createFileVersion(filePath, changeCount), oldRange, oldText, newRange, buffer.getText());
    });
  }

  _open(filePath, contents, changeCount, languageId) {
    // We never call setPath on these TextBuffers as that will
    // start the TextBuffer attempting to sync with the file system.
    const newBuffer = new (_simpleTextBuffer || _load_simpleTextBuffer()).default(contents);
    newBuffer.changeCount = changeCount;
    this.update(() => {
      this._buffers.set(filePath, { buffer: newBuffer, languageId });
      return createOpenEvent(this.createFileVersion(filePath, changeCount), contents, languageId);
    });
  }

  _close(filePath, buffer) {
    this.update(() => {
      this._buffers.delete(filePath);
      return createCloseEvent(this.createFileVersion(filePath, buffer.changeCount));
    });
    buffer.destroy();
  }

  _save(filePath, changeCount) {
    this.update(() => {
      return createSaveEvent(this.createFileVersion(filePath, changeCount));
    });
  }

  dispose() {
    // The _close routine will delete elements from the _buffers map.
    for (const [filePath, { buffer }] of this._buffers.entries()) {
      this._close(filePath, buffer);
    }

    if (!(this._buffers.size === 0)) {
      throw new Error('Invariant violation: "this._buffers.size === 0"');
    }

    this._resources.dispose();
    this._fileEvents.complete();
    this._directoryEvents.complete();
  }

  // getBuffer: returns whatever is the current version of the buffer.
  getBuffer(filePath) {
    // TODO: change this to return a string, to ensure that no caller will ever mutate
    // the buffer contents (and hence its changeCount). The only modifications allowed
    // are those that come from the editor inside this.onFileEvent.
    const fileInfo = this._buffers.get(filePath);
    return fileInfo != null ? fileInfo.buffer : null;
  }

  // getBufferAtVersion(version): if the stream of onFileEvent gets up to this particular
  // version, either now or in the future, then will return the buffer for that version.
  // But if for whatever reason the stream of onFileEvent won't hit that precise version
  // then returns null. See comments in _requests.waitForBufferAtVersion for
  // the subtle scenarios where it might return null.
  async getBufferAtVersion(fileVersion) {
    // TODO: change this to return a string, like getBuffer() above.
    if (!(await this._requests.waitForBufferAtVersion(fileVersion))) {
      return null;
    }
    const buffer = this.getBuffer(fileVersion.filePath);
    return buffer != null && buffer.changeCount === fileVersion.version ? buffer : null;
  }

  // getBufferForFileEvent - this function may be called immediately when an edit or save
  // event happens, before any awaits. At that time the buffer is guaranteed to be
  // available. If called at any other time, the buffer may no longer be available,
  // in which case it may throw.
  getBufferForFileEvent(fileEvent) {
    // TODO: change this to return a string, like getBuffer() above.
    const fileVersion = fileEvent.fileVersion;

    if (!this._requests.isBufferAtVersion(fileVersion)) {
      throw new Error('Invariant violation: "this._requests.isBufferAtVersion(fileVersion)"');
    }

    const buffer = this.getBuffer(fileVersion.filePath);

    if (!(buffer != null && buffer.changeCount === fileVersion.version)) {
      throw new Error('Invariant violation: "buffer != null && buffer.changeCount === fileVersion.version"');
    }

    return buffer;
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
    return _rxjsBundlesRxMinJs.Observable.from(Array.from(this._buffers.entries()).map(([filePath, { buffer, languageId }]) => {
      if (!(buffer != null)) {
        throw new Error('Invariant violation: "buffer != null"');
      }

      if (!(languageId != null)) {
        throw new Error('Invariant violation: "languageId != null"');
      }

      return createOpenEvent(this.createFileVersion(filePath, buffer.changeCount), buffer.getText(), languageId);
    })).concat(this._fileEvents);
  }

  observeDirectoryEvents() {
    return this._directoryEvents;
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
function createOpenEvent(fileVersion, contents, languageId) {
  return {
    kind: (_constants || _load_constants()).FileEventKind.OPEN,
    fileVersion,
    contents,
    languageId
  };
}

function createCloseEvent(fileVersion) {
  return {
    kind: (_constants || _load_constants()).FileEventKind.CLOSE,
    fileVersion
  };
}

function createSaveEvent(fileVersion) {
  return {
    kind: (_constants || _load_constants()).FileEventKind.SAVE,
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