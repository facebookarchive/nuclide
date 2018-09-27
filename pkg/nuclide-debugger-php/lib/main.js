"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getHomeFragments = getHomeFragments;
exports.createAdditionalLogFilesProvider = createAdditionalLogFilesProvider;

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
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
 *  strict-local
 * @format
 */
function getHomeFragments() {
  return {
    feature: {
      title: 'Hack/PHP Debugger',
      icon: 'nuclicon-debugger',
      description: 'Connect to an HHVM server process and debug Hack/PHP code from within Nuclide.',
      command: 'debugger:show-attach-dialog'
    },
    priority: 6
  };
}

async function getAdditionalLogFiles(deadline) {
  const hostnames = (0, _collection().arrayUnique)(atom.project.getPaths().filter(_nuclideUri().default.isRemote).map(_nuclideUri().default.getHostname));
  return Promise.all(hostnames.map(async hostname => {
    const service = (0, _nuclideRemoteConnection().getHhvmDebuggerServiceByNuclideUri)(_nuclideUri().default.createRemoteUri(hostname, '/'));

    if (service != null) {
      return {
        title: `HHVM Debugger log for ${hostname}`,
        data: await service.getDebugServerLog()
      };
    }

    return {
      title: `HHVM Debugger log for ${hostname}`,
      data: '<service unavailable>'
    };
  }).filter(file => file != null));
}

function createAdditionalLogFilesProvider() {
  return {
    id: 'hhvm-debugger',
    getAdditionalLogFiles
  };
}