"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setUpRsyncTransport = setUpRsyncTransport;

function _consumeFirstProvider() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/consumeFirstProvider"));

  _consumeFirstProvider = function () {
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

var _rxjsCompatUmdMin = require("rxjs-compat/bundles/rxjs-compat.umd.min.js");

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
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
 *  strict-local
 * @format
 */

/**
 * Set up an Rsync transport from a remote host to the local host. The daemon
 * will be spawned locally with localRoot as the module directory.
 */
function setUpRsyncTransport(remoteRoot, localRoot, rsyncActions) {
  const remoteRsyncService = (0, _nuclideRemoteConnection().getRsyncServiceByNuclideUri)(remoteRoot);
  const localRsyncService = (0, _nuclideRemoteConnection().getRsyncServiceByNuclideUri)('');
  return _rxjsCompatUmdMin.Observable.defer(() => (0, _consumeFirstProvider().default)('nuclide.ssh-tunnel')).switchMap(tunnelService => {
    return localRsyncService.startDaemon(localRoot).refCount().switchMap(({
      port
    }) => tunnelService.openTunnels([{
      description: 'rsync',
      from: {
        host: remoteRoot,
        family: 4,
        port: 'any_available'
      },
      to: {
        host: 'localhost',
        family: 4,
        port
      }
    }]).switchMap(resolved => rsyncActions({
      downloadFolder: remoteSource => downloadFolder(remoteRsyncService, resolved[0].from.port, remoteSource)
    }).materialize()));
  }) // $FlowFixMe dematerialize
  .dematerialize();
}
/**
 * Download a remote folder to the current local root.
 */


function downloadFolder(rsyncService, port, remoteSource) {
  return rsyncService.syncFolder(_nuclideUri().default.getPath(remoteSource), `rsync://localhost:${port}/files/`).refCount().map(progress => ({
    type: 'progress',
    progress: progress / 100
  }));
}