'use strict';var _createPackage;













function _load_createPackage() {return _createPackage = _interopRequireDefault(require('../../../../nuclide-commons-atom/createPackage'));}var _UniversalDisposable;
function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('../../../../nuclide-commons/UniversalDisposable'));}var _BusySignalSingleton;
function _load_BusySignalSingleton() {return _BusySignalSingleton = _interopRequireDefault(require('./BusySignalSingleton'));}var _MessageStore;
function _load_MessageStore() {return _MessageStore = require('./MessageStore');}var _StatusBarTile;
function _load_StatusBarTile() {return _StatusBarTile = _interopRequireDefault(require('./StatusBarTile'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} /**
                                                                                                                                                                                                           * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                           * All rights reserved.
                                                                                                                                                                                                           *
                                                                                                                                                                                                           * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                           * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                           * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                           *
                                                                                                                                                                                                           *  strict-local
                                                                                                                                                                                                           * @format
                                                                                                                                                                                                           */class Activation {constructor() {this._messageStore = new (_MessageStore || _load_MessageStore()).MessageStore();this._service = new (_BusySignalSingleton || _load_BusySignalSingleton()).default(this._messageStore);this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(this._messageStore);
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeStatusBar(statusBar) {
    // Avoid retaining StatusBarTile by wrapping it.
    const disposable = new (_UniversalDisposable || _load_UniversalDisposable()).default(
    new (_StatusBarTile || _load_StatusBarTile()).default(statusBar, this._messageStore.getMessageStream()));

    this._disposables.add(disposable);
    return disposable;
  }

  provideBusySignal() {
    return this._service;
  }}


(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);