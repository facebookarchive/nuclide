'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NotifiersByConnection = undefined;

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _nuclideOpenFilesRpc;

function _load_nuclideOpenFilesRpc() {
  return _nuclideOpenFilesRpc = require('../../nuclide-open-files-rpc');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _event;

function _load_event() {
  return _event = require('../../../modules/nuclide-commons/event');
}

var _collection;

function _load_collection() {
  return _collection = require('../../../modules/nuclide-commons/collection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-open-files'); /**
                                                                                  * Copyright (c) 2015-present, Facebook, Inc.
                                                                                  * All rights reserved.
                                                                                  *
                                                                                  * This source code is licensed under the license found in the LICENSE file in
                                                                                  * the root directory of this source tree.
                                                                                  *
                                                                                  * 
                                                                                  * @format
                                                                                  */

const RESYNC_TIMEOUT_MS = 2000;

function getOpenFilesService(connection) {
  return (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByConnection)((_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).OPEN_FILES_SERVICE, connection);
}

function uriMatchesConnection(uri, connection) {
  if (connection == null) {
    return (_nuclideUri || _load_nuclideUri()).default.isLocal(uri);
  } else {
    return connection.getRemoteHostname() === (_nuclideUri || _load_nuclideUri()).default.getHostnameOpt(uri);
  }
}

// Keeps a FileNotifier around per ServerConnection.
//
// Also handles sending 'close' events to the FileNotifier so that
// the per-Buffer BufferSubscription does not need to live past
// the buffer being destroyed.
class NotifiersByConnection {

  constructor(getService = getOpenFilesService) {
    this._getService = getService;
    const filterByConnection = (connection, dirs) => new Set(dirs.filter(dir => uriMatchesConnection(dir, connection)));
    this._notifiers = new (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).ConnectionCache(connection => {
      const result = this._getService(connection).initialize();
      // NOTE: It's important to use `await` here rather than .then.
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
    this._subscriptions = new (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).ConnectionCache(connection => {
      const subscription = (0, (_event || _load_event()).observableFromSubscribeFunction)(cb => atom.project.onDidChangePaths(cb)).map(dirs => filterByConnection(connection, dirs)).distinctUntilChanged((_collection || _load_collection()).areSetsEqual).subscribe(async dirs => {
        const notifier = await this._notifiers.get(connection);
        notifier.onDirectoriesChanged(dirs);
      });
      return Promise.resolve(new (_UniversalDisposable || _load_UniversalDisposable()).default(() => subscription.unsubscribe()));
    });
  }

  dispose() {
    this._notifiers.dispose();
    this._subscriptions.dispose();
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
    if (filePath === '') {
      return;
    }

    // Keep trying until either the close completes, or
    // the remote connection goes away
    const sendMessage = async () => {
      const notifier = this.getForUri(filePath);
      if (notifier != null) {
        try {
          const n = await notifier;
          const message = {
            kind: (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).FileEventKind.CLOSE,
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