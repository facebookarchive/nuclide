'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.openArcDeepLink = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let openArcDeepLink = exports.openArcDeepLink = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (params, remoteProjectsService) {
    const { project, path, line, column } = params;
    try {
      if (!(typeof project === 'string')) {
        throw new Error('Must provide an Arcanist project');
      }

      if (!project.match(/^[a-zA-Z0-9-_]+$/)) {
        throw new Error('Must provide a valid Arcanist project');
      }

      if (!path) {
        throw new Error('Must provide a valid path');
      }

      if (remoteProjectsService != null) {
        yield new Promise(function (resolve) {
          return remoteProjectsService.waitForRemoteProjectReload(resolve);
        });
      }

      let matches = yield (0, (_getMatchingProjects || _load_getMatchingProjects()).default)(project, atom.project.getPaths());
      if (matches.length === 0) {
        // See if we had this project open previously, and try re-opening it.
        const lastPath = yield (0, (_tryReopenProject || _load_tryReopenProject()).default)(project, remoteProjectsService);
        if (lastPath != null) {
          matches = yield (0, (_getMatchingProjects || _load_getMatchingProjects()).default)(project, [lastPath]);
        }
      }

      if (matches.length === 0) {
        throw new Error(`The file you are trying to open is in the \`${project}\` project ` + 'but you do not have the project open.<br />' + 'Please add the project manually and try again.');
      }

      // Params can be strings or arrays. Always convert to an array
      const paths = ensureArray(path);
      const lines = line == null ? null : ensureArray(line);
      const columns = column == null ? null : ensureArray(column);

      // If there are multiple matches, prefer one which contains the first file.
      // Otherwise, we still want to support the case of opening a new file.
      let match = matches[0];
      if (matches.length > 1) {
        const existing = yield (0, (_promise || _load_promise()).asyncFilter)(matches, (() => {
          var _ref2 = (0, _asyncToGenerator.default)(function* (directory) {
            const fsService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getFileSystemServiceByNuclideUri)(directory);
            return fsService.exists((_nuclideUri || _load_nuclideUri()).default.join((_nuclideUri || _load_nuclideUri()).default.getPath(directory), paths[0]));
          });

          return function (_x3) {
            return _ref2.apply(this, arguments);
          };
        })());
        match = existing[0] || match;
      }

      for (let i = 0; i < paths.length; i++) {
        const localPath = (_nuclideUri || _load_nuclideUri()).default.join(match, paths[i]);
        const intLine = lines == null ? undefined : parseInt(lines[i], 10) - 1;
        const intColumn = columns == null ? undefined : parseInt(columns[i], 10) - 1;
        (0, (_goToLocation || _load_goToLocation()).goToLocation)(localPath, intLine, intColumn);
      }
    } catch (err) {
      atom.notifications.addError(err.message, { dismissable: true });
    }
  });

  return function openArcDeepLink(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('../../commons-atom/go-to-location');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _promise;

function _load_promise() {
  return _promise = require('../../commons-node/promise');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _getMatchingProjects;

function _load_getMatchingProjects() {
  return _getMatchingProjects = _interopRequireDefault(require('./getMatchingProjects'));
}

var _tryReopenProject;

function _load_tryReopenProject() {
  return _tryReopenProject = _interopRequireDefault(require('./tryReopenProject'));
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
 */

function ensureArray(x) {
  return typeof x === 'string' ? [x] : x;
}