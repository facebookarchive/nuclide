'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getAdditionalLogFiles = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (deadline) {
    const hostnames = (0, (_collection || _load_collection()).arrayUnique)(atom.project.getPaths().filter((_nuclideUri || _load_nuclideUri()).default.isRemote).map((_nuclideUri || _load_nuclideUri()).default.getHostname));

    return Promise.all(hostnames.map((() => {
      var _ref2 = (0, _asyncToGenerator.default)(function* (hostname) {
        const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getHhvmDebuggerServiceByNuclideUri)((_nuclideUri || _load_nuclideUri()).default.createRemoteUri(hostname, '/'));
        if (service != null) {
          const debuggerSvc = new service.HhvmDebuggerService();
          return {
            title: `HHVM Debugger log for ${hostname}`,
            data: yield debuggerSvc.createLogFilePaste()
          };
        }

        return {
          title: `HHVM Debugger log for ${hostname}`,
          data: '<service unavailable>'
        };
      });

      return function (_x2) {
        return _ref2.apply(this, arguments);
      };
    })()).filter(function (file) {
      return file != null;
    }));
  });

  return function getAdditionalLogFiles(_x) {
    return _ref.apply(this, arguments);
  };
})();

exports.createDebuggerProvider = createDebuggerProvider;
exports.getHomeFragments = getHomeFragments;
exports.createAdditionalLogFilesProvider = createAdditionalLogFilesProvider;

var _HhvmLaunchAttachProvider;

function _load_HhvmLaunchAttachProvider() {
  return _HhvmLaunchAttachProvider = require('./HhvmLaunchAttachProvider');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
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

function createDebuggerProvider() {
  return {
    name: 'hhvm',
    getLaunchAttachProvider(connection) {
      if ((_nuclideUri || _load_nuclideUri()).default.isRemote(connection)) {
        return new (_HhvmLaunchAttachProvider || _load_HhvmLaunchAttachProvider()).HhvmLaunchAttachProvider('Hack / PHP', connection);
      }
      return null;
    }
  };
}

function getHomeFragments() {
  return {
    feature: {
      title: 'PHP Debugger',
      icon: 'nuclicon-debugger',
      description: 'Connect to a PHP server process and debug Hack code from within Nuclide.',
      command: 'nuclide-debugger:show-attach-dialog'
    },
    priority: 6
  };
}

function createAdditionalLogFilesProvider() {
  return {
    id: 'hhvm-debugger',
    getAdditionalLogFiles
  };
}