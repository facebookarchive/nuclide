'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
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

exports.default = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (projectId, lastPath, remoteProjectsService) {
    const response = yield new Promise(function (resolve) {
      const notification = atom.notifications.addInfo(`Project \`${projectId}\` not open`, {
        description: `You tried to open a file in the \`${projectId}\` project, but it doesn't ` + 'seem to be in your open projects.<br />' + `You last had it open at \`${(_nuclideUri || _load_nuclideUri()).default.nuclideUriToDisplayString(lastPath)}\`.<br />` + 'Would you like to try re-opening it?',
        dismissable: true,
        buttons: [{
          className: 'icon icon-file-add',
          onDidClick: function () {
            resolve(true);
            notification.dismiss();
          },
          text: 'Open Project'
        }, {
          onDidClick: function () {
            resolve(false);
            notification.dismiss();
          },
          text: 'Cancel'
        }]
      });
      const disposable = notification.onDidDismiss(function () {
        resolve(false);
        disposable.dispose();
      });
    });
    if (!response) {
      return null;
    }

    const { hostname, path } = (_nuclideUri || _load_nuclideUri()).default.parse(lastPath);
    if (hostname == null) {
      const directoryCount = atom.project.getDirectories().length;
      atom.project.addPath(path);
      // Hacky way of checking that the project was successfully added.
      // Atom will not add the path if it doesn't exist.
      return atom.project.getDirectories().length !== directoryCount ? path : null;
    }

    if (remoteProjectsService != null) {
      const connection = yield remoteProjectsService.createRemoteConnection({
        host: hostname,
        cwd: path,
        displayTitle: ''
      });
      if (connection != null) {
        return connection.getUriForInitialWorkingDirectory();
      }
    }

    return null;
  });

  function tryReopenProject(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  }

  return tryReopenProject;
})();