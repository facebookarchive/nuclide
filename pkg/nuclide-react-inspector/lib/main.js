"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;

function _viewableFromReactElement() {
  const data = require("../../commons-atom/viewableFromReactElement");

  _viewableFromReactElement = function () {
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

function _Inspector() {
  const data = _interopRequireWildcard(require("./ui/Inspector"));

  _Inspector = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _destroyItemWhere() {
  const data = require("../../../modules/nuclide-commons-atom/destroyItemWhere");

  _destroyItemWhere = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
let disposables = null;

function activate() {
  disposables = new (_UniversalDisposable().default)(registerCommandAndOpener());
}

function deactivate() {
  if (!(disposables != null)) {
    throw new Error("Invariant violation: \"disposables != null\"");
  }

  disposables.dispose();
  disposables = null;
}

function registerCommandAndOpener() {
  return new (_UniversalDisposable().default)(atom.workspace.addOpener(uri => {
    if (uri === _Inspector().WORKSPACE_VIEW_URI) {
      return (0, _viewableFromReactElement().viewableFromReactElement)(React.createElement(_Inspector().default, null));
    }
  }), () => (0, _destroyItemWhere().destroyItemWhere)(item => item instanceof _Inspector().default), atom.commands.add('atom-workspace', 'nuclide-react-inspector:toggle', () => {
    atom.workspace.toggle(_Inspector().WORKSPACE_VIEW_URI);
  }));
}