"use strict";

function _disablePackage() {
  const data = _interopRequireWildcard(require("../../commons-atom/disablePackage"));

  _disablePackage = function () {
    return data;
  };

  return data;
}

function _createPackage() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/createPackage"));

  _createPackage = function () {
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

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _ImageEditor() {
  const data = _interopRequireDefault(require("./ImageEditor"));

  _ImageEditor = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
    this._disposables = new (_UniversalDisposable().default)(atom.workspace.addOpener(openUri), // If you enable this package, we need to disable image-view.
    (0, _disablePackage().default)('image-view', {
      reason: _disablePackage().DisabledReason.REIMPLEMENTED
    }));
  }

  deserializeImageEditor(state) {
    return new (_ImageEditor().default)(state.filePath);
  }

  dispose() {
    this._disposables.dispose();
  }

}

(0, _createPackage().default)(module.exports, Activation);

function openUri(uri) {
  return _nuclideUri().default.looksLikeImageUri(uri) ? new (_ImageEditor().default)(uri) : null;
}