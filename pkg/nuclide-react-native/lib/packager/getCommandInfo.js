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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/**
 * Get the command that will run the packager server based on the current workspace.
 * TODO: We need to have a solid concept of an "active project" that's consistent across Nuclide
 *       (i.e. where we should look for commands like this) and use that here. The current behavior
 *       of everything having its own algorithm is bad.
 */

var getCommandInfo = _asyncToGenerator(function* () {
  var localDirectories = atom.project.getDirectories().map(function (dir) {
    return dir.getPath();
  }).filter(function (uri) {
    return !(_nuclideRemoteUri2 || _nuclideRemoteUri()).default.isRemote(uri);
  });

  for (var dir of localDirectories) {
    var commandInfo = yield getCommandFromNodePackage(dir); // eslint-disable-line babel/no-await-in-loop
    if (commandInfo != null) {
      return commandInfo;
    }
  }

  for (var dir of localDirectories) {
    var commandInfo = yield getCommandFromBuck(dir); // eslint-disable-line babel/no-await-in-loop
    if (commandInfo != null) {
      return commandInfo;
    }
  }
});

exports.getCommandInfo = getCommandInfo;

var getCommandFromNodePackage = _asyncToGenerator(function* (dir) {
  return (yield getCommandFromNodeModules(dir)) || (yield getCommandFromReactNative(dir));
}

/**
 * Look in the nearest node_modules directory for react-native and extract the packager script if
 * it's found.
 */
);

var getCommandFromNodeModules = _asyncToGenerator(function* (dir) {
  var nodeModulesParent = yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.findNearestFile('node_modules', dir);
  if (nodeModulesParent == null) {
    return null;
  }

  var command = yield getCommandForCli((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(nodeModulesParent, 'node_modules', 'react-native'));

  return command == null ? null : _extends({}, command, {
    cwd: nodeModulesParent
  });
}

/**
 * See if this is React Native itself and, if so, return the command to run the packager. This is
 * special cased so that the bundled examples work out of the box.
 */
);

var getCommandFromReactNative = _asyncToGenerator(function* (dir) {
  var projectRoot = yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.findNearestFile('package.json', dir);
  if (projectRoot == null) {
    return null;
  }
  var filePath = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(projectRoot, 'package.json');
  var content = yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.readFile(filePath);
  var parsed = JSON.parse(content);
  var isReactNative = parsed.name === 'react-native';

  if (!isReactNative) {
    return null;
  }

  var command = yield getCommandForCli(projectRoot);

  return command == null ? null : _extends({}, command, {
    cwd: projectRoot
  });
});

var getCommandFromBuck = _asyncToGenerator(function* (dir) {
  var projectRoot = yield (0, (_nuclideBuckBase2 || _nuclideBuckBase()).getBuckProjectRoot)(dir);
  if (projectRoot == null) {
    return null;
  }

  // TODO(matthewwithanm): Move this to BuckUtils?
  var filePath = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(projectRoot, '.buckConfig');
  var content = yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.readFile(filePath);
  var parsed = (_ini2 || _ini()).default.parse('scope = global\n' + content);
  var section = parsed['react-native'];
  if (section == null || section.server == null) {
    return null;
  }
  return {
    cwd: projectRoot,
    command: section.server
  };
});

var getCommandForCli = _asyncToGenerator(function* (pathToReactNative) {
  var cliPath = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(pathToReactNative, 'local-cli', 'cli.js');
  var cliExists = yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.exists(cliPath);
  if (!cliExists) {
    return null;
  }
  return {
    command: (_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.get('nuclide-react-native.pathToNode'),
    args: [cliPath, 'start']
  };
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsNodeFsPromise2;

function _commonsNodeFsPromise() {
  return _commonsNodeFsPromise2 = _interopRequireDefault(require('../../../commons-node/fsPromise'));
}

var _nuclideFeatureConfig2;

function _nuclideFeatureConfig() {
  return _nuclideFeatureConfig2 = _interopRequireDefault(require('../../../nuclide-feature-config'));
}

var _nuclideBuckBase2;

function _nuclideBuckBase() {
  return _nuclideBuckBase2 = require('../../../nuclide-buck-base');
}

var _ini2;

function _ini() {
  return _ini2 = _interopRequireDefault(require('ini'));
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../../nuclide-remote-uri'));
}