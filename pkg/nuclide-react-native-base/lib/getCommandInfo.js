'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCommandInfo = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

/**
 * Get the command that will run the packager server based on the current workspace.
 * TODO: We need to have a solid concept of an "active project" that's consistent across Nuclide
 *       (i.e. where we should look for commands like this) and use that here. The current behavior
 *       of everything having its own algorithm is bad.
 */
let getCommandInfo = exports.getCommandInfo = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (projectRootPath) {
    if (projectRootPath == null) {
      return null;
    }
    yield (0, (_passesGK || _load_passesGK()).onceGkInitializedAsync)();
    if ((_nuclideUri || _load_nuclideUri()).default.isRemote(projectRootPath) && !(0, (_passesGK || _load_passesGK()).isGkEnabled)('nuclide_instarn_remote_projects')) {
      return null;
    }

    return (yield getCommandFromBuck(projectRootPath)) || getCommandFromNodePackage(projectRootPath);
  });

  return function getCommandInfo(_x) {
    return _ref.apply(this, arguments);
  };
})(); /**
       * Copyright (c) 2015-present, Facebook, Inc.
       * All rights reserved.
       *
       * This source code is licensed under the license found in the LICENSE file in
       * the root directory of this source tree.
       *
       * 
       * @format
       */

let getCommandFromNodePackage = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (dir) {
    return (yield getCommandFromNodeModules(dir)) || getCommandFromReactNative(dir);
  });

  return function getCommandFromNodePackage(_x2) {
    return _ref2.apply(this, arguments);
  };
})();

/**
 * Look in the nearest node_modules directory for react-native and extract the packager script if
 * it's found.
 */


let getCommandFromNodeModules = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (dir) {
    const fileSystemService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getFileSystemServiceByNuclideUri)(dir);
    const nodeModulesParent = yield fileSystemService.findNearestAncestorNamed('node_modules', dir);
    if (nodeModulesParent == null) {
      return null;
    }

    const command = yield getCommandForCli((_nuclideUri || _load_nuclideUri()).default.join(nodeModulesParent, 'node_modules', 'react-native'), fileSystemService);

    return command == null ? null : Object.assign({}, command, {
      cwd: nodeModulesParent
    });
  });

  return function getCommandFromNodeModules(_x3) {
    return _ref3.apply(this, arguments);
  };
})();

/**
 * See if this is React Native itself and, if so, return the command to run the packager. This is
 * special cased so that the bundled examples work out of the box.
 */


let getCommandFromReactNative = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* (dir) {
    const fileSystemService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getFileSystemServiceByNuclideUri)(dir);
    const projectRoot = yield fileSystemService.findNearestAncestorNamed('package.json', dir);
    if (projectRoot == null) {
      return null;
    }

    const filePath = (_nuclideUri || _load_nuclideUri()).default.join(projectRoot, 'package.json');
    const content = (yield fileSystemService.readFile(filePath)).toString('utf8');
    const parsed = JSON.parse(content);
    const isReactNative = parsed.name === 'react-native';

    if (!isReactNative) {
      return null;
    }

    const command = yield getCommandForCli(projectRoot, fileSystemService);
    return command == null ? null : Object.assign({}, command, {
      cwd: projectRoot
    });
  });

  return function getCommandFromReactNative(_x4) {
    return _ref4.apply(this, arguments);
  };
})();

let getCommandFromBuck = (() => {
  var _ref5 = (0, _asyncToGenerator.default)(function* (dir) {
    const projectRoot = yield (0, (_nuclideBuckBase || _load_nuclideBuckBase()).getBuckProjectRoot)(dir);
    if (projectRoot == null) {
      return null;
    }

    const fileSystemService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getFileSystemServiceByNuclideUri)(dir);

    // TODO(matthewwithanm): Move this to BuckUtils?
    const filePath = (_nuclideUri || _load_nuclideUri()).default.join(projectRoot, '.buckconfig');
    const content = (yield fileSystemService.readFile(filePath)).toString('utf8');
    const parsed = (_ini || _load_ini()).default.parse(`scope = global\n${content}`);
    const section = parsed['react-native'];
    if (section == null || section.server == null) {
      return null;
    }
    return {
      cwd: projectRoot,
      command: section.server
    };
  });

  return function getCommandFromBuck(_x5) {
    return _ref5.apply(this, arguments);
  };
})();

let getCommandForCli = (() => {
  var _ref6 = (0, _asyncToGenerator.default)(function* (pathToReactNative, fileSystemService) {
    const cliPath = (_nuclideUri || _load_nuclideUri()).default.join(pathToReactNative, 'local-cli', 'cli.js');
    const cliExists = yield fileSystemService.exists(cliPath);
    if (!cliExists) {
      return null;
    }
    return {
      command: (_featureConfig || _load_featureConfig()).default.get('nuclide-react-native.pathToNode'),
      args: [cliPath, 'start']
    };
  });

  return function getCommandForCli(_x6, _x7) {
    return _ref6.apply(this, arguments);
  };
})();

var _passesGK;

function _load_passesGK() {
  return _passesGK = require('../../commons-node/passesGK');
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

var _nuclideBuckBase;

function _load_nuclideBuckBase() {
  return _nuclideBuckBase = require('../../nuclide-buck-base');
}

var _ini;

function _load_ini() {
  return _ini = _interopRequireDefault(require('ini'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }