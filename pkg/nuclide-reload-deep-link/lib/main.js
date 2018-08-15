"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Activation = void 0;

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
class Activation {
  constructor() {
    this._disposables = new (_UniversalDisposable().default)();
  }

  consumeDeepLinkService(service) {
    const disposable = service.subscribeToPath('reload', params => {
      const reload = () => atom.commands.dispatch(atom.views.getView(atom.workspace), 'window:reload');

      if (atom.project.getPaths().length === 0) {
        reload();
      } else {
        const appName = typeof params.app === 'string' ? params.app : 'Another application';
        atom.notifications.addInfo(`${appName} asked Atom to reload.`, {
          detail: typeof params.reason === 'string' ? params.reason : undefined,
          dismissable: true,
          buttons: [{
            text: 'Reload',
            className: 'icon icon-zap',
            onDidClick: reload
          }]
        });
      }
    });

    this._disposables.add(disposable);

    return disposable;
  }

  dispose() {
    this._disposables.dispose();
  }

}

exports.Activation = Activation;
(0, _createPackage().default)(module.exports, Activation);