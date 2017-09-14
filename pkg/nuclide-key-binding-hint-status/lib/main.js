'use strict';

var _react = _interopRequireWildcard(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('nuclide-commons-atom/createPackage'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _KeyBindingHint;

function _load_KeyBindingHint() {
  return _KeyBindingHint = _interopRequireDefault(require('./KeyBindingHint'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

const STATUS_BAR_PRIORITY = 500;

// TODO: Allow the user to toggle this feature.


class Activation {

  constructor(state) {
    this._statusNode = document.createElement('div');
    this._statusNode.classList.add('inline-block', 'text');

    _reactDom.default.render(_react.createElement((_KeyBindingHint || _load_KeyBindingHint()).default, null), this._statusNode);

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
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

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);