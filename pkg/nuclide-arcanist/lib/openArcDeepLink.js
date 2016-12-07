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
            // eslint-disable-next-line babel/no-await-in-loop
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

      const matches = [].concat(...arcInfos).filter(Boolean).filter(function (arcInfo) {
        return arcInfo.projectId === project;
      });

      if (matches.length === 0) {
        // TODO: send URL to other windows if they exist
        // TODO: remember previous directories for this arcanist project
        throw new Error(`The file you are trying to open is in the \`${ project }\` project ` + 'but you do not have the project open.<br />' + 'Please add the project manually and try again.');
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
          var _ref3 = (0, _asyncToGenerator.default)(function* (arcInfo) {
            const { directory } = arcInfo;
            const fsService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getFileSystemServiceByNuclideUri)(directory);
            return fsService.exists((_nuclideUri || _load_nuclideUri()).default.join((_nuclideUri || _load_nuclideUri()).default.getPath(directory), paths[0]));
          });

          return function (_x4) {
            return _ref3.apply(this, arguments);
          };
        })());
        match = existing[0] || match;
      }

      for (let i = 0; i < paths.length; i++) {
        const localPath = (_nuclideUri || _load_nuclideUri()).default.join(match.directory, paths[i]);
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ensureArray(x) {
  return typeof x === 'string' ? [x] : x;
}