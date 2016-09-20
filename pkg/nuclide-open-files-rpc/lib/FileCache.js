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

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _simpleTextBuffer2;

function _simpleTextBuffer() {
  return _simpleTextBuffer2 = _interopRequireDefault(require('simple-text-buffer'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _commonsNodePromise2;

function _commonsNodePromise() {
  return _commonsNodePromise2 = require('../../commons-node/promise');
}

var _commonsNodeCollection2;

function _commonsNodeCollection() {
  return _commonsNodeCollection2 = require('../../commons-node/collection');
}

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

var FileCache = (function () {
  function FileCache() {
    _classCallCheck(this, FileCache);

    this._buffers = new Map();
    this._requests = new (_commonsNodeCollection2 || _commonsNodeCollection()).MultiMap();
    this._events = new (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Subject();
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
          (0, (_assert2 || _assert()).default)(buffer == null);
          this._open(filePath, event.contents, changeCount);
          break;
        case 'close':
          (0, (_assert2 || _assert()).default)(buffer != null);
          this._buffers.delete(filePath);
          this._emitClose(filePath, buffer);
          buffer.destroy();
          break;
        case 'edit':
          (0, (_assert2 || _assert()).default)(buffer != null);
          (0, (_assert2 || _assert()).default)(buffer.changeCount === changeCount - 1);
          (0, (_assert2 || _assert()).default)(buffer.getTextInRange(event.oldRange) === event.oldText);
          buffer.setTextInRange(event.oldRange, event.newText);
          (0, (_assert2 || _assert()).default)(buffer.changeCount === changeCount);
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
      this._checkRequests(filePath);
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

      var newBuffer = new (_simpleTextBuffer2 || _simpleTextBuffer()).default(contents);
      newBuffer.changeCount = changeCount;
      this._buffers.set(filePath, newBuffer);
      this._events.next(createOpenEvent(this.createFileVersion(filePath, changeCount), contents));
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      for (var filePath of this._buffers.keys()) {
        var buffer = this._buffers.get(filePath);
        (0, (_assert2 || _assert()).default)(buffer != null);
        this._emitClose(filePath, buffer);
        buffer.destroy();
      }
      for (var request of this._requests.values()) {
        request.reject(createRejectError());
      }
    }
  }, {
    key: 'getBufferAtVersion',
    value: function getBufferAtVersion(fileVersion) {
      var filePath = fileVersion.filePath;
      var version = fileVersion.version;
      var currentBuffer = this._buffers.get(filePath);
      if (currentBuffer != null && currentBuffer.changeCount === version) {
        return Promise.resolve(currentBuffer);
      } else if (currentBuffer != null && currentBuffer.changeCount > version) {
        return Promise.reject(createRejectError());
      }
      var request = new Request(filePath, version);
      this._requests.add(filePath, request);
      return request.promise;
    }
  }, {
    key: '_checkRequests',
    value: function _checkRequests(filePath) {
      var buffer = this._buffers.get(filePath);
      if (buffer == null) {
        return;
      }
      var requests = Array.from(this._requests.get(filePath));

      var resolves = requests.filter(function (request) {
        return request.changeCount === buffer.changeCount;
      });
      var rejects = requests.filter(function (request) {
        return request.changeCount < buffer.changeCount;
      });
      var remaining = requests.filter(function (request) {
        return request.changeCount > buffer.changeCount;
      });
      this._requests.set(filePath, remaining);

      resolves.forEach(function (request) {
        return request.resolve(buffer);
      });
      rejects.forEach(function (request) {
        return request.reject(createRejectError());
      });
    }
  }, {
    key: 'observeFileEvents',
    value: function observeFileEvents() {
      var _this = this;

      return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.from(Array.from(this._buffers.entries()).map(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2);

        var filePath = _ref2[0];
        var buffer = _ref2[1];

        (0, (_assert2 || _assert()).default)(buffer != null);
        return createOpenEvent(_this.createFileVersion(filePath, buffer.changeCount), buffer.getText());
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

function createRejectError() {
  return new Error('File modified past requested change');
}

var Request = (function (_Deferred) {
  _inherits(Request, _Deferred);

  function Request(filePath, changeCount) {
    _classCallCheck(this, Request);

    _get(Object.getPrototypeOf(Request.prototype), 'constructor', this).call(this);

    this.filePath = filePath;
    this.changeCount = changeCount;
  }

  return Request;
})((_commonsNodePromise2 || _commonsNodePromise()).Deferred);

// start the TextBuffer attempting to sync with the file system.