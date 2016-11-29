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
exports.openArcDeepLink = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let openArcDeepLink = exports.openArcDeepLink = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (params, remoteProjectsService) {
    const { project, path, line, column } = params;
    try {
      if (!(typeof project === 'string')) {
        throw new Error('Must provide an Arcanist project');
      }

      if (!path) {
        throw new Error('Must provide a valid path');
      }

      if (remoteProjectsService != null) {
        yield new Promise(function (resolve) {
          return remoteProjectsService.waitForRemoteProjectReload(resolve);
        });
      }

      // Fetch the Arcanist project of each open project.
      // This also gets parent projects, in case we have a child project mounted.
      const arcInfos = yield Promise.all(atom.project.getPaths().map((() => {
        var _ref2 = (0, _asyncToGenerator.default)(function* (dir) {
          const arcService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getArcanistServiceByNuclideUri)(dir);
          const matches = [];
          let currentDir = dir;
          for (;;) {
            const info = yield arcService.findArcProjectIdAndDirectory(currentDir);
            if (info == null) {
              break;
            }
            matches.push(info);
            currentDir = (_nuclideUri || _load_nuclideUri()).default.dirname(info.directory);
          }
          return matches;
        });

        return function (_x3) {
          return _ref2.apply(this, arguments);
        };
      })()));

      const match = [].concat(...arcInfos).find(function (arcInfo) {
        return arcInfo != null && arcInfo.projectId === project;
      });
      if (match == null) {
        // TODO: send URL to other windows if they exist
        throw new Error(`Arcanist project ${ project } not found in open projects.`);
      }

      // Params can be strings or arrays. Always convert to an array
      const paths = ensureArray(path);
      const lines = line == null ? null : ensureArray(line);
      const columns = column == null ? null : ensureArray(column);
      for (let i = 0; i < paths.length; i++) {
        const localPath = (_nuclideUri || _load_nuclideUri()).default.join(match.directory, paths[i]);
        const intLine = lines == null ? undefined : parseInt(lines[i], 10) - 1;
        const intColumn = columns == null ? undefined : parseInt(columns[i], 10) - 1;
        (0, (_goToLocation || _load_goToLocation()).goToLocation)(localPath, intLine, intColumn);
      }
    } catch (err) {
      atom.notifications.addError(err.message);
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

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ensureArray(x) {
  return typeof x === 'string' ? [x] : x;
}