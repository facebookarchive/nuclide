"use strict";

function _createPackage() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons-atom/createPackage"));

  _createPackage = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _BusySignalSingleton() {
  const data = _interopRequireDefault(require("./BusySignalSingleton"));

  _BusySignalSingleton = function () {
    return data;
  };

  return data;
}

function _MessageStore() {
  const data = require("./MessageStore");

  _MessageStore = function () {
    return data;
  };

  return data;
}

function _StatusBarTile() {
  const data = _interopRequireDefault(require("./StatusBarTile"));

  _StatusBarTile = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
class Activation {
  constructor() {
    this._messageStore = new (_MessageStore().MessageStore)();
    this._service = new (_BusySignalSingleton().default)(this._messageStore);
    this._disposables = new (_UniversalDisposable().default)(this._messageStore);
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeStatusBar(statusBar) {
    // Avoid retaining StatusBarTile by wrapping it.
    const disposable = new (_UniversalDisposable().default)(new (_StatusBarTile().default)(statusBar, this._messageStore.getMessageStream()));

    this._disposables.add(disposable);

    return disposable;
  }

  provideBusySignal() {
    return this._service;
  }

}

(0, _createPackage().default)(module.exports, Activation);