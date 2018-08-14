"use strict";

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
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

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _StatusBar() {
  const data = require("./StatusBar");

  _StatusBar = function () {
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
    this._disposables = new (_UniversalDisposable().default)();
    this._navigationStackSubject = new _RxMin.ReplaySubject(1);

    this._disposables.add(this._navigationStackSubject);
  }

  consumeNavigationStack(navigationStack) {
    this._navigationStackSubject.next(navigationStack);

    return new (_UniversalDisposable().default)(() => {
      this._navigationStackSubject.next(null);
    });
  }

  consumeStatusBar(statusBar) {
    const disposable = (0, _StatusBar().consumeStatusBar)(statusBar, this._navigationStackSubject);

    this._disposables.add(disposable);

    return new (_UniversalDisposable().default)(() => {
      disposable.dispose();

      this._disposables.remove(disposable);
    });
  }

  dispose() {
    this._disposables.dispose();
  }

}

(0, _createPackage().default)(module.exports, Activation);