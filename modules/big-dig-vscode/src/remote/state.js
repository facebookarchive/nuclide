"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.onEachFilesystem = onEachFilesystem;
exports.getFilesystems = getFilesystems;
exports.getConnectedFilesystems = getConnectedFilesystems;
exports.getServers = getServers;
exports.getFilesystemForUri = getFilesystemForUri;
exports.startFilesystems = startFilesystems;

function vscode() {
  const data = _interopRequireWildcard(require("vscode"));

  vscode = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _onEachObservedClosable() {
  const data = _interopRequireDefault(require("../util/onEachObservedClosable"));

  _onEachObservedClosable = function () {
    return data;
  };

  return data;
}

function _ConnectionWrapper() {
  const data = require("../ConnectionWrapper");

  _ConnectionWrapper = function () {
    return data;
  };

  return data;
}

function _RemoteFileSystem() {
  const data = require("../RemoteFileSystem");

  _RemoteFileSystem = function () {
    return data;
  };

  return data;
}

function _ThriftRemoteFileSystem() {
  const data = require("../ThriftRemoteFileSystem");

  _ThriftRemoteFileSystem = function () {
    return data;
  };

  return data;
}

function _configuration() {
  const data = require("../configuration");

  _configuration = function () {
    return data;
  };

  return data;
}

function _Server() {
  const data = require("./Server");

  _Server = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
const logger = (0, _log4js().getLogger)('remote');
const hostnameToFilesystem = new Map();
const filesystemSubject = new _RxMin.Subject();
/**
 * Listen for new filesystems, returning a disposable that will cause listening
 * to stop (and dispose of any active handlers, by default).
 *
 * @param handler called on each new filesystem. May return a disposable that
 * will be disposed if the filesystem is closed or (by default) if unsubscribed.
 * @param options
 *    - `ignoreCurrent`: do not call `handler` on preexisting filesystems.
 *      Default: false.
 *    - `stayAliveOnUnsubscribe`: do not dispose handlers when unsubscribed; do
 *      don only after its filesystem is disposed. Default: false.
 * @return a disposable that will stop listening for new filesystems. If
 * `stayAliveOnUnsubscribe: false`, then it will also dispose of all handlers.
 */

function onEachFilesystem(handler, options = {}) {
  const emitCurrent = !options.ignoreCurrent;
  const disposeHandlersOnUnsubscribe = !options.stayAliveOnUnsubscribe;
  return (0, _onEachObservedClosable().default)(filesystemSubject.startWith(...(emitCurrent ? hostnameToFilesystem.values() : [])), handler, (fs, listener) => fs.onDisposed(listener), {
    disposeHandlersOnUnsubscribe,
    disposeHandlerOnNext: false
  });
}
/**
 * @return a list of all existing filesystems.
 */


function getFilesystems() {
  return [...hostnameToFilesystem.values()];
}
/**
 * @return a list of all filesystems that have current connections.
 */


function getConnectedFilesystems() {
  return getFilesystems().map(fs => ({
    fs,
    conn: fs.getServer().getCurrentConnection()
  })).map(({
    fs,
    conn
  }) => conn == null ? null : {
    fs,
    conn
  }).filter(Boolean);
}
/**
 * @return a list of existing servers.
 */


function getServers() {
  return getFilesystems().map(fs => fs.getServer());
}
/** @return the filesystem that handles the uri, else null. */


function getFilesystemForUri(uri) {
  return getFilesystems().find(fs => fs.handlesResource(uri));
}
/**
 * Start loading filesystems from configured profiles. Call this *just once*
 * when the extension is activated.
 * @returns a disposable that will dispose of all existing filesystems and stop
 * loading new filesystems.
 *
 * TODO(T27503907): listen for configuration changes and load/unload
 * filesystems.
 */


function startFilesystems() {
  // Maintain a list of existing filesystems.
  // Note that we turn `emitCurrent` off because it relies on `filesystems`
  const maintainExistingFsList = onEachFilesystem(fs => {
    if (fs.isDisposed()) {
      return;
    } else {
      const hostname = fs.getHostname();
      hostnameToFilesystem.set(hostname, fs);
      return () => {
        fs.dispose();
        hostnameToFilesystem.delete(hostname);
      };
    }
  }, {
    emitCurrent: false,
    disposeOnUnsubscribe: true
  });
  const sub = (0, _configuration().connectionProfileUpdates)({
    withCurrent: true
  }).subscribe(change => {
    if (change.kind === 'added') {
      const {
        profile
      } = change;

      try {
        const server = new (_Server().Server)(profile);
        const rfs = createRemoteFileSystem(profile.hostname, server);
        logger.info(`Loaded filesystem ${profile.hostname}`);
        filesystemSubject.next(rfs);
      } catch (error) {
        logger.error(error);
        vscode().window.showErrorMessage(`Could not load filesystem for ${profile.hostname}.`);
      }
    } else if (change.kind === 'removed') {
      const {
        hostname
      } = change;
      const fs = hostnameToFilesystem.get(hostname);

      if (fs != null) {
        fs.dispose();
        logger.info(`Unloaded filesystem ${hostname}`);
      }
    } else {
      change;
    }
  });
  return {
    dispose() {
      maintainExistingFsList.dispose();
      sub.unsubscribe();
    }

  };
}

function createRemoteFileSystem(hostname, server) {
  const useThriftFs = vscode().workspace.getConfiguration('big-dig').get('rfs.option', false);
  logger.info(`Using Thrift remote file system: ${String(useThriftFs)}`);

  if (useThriftFs) {
    return new (_ThriftRemoteFileSystem().ThriftRemoteFileSystem)(hostname, server);
  }

  return new (_RemoteFileSystem().RemoteFileSystem)(hostname, server);
}