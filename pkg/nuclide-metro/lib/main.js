"use strict";

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

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _DefaultMetroAtomService() {
  const data = require("./DefaultMetroAtomService");

  _DefaultMetroAtomService = function () {
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
  constructor(serializedState) {
    this._projectRootPath = new _RxMin.BehaviorSubject(null);
    this._metroAtomService = new (_DefaultMetroAtomService().DefaultMetroAtomService)(this._projectRootPath);
    this._disposables = new (_UniversalDisposable().default)(this._metroAtomService, atom.commands.add('atom-workspace', {
      // Ideally based on CWD, the commands can be disabled and the UI would explain why.
      'nuclide-metro:start': event => {
        const detail = event.detail || {};

        this._metroAtomService.start(detail.tunnelBehavior || 'ask_about_tunnel', detail.port, detail.extraArgs);
      },
      'nuclide-metro:stop': () => this._metroAtomService.stop(),
      'nuclide-metro:restart': () => this._metroAtomService.restart(),
      'nuclide-metro:reload-app': () => this._metroAtomService.reloadApp()
    }));
  }

  dispose() {
    this._disposables.dispose();
  }

  provideMetroAtomService() {
    return this._metroAtomService;
  }

  consumeCwdApi(api) {
    this._disposables.add(api.observeCwd(dir => {
      this._projectRootPath.next(dir);
    }));
  }

  consumeOutputService(api) {
    this._disposables.add(api.registerOutputProvider({
      id: 'Metro',
      messages: this._metroAtomService._logTailer.getMessages(),
      observeStatus: cb => this._metroAtomService.observeStatus(cb),
      start: () => {
        this._metroAtomService.start('ask_about_tunnel');
      },
      stop: () => {
        this._metroAtomService.stop();
      }
    }));
  }

}

(0, _createPackage().default)(module.exports, Activation);