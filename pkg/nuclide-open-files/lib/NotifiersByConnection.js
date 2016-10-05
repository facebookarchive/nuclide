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

var logger = (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)();

var RESYNC_TIMEOUT_MS = 2000;

function getOpenFilesService(connection) {
  return (0, (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).getServiceByConnection)((_nuclideOpenFilesRpc2 || _nuclideOpenFilesRpc()).OPEN_FILES_SERVICE, connection);
}

// Keeps a FileNotifier around per ServerConnection.
//
// Also handles sending 'close' events to the FileNotifier so that
// the per-Buffer BufferSubscription does not need to live past
// the buffer being destroyed.

var NotifiersByConnection = (function () {
  function NotifiersByConnection() {
    var _this = this;

    var getService = arguments.length <= 0 || arguments[0] === undefined ? getOpenFilesService : arguments[0];

    _classCallCheck(this, NotifiersByConnection);

    this._getService = getService;
    this._notifiers = new (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).ConnectionCache(function (connection) {
      return _this._getService(connection).initialize();
    });
  }

  _createClass(NotifiersByConnection, [{
    key: 'dispose',
    value: function dispose() {
      this._notifiers.dispose();
    }

    // Returns null for a buffer to a file on a closed remote connection
    // or a new buffer which has not been saved.
  }, {
    key: 'get',
    value: function get(buffer) {
      return this.getForUri(buffer.getPath());
    }
  }, {
    key: 'getForConnection',
    value: function getForConnection(connection) {
      return this._notifiers.get(connection);
    }

    // Returns null for a buffer to a file on a closed remote connection
    // or a new buffer which has not been saved.
  }, {
    key: 'getForUri',
    value: function getForUri(path) {
      return this._notifiers.getForUri(path);
    }

    // Sends the close message to the appropriate FileNotifier.
    // Will keep trying to send until the send succeeds or
    // the corresponding ServerConnection is closed.
  }, {
    key: 'sendClose',
    value: function sendClose(filePath, version) {
      var _this2 = this;

      if (filePath === '') {
        return;
      }

      // Keep trying until either the close completes, or
      // the remote connection goes away
      var sendMessage = _asyncToGenerator(function* () {
        var notifier = _this2.getForUri(filePath);
        if (notifier != null) {
          try {
            var n = yield notifier;
            var message = {
              kind: 'close',
              fileVersion: {
                notifier: n,
                filePath: filePath,
                version: version
              }
            };

            yield message.fileVersion.notifier.onEvent(message);
          } catch (e) {
            logger.error('Error sending file close event: ' + filePath + ' ' + version, e);
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