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

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _commonsNodePromise2;

function _commonsNodePromise() {
  return _commonsNodePromise2 = require('../../commons-node/promise');
}

var _commonsNodeCollection2;

function _commonsNodeCollection() {
  return _commonsNodeCollection2 = require('../../commons-node/collection');
}

var FileVersionNotifier = (function () {
  function FileVersionNotifier() {
    _classCallCheck(this, FileVersionNotifier);

    this._versions = new Map();
    this._requests = new (_commonsNodeCollection2 || _commonsNodeCollection()).MultiMap();
  }

  // If any out of sync state is detected then an Error is thrown.
  // This will force the client to send a 'sync' event to get back on track.

  _createClass(FileVersionNotifier, [{
    key: 'onEvent',
    value: function onEvent(event) {
      var filePath = event.fileVersion.filePath;
      var changeCount = event.fileVersion.version;
      switch (event.kind) {
        case 'open':
          this._versions.set(filePath, changeCount);
          break;
        case 'close':
          this._versions.delete(filePath);
          break;
        case 'edit':
          this._versions.set(filePath, changeCount);
          break;
        default:
          throw new Error('Unexpected FileEvent.kind: ' + event.kind);
      }
      this._checkRequests(filePath);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      for (var request of this._requests.values()) {
        request.reject(createRejectError());
      }
    }
  }, {
    key: 'getVersion',
    value: function getVersion(filePath) {
      return this._versions.get(filePath);
    }
  }, {
    key: 'waitForBufferAtVersion',
    value: function waitForBufferAtVersion(fileVersion) {
      var filePath = fileVersion.filePath;
      var version = fileVersion.version;
      var currentVersion = this._versions.get(filePath);
      if (currentVersion === version) {
        return Promise.resolve();
      } else if (currentVersion != null && currentVersion > version) {
        return Promise.reject(createRejectError());
      }
      var request = new Request(filePath, version);
      this._requests.add(filePath, request);
      return request.promise;
    }
  }, {
    key: '_checkRequests',
    value: function _checkRequests(filePath) {
      var currentVersion = this._versions.get(filePath);
      if (currentVersion == null) {
        return;
      }

      var requests = Array.from(this._requests.get(filePath));
      var resolves = requests.filter(function (request) {
        return request.changeCount === currentVersion;
      });
      var rejects = requests.filter(function (request) {
        return request.changeCount < currentVersion;
      });
      var remaining = requests.filter(function (request) {
        return request.changeCount > currentVersion;
      });
      this._requests.set(filePath, remaining);

      resolves.forEach(function (request) {
        return request.resolve();
      });
      rejects.forEach(function (request) {
        return request.reject(createRejectError());
      });
    }
  }]);

  return FileVersionNotifier;
})();

exports.FileVersionNotifier = FileVersionNotifier;

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