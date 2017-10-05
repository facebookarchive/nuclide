'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ShellActivation = undefined;

var _ShellMessageManager;

function _load_ShellMessageManager() {
  return _ShellMessageManager = require('./ShellMessageManager');
}

class ShellActivation {

  constructor() {
    // TODO: Enable following when RN changes land. Don't forget to call dispose in `dispose()`!
    // this._disposables = new CompositeDisposable(
    //   atom.commands.add('atom-workspace', {
    //     'nuclide-react-native:reload-app': () => this._reload(),
    //   }),
    // );
    this._shellManager = null;
  }

  dispose() {}

  _reload() {
    if (this._shellManager == null) {
      this._shellManager = new (_ShellMessageManager || _load_ShellMessageManager()).ShellMessageManager();
    }
    const message = {
      version: 1,
      target: 'bridge',
      action: 'reload'
    };
    this._shellManager.send(message);
  }
}
exports.ShellActivation = ShellActivation; /**
                                            * Copyright (c) 2015-present, Facebook, Inc.
                                            * All rights reserved.
                                            *
                                            * This source code is licensed under the license found in the LICENSE file in
                                            * the root directory of this source tree.
                                            *
                                            * 
                                            * @format
                                            */