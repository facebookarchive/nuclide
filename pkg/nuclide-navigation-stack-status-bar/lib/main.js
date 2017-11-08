'use strict';

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('nuclide-commons-atom/createPackage'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _StatusBar;

function _load_StatusBar() {
  return _StatusBar = require('./StatusBar');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Activation {

  constructor(state) {
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._statusBarSubject = new _rxjsBundlesRxMinJs.Subject();
    this._navigationStackSubject = new _rxjsBundlesRxMinJs.Subject();

    const serviceSubscription = _rxjsBundlesRxMinJs.Observable.combineLatest(this._statusBarSubject, this._navigationStackSubject).subscribe(([statusBar, stack]) => {
      this._disposables.add((0, (_StatusBar || _load_StatusBar()).consumeStatusBar)(statusBar, stack));
    });
    this._disposables.add(this._statusBarSubject, this._navigationStackSubject, serviceSubscription);
  }

  consumeNavigationStack(navigationStack) {
    this._navigationStackSubject.next(navigationStack);
    this._navigationStackSubject.complete();
    return this._disposables;
  }

  consumeStatusBar(statusBar) {
    this._statusBarSubject.next(statusBar);
    this._statusBarSubject.complete();
    return this._disposables;
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