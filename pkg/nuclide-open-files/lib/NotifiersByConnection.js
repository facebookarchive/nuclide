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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideRemoteConnection2;

function _nuclideRemoteConnection() {
  return _nuclideRemoteConnection2 = require('../../nuclide-remote-connection');
}

var _nuclideOpenFilesRpc2;

function _nuclideOpenFilesRpc() {
  return _nuclideOpenFilesRpc2 = require('../../nuclide-open-files-rpc');
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var _commonsNodeNuclideUri2;

function _commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri2 = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var logger = (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)();

var RESYNC_TIMEOUT_MS = 2000;

function getServiceByConnection(connection) {
  var service = undefined;
  if (connection == null) {
    service = (0, (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).getlocalService)((_nuclideOpenFilesRpc2 || _nuclideOpenFilesRpc()).OPEN_FILES_SERVICE);
  } else {
    service = connection.getService((_nuclideOpenFilesRpc2 || _nuclideOpenFilesRpc()).OPEN_FILES_SERVICE);
  }
  (0, (_assert2 || _assert()).default)(service != null);
  return service;
}

// Keeps a FileNotifier around per ServerConnection.
//
// Also handles sending 'close' events to the FileNotifier so that
// the per-Buffer BufferSubscription does not need to live past
// the buffer being destroyed.

var NotifiersByConnection = (function () {
  function NotifiersByConnection() {
    var _this = this;

    var getService = arguments.length <= 0 || arguments[0] === undefined ? getServiceByConnection : arguments[0];

    _classCallCheck(this, NotifiersByConnection);

    this._getService = getService;
    this._notifiers = new Map();

    this._subscription = (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).ServerConnection.onDidCloseServerConnection(function (connection) {
      _this._notifiers.delete(connection);
    });

    this._addConnection(null);
    (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).ServerConnection.observeConnections(function (connection) {
      _this._addConnection(connection);
    });
  }

  _createClass(NotifiersByConnection, [{
    key: 'dispose',
    value: function dispose() {
      this._subscription.dispose();
    }

    // Returns null for a buffer to a file on a closed remote connection
    // or a new buffer which has not been saved.
  }, {
    key: 'get',
    value: function get(buffer) {
      return this.getForPath(buffer.getPath());
    }

    // Returns null for a buffer to a file on a closed remote connection
    // or a new buffer which has not been saved.
  }, {
    key: 'getForPath',
    value: function getForPath(path) {
      if (path == null) {
        return null;
      }

      // Note that there is a window after a ServerConnection is closed when
      // TextBuffers on that connection are still around receiving events.
      var connection = (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).ServerConnection.getForUri(path);
      if (connection == null && (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.isRemote(path)) {
        return null;
      }

      return this._notifiers.get(connection);
    }
  }, {
    key: '_addConnection',
    value: function _addConnection(connection) {
      (0, (_assert2 || _assert()).default)(!this._notifiers.has(connection));
      var service = this._getService(connection);
      (0, (_assert2 || _assert()).default)(service != null);
      this._notifiers.set(connection, service.initialize());
    }

    // Sends the close message to the appropriate FileNotifier.
    // Will keep trying to send until the send succeeds or
    // the corresponding ServerConnection is closed.
  }, {
    key: 'sendClose',
    value: function sendClose(filePath, version) {
      var _this2 = this;

      (0, (_assert2 || _assert()).default)(filePath !== '');

      var message = {
        kind: 'close',
        fileVersion: {
          filePath: filePath,
          version: version
        }
      };

      // Keep trying until either the close completes, or
      // the remote connection goes away
      var sendMessage = _asyncToGenerator(function* () {
        var notifier = _this2.getForPath(filePath);
        if (notifier != null) {
          try {
            yield (yield notifier).onEvent(message);
          } catch (e) {
            logger.error('Error sending file close event: ' + JSON.stringify(message), e);
            setTimeout(sendMessage, RESYNC_TIMEOUT_MS);
          }
        }
      });

      sendMessage();
    }
  }]);

  return NotifiersByConnection;
})();

exports.NotifiersByConnection = NotifiersByConnection;