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
exports.NotifiersByConnection = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _nuclideOpenFilesRpc;

function _load_nuclideOpenFilesRpc() {
  return _nuclideOpenFilesRpc = require('../../nuclide-open-files-rpc');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)();

const RESYNC_TIMEOUT_MS = 2000;

function getOpenFilesService(connection) {
  return (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByConnection)((_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).OPEN_FILES_SERVICE, connection);
}

// Keeps a FileNotifier around per ServerConnection.
//
// Also handles sending 'close' events to the FileNotifier so that
// the per-Buffer BufferSubscription does not need to live past
// the buffer being destroyed.
let NotifiersByConnection = exports.NotifiersByConnection = class NotifiersByConnection {

  constructor() {
    let getService = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : getOpenFilesService;

    this._getService = getService;
    this._notifiers = new (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).ConnectionCache(connection => this._getService(connection).initialize());
  }

  dispose() {
    this._notifiers.dispose();
  }

  // Returns null for a buffer to a file on a closed remote connection
  // or a new buffer which has not been saved.
  get(buffer) {
    return this.getForUri(buffer.getPath());
  }

  getForConnection(connection) {
    return this._notifiers.get(connection);
  }

  // Returns null for a buffer to a file on a closed remote connection
  // or a new buffer which has not been saved.
  getForUri(path) {
    return this._notifiers.getForUri(path);
  }

  // Sends the close message to the appropriate FileNotifier.
  // Will keep trying to send until the send succeeds or
  // the corresponding ServerConnection is closed.
  sendClose(filePath, version) {
    var _this = this;

    if (filePath === '') {
      return;
    }

    // Keep trying until either the close completes, or
    // the remote connection goes away
    const sendMessage = (() => {
      var _ref = (0, _asyncToGenerator.default)(function* () {
        const notifier = _this.getForUri(filePath);
        if (notifier != null) {
          try {
            const n = yield notifier;
            const message = {
              kind: (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).FileEventKind.CLOSE,
              fileVersion: {
                notifier: n,
                filePath: filePath,
                version: version
              }
            };

            yield message.fileVersion.notifier.onEvent(message);
          } catch (e) {
            logger.error(`Error sending file close event: ${ filePath } ${ version }`, e);
            setTimeout(sendMessage, RESYNC_TIMEOUT_MS);
          }
        }
      });

      return function sendMessage() {
        return _ref.apply(this, arguments);
      };
    })();

    sendMessage();
  }
};