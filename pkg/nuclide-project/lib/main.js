'use strict';

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('nuclide-commons-atom/createPackage'));
}

var _projects;

function _load_projects() {
  return _projects = require('nuclide-commons-atom/projects');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Activation {

  constructor(state) {
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default((0, (_projects || _load_projects()).observeProjectPaths)((() => {
      var _ref = (0, _asyncToGenerator.default)(function* (projectPath) {
        if ((_nuclideUri || _load_nuclideUri()).default.isRemote(projectPath)) {
          return;
        }
        const realPath = yield (_fsPromise || _load_fsPromise()).default.realpath(projectPath);
        if (realPath !== projectPath) {
          atom.notifications.addWarning('You have mounted a non-canonical project path. ' + 'Nuclide only supports mounting canonical paths as local projects.<br />' + '<strong>Some Nuclide features such as Flow might not work properly.</strong>', {
            dismissable: true,
            detail: `Mounted path: ${projectPath}\n \n ` + `Try re-mounting the canonical project path instead:\n${realPath}`
          });
        }
      });

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    })()));
  }

  dispose() {
    this._disposables.dispose();
  }
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);