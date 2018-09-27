"use strict";

function _createPackage() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/createPackage"));

  _createPackage = function () {
    return data;
  };

  return data;
}

function _projects() {
  const data = require("../../../modules/nuclide-commons-atom/projects");

  _projects = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
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
 * 
 * @format
 */
class Activation {
  constructor(state) {
    this._disposables = new (_UniversalDisposable().default)((0, _projects().observeProjectPaths)(async projectPath => {
      if (_nuclideUri().default.isRemote(projectPath)) {
        return;
      }

      const realPath = await _fsPromise().default.realpath(projectPath);

      if (realPath !== projectPath) {
        atom.notifications.addWarning('You have mounted a non-canonical project path. ' + 'Nuclide only supports mounting canonical paths as local projects.<br />' + '<strong>Some Nuclide features such as Flow might not work properly.</strong>', {
          detail: `Mounted path: ${projectPath}\n \n ` + `Try re-mounting the canonical project path instead:\n${realPath}`
        });
      }
    }));
  }

  dispose() {
    this._disposables.dispose();
  }

}

(0, _createPackage().default)(module.exports, Activation);