"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NotifiersByConnection = void 0;

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _nuclideOpenFilesRpc() {
  const data = require("../../nuclide-open-files-rpc");

  _nuclideOpenFilesRpc = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _event() {
  const data = require("../../../modules/nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

function _collection() {
  const data = require("../../../modules/nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
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
 * @format
 */
const logger = (0, _log4js().getLogger)('nuclide-open-files');
const RESYNC_TIMEOUT_MS = 2000;

function getOpenFilesService(connection) {
  return (0, _nuclideRemoteConnection().getServiceByConnection)(_nuclideOpenFilesRpc().OPEN_FILES_SERVICE, connection);
}

function uriMatchesConnection(uri, connection) {
  if (connection == null) {
    return _nuclideUri().default.isLocal(uri);
  } else {
    return connection.getRemoteHostname() === _nuclideUri().default.getHostnameOpt(uri);
  }
} // Keeps a FileNotifier around per ServerConnection.
//
// Also handles sending 'close' events to the FileNotifier so that
// the per-Buffer BufferSubscription does not need to live past
// the buffer being destroyed.


class NotifiersByConnection {
  constructor(getService = getOpenFilesService) {
    this._getService = getService;

    const filterByConnection = (connection, dirs) => new Set(dirs.filter(dir => uriMatchesConnection(dir, connection)));

    this._notifiers = new (_nuclideRemoteConnection().ConnectionCache)(connection => {
      const result = this._getService(connection).initialize(); // NOTE: It's important to use `await` here rather than .then.
      // v8's native async/await implementation treats .then and await differently.
      // See: https://stackoverflow.com/questions/46254408/promise-resolution-order-and-await


      async function onDirectoriesChanged() {
        const notifier = await result;
        const dirs = filterByConnection(connection, atom.project.getPaths());
        notifier.onDirectoriesChanged(dirs);
      }

      onDirectoriesChanged();
      return result;
    });
    this._subscriptions = new (_nuclideRemoteConnection().ConnectionCache)(connection => {
      const subscription = (0, _event().observableFromSubscribeFunction)(cb => atom.project.onDidChangePaths(cb)).map(dirs => filterByConnection(connection, dirs)).distinctUntilChanged(_collection().areSetsEqual).subscribe(async dirs => {
        const notifier = await this._notifiers.get(connection);
        notifier.onDirectoriesChanged(dirs);
      });
      return Promise.resolve(new (_UniversalDisposable().default)(() => subscription.unsubscribe()));
    });
  }

  dispose() {
    this._notifiers.dispose();

    this._subscriptions.dispose();
  } // Returns null for a buffer to a file on a closed remote connection
  // or a new buffer which has not been saved.


  get(buffer) {
    return this.getForUri(buffer.getPath());
  }

  getForConnection(connection) {
    return this._notifiers.get(connection);
  } // Returns null for a buffer to a file on a closed remote connection
  // or a new buffer which has not been saved.


  getForUri(path) {
    return this._notifiers.getForUri(path);
  } // Sends the close message to the appropriate FileNotifier.
  // Will keep trying to send until the send succeeds or
  // the corresponding ServerConnection is closed.


  sendClose(filePath, version) {
    if (filePath === '') {
      return;
    } // Keep trying until either the close completes, or
    // the remote connection goes away


    const sendMessage = async () => {
      const notifier = this.getForUri(filePath);

      if (notifier != null) {
        try {
          const n = await notifier;
          const message = {
            kind: _nuclideOpenFilesRpc().FileEventKind.CLOSE,
            fileVersion: {
              notifier: n,
              filePath,
              version
            }
          };
          await message.fileVersion.notifier.onFileEvent(message);
        } catch (e) {
          logger.error(`Error sending file close event: ${filePath} ${version}`, e);
          setTimeout(sendMessage, RESYNC_TIMEOUT_MS);
        }
      }
    };

    sendMessage();
  }

}

exports.NotifiersByConnection = NotifiersByConnection;