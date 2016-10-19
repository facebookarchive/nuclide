Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _simpleTextBuffer;

function _load_simpleTextBuffer() {
  return _simpleTextBuffer = _interopRequireDefault(require('simple-text-buffer'));
}

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

var _FileVersionNotifier;

function _load_FileVersionNotifier() {
  return _FileVersionNotifier = require('./FileVersionNotifier');
}

var _commonsNodeUniversalDisposable;

function _load_commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var FileCache = (function () {
  function FileCache() {
    var _this = this;

    _classCallCheck(this, FileCache);

    this._buffers = new Map();
    this._events = new (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Subject();
    this._requests = new (_FileVersionNotifier || _load_FileVersionNotifier()).FileVersionNotifier();

    this._resources = new (_commonsNodeUniversalDisposable || _load_commonsNodeUniversalDisposable()).default();
    this._resources.add(this._requests);
    this._resources.add(this._events.subscribe(function (event) {
      _this._requests.onEvent(event);
    }));
  }

  // If any out of sync state is detected then an Error is thrown.
  // This will force the client to send a 'sync' event to get back on track.

  _createClass(FileCache, [{
    key: 'onEvent',
    value: function onEvent(event) {
      var filePath = event.fileVersion.filePath;
      var changeCount = event.fileVersion.version;
      var buffer = this._buffers.get(filePath);
      switch (event.kind) {
        case 'open':
          (0, (_assert || _load_assert()).default)(buffer == null);
          this._open(filePath, event.contents, changeCount);
          break;
        case 'close':
          (0, (_assert || _load_assert()).default)(buffer != null);
          this._buffers.delete(filePath);
          this._emitClose(filePath, buffer);
          buffer.destroy();
          break;
        case 'edit':
          (0, (_assert || _load_assert()).default)(buffer != null);
          (0, (_assert || _load_assert()).default)(buffer.changeCount === changeCount - 1);
          (0, (_assert || _load_assert()).default)(buffer.getTextInRange(event.oldRange) === event.oldText);
          buffer.setTextInRange(event.oldRange, event.newText);
          (0, (_assert || _load_assert()).default)(buffer.changeCount === changeCount);
          this._events.next(event);
          break;
        case 'sync':
          if (buffer == null) {
            this._open(filePath, event.contents, changeCount);
          } else {
            this._syncEdit(filePath, buffer, event.contents, changeCount);
          }
          break;
        default:
          throw new Error('Unexpected FileEvent.kind: ' + event.kind);
      }
      return Promise.resolve(undefined);
    }
  }, {
    key: '_syncEdit',
    value: function _syncEdit(filePath, buffer, contents, changeCount) {
      // messages are out of order
      if (changeCount < buffer.changeCount) {
        return;
      }

      var oldText = buffer.getText();
      var oldRange = buffer.getRange();
      buffer.setText(contents);
      var newRange = buffer.getRange();
      buffer.changeCount = changeCount;
      this._events.next(createEditEvent(this.createFileVersion(filePath, changeCount), oldRange, oldText, newRange, buffer.getText()));
    }
  }, {
    key: '_open',
    value: function _open(filePath, contents, changeCount) {
      // We never call setPath on these TextBuffers as that will

      var newBuffer = new (_simpleTextBuffer || _load_simpleTextBuffer()).default(contents);
      newBuffer.changeCount = changeCount;
      this._buffers.set(filePath, newBuffer);
      this._events.next(createOpenEvent(this.createFileVersion(filePath, changeCount), contents));
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      for (var _ref3 of this._buffers.entries()) {
        var _ref2 = _slicedToArray(_ref3, 2);

        var filePath = _ref2[0];
        var buffer = _ref2[1];

        this._emitClose(filePath, buffer);
        buffer.destroy();
      }
      this._buffers.clear();
      this._resources.dispose();
      this._events.complete();
    }
  }, {
    key: 'getBuffer',
    value: function getBuffer(filePath) {
      return this._buffers.get(filePath);
    }
  }, {
    key: 'getBufferAtVersion',
    value: _asyncToGenerator(function* (fileVersion) {
      yield this._requests.waitForBufferAtVersion(fileVersion);

      var buffer = this._buffers.get(fileVersion.filePath);
      if (buffer == null) {
        throw new Error('File closed at requested revision');
      }if (buffer.changeCount !== fileVersion.version) {
        throw new Error('Sync error. File at unexpected version');
      }
      return buffer;
    })
  }, {
    key: 'observeFileEvents',
    value: function observeFileEvents() {
      var _this2 = this;

      return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.from(Array.from(this._buffers.entries()).map(function (_ref4) {
        var _ref42 = _slicedToArray(_ref4, 2);

        var filePath = _ref42[0];
        var buffer = _ref42[1];

        (0, (_assert || _load_assert()).default)(buffer != null);
        return createOpenEvent(_this2.createFileVersion(filePath, buffer.changeCount), buffer.getText());
      })).concat(this._events);
    }
  }, {
    key: '_emitClose',
    value: function _emitClose(filePath, buffer) {
      this._events.next(createCloseEvent(this.createFileVersion(filePath, buffer.changeCount)));
    }
  }, {
    key: 'createFileVersion',
    value: function createFileVersion(filePath, version) {
      return {
        notifier: this,
        filePath: filePath,
        version: version
      };
    }
  }]);

  return FileCache;
})();

exports.FileCache = FileCache;

function createOpenEvent(fileVersion, contents) {
  return {
    kind: 'open',
    fileVersion: fileVersion,
    contents: contents
  };
}

function createCloseEvent(fileVersion) {
  return {
    kind: 'close',
    fileVersion: fileVersion
  };
}

function createEditEvent(fileVersion, oldRange, oldText, newRange, newText) {
  return {
    kind: 'edit',
    fileVersion: fileVersion,
    oldRange: oldRange,
    oldText: oldText,
    newRange: newRange,
    newText: newText
  };
}
// start the TextBuffer attempting to sync with the file system.