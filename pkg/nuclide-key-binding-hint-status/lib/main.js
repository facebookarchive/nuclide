"use strict";

var React = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

function _createPackage() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/createPackage"));

  _createPackage = function () {
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

function _KeyBindingHint() {
  const data = _interopRequireDefault(require("./KeyBindingHint"));

  _KeyBindingHint = function () {
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
 *  strict-local
 * @format
 */
const STATUS_BAR_PRIORITY = 500; // TODO: Allow the user to toggle this feature.

class Activation {
  constructor(state) {
    this._statusNode = document.createElement('div');

    this._statusNode.classList.add('inline-block', 'text');

    if (!this._statusNode) {
      throw new Error("Invariant violation: \"this._statusNode\"");
    }

    _reactDom.default.render(React.createElement(_KeyBindingHint().default, null), this._statusNode);

    this._disposables = new (_UniversalDisposable().default)(() => {
      _reactDom.default.unmountComponentAtNode(this._statusNode);

      this._statusNode = null;
    });
  }

  consumeStatusBar(statusBar) {
    const keyBindingStatusBar = statusBar.addLeftTile({
      item: this._statusNode,
      priority: STATUS_BAR_PRIORITY
    });

    this._disposables.add(() => {
      keyBindingStatusBar.destroy();
    });
  }

  dispose() {
    this._disposables.dispose();
  }

}

(0, _createPackage().default)(module.exports, Activation);