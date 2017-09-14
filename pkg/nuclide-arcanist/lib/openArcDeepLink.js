'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.openArcDeepLink = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

// Check if any other open windows have the given path.
let searchOtherWindows = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (path) {
    const windows = yield Promise.all(_electron.remote.BrowserWindow.getAllWindows()
    // Atom 1.17 added GitHub's git integration, which spawns a hidden
    // browser window which we should ignore.
    .filter(function (browserWindow) {
      return browserWindow.isVisible();
    }).map(function (browserWindow) {
      return new Promise(function (resolve, reject) {
        // In case `atom` hasn't been initialized yet.
        browserWindow.webContents.executeJavaScript('atom && atom.project.getPaths()', function (result) {
          // Guard against null returns (and also help Flow).
          const containsPath = Array.isArray(result) && result.find(function (project) {
            return typeof project === 'string' && (_nuclideUri || _load_nuclideUri()).default.contains(path, project);
          });
          // flowlint-next-line sketchy-null-mixed:off
          resolve(containsPath ? browserWindow : null);
        });
      });
    }));
    return windows.find(Boolean);
  });

  return function searchOtherWindows(_x) {
    return _ref.apply(this, arguments);
  };
})();

let openArcDeepLink = exports.openArcDeepLink = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (params, remoteProjectsService, deepLinkService, cwd = null) {
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
        const lastPath = (0, (_nuclideArcanistBase || _load_nuclideArcanistBase()).getLastProjectPath)(project);
        if (lastPath != null) {
          const otherWindow = yield searchOtherWindows(lastPath);
          if (otherWindow != null) {
            deepLinkService.sendDeepLink(otherWindow, 'open-arc', params);
            return;
          }
          // See if we had this project open previously, and try re-opening it.
          if (yield (0, (_tryReopenProject || _load_tryReopenProject()).default)(project, lastPath, remoteProjectsService)) {
            matches = yield (0, (_getMatchingProjects || _load_getMatchingProjects()).default)(project, [lastPath]);
          }
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
          var _ref3 = (0, _asyncToGenerator.default)(function* (directory) {
            const fsService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getFileSystemServiceByNuclideUri)(directory);
            return fsService.exists((_nuclideUri || _load_nuclideUri()).default.join((_nuclideUri || _load_nuclideUri()).default.getPath(directory), paths[0]));
          });

          return function (_x5) {
            return _ref3.apply(this, arguments);
          };
        })());
        if (cwd != null && existing.includes(cwd)) {
          match = cwd;
        } else if (existing[0]) {
          match = existing[0];
        } else if (cwd != null && matches.includes(cwd)) {
          match = cwd;
        }
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

  return function openArcDeepLink(_x2, _x3, _x4) {
    return _ref2.apply(this, arguments);
  };
})();

var _electron = require('electron');

var _nuclideArcanistBase;

function _load_nuclideArcanistBase() {
  return _nuclideArcanistBase = require('../../nuclide-arcanist-base');
}

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('nuclide-commons-atom/go-to-location');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _promise;

function _load_promise() {
  return _promise = require('nuclide-commons/promise');
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
 * @format
 */

if (!(_electron.remote != null)) {
  throw new Error('Invariant violation: "remote != null"');
}

function ensureArray(x) {
  return typeof x === 'string' ? [x] : x;
}