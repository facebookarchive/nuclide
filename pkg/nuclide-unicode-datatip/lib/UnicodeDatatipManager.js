'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _atom = require('atom');

var _UnescapedUnicodeDatatip;

function _load_UnescapedUnicodeDatatip() {
  return _UnescapedUnicodeDatatip = _interopRequireDefault(require('./UnescapedUnicodeDatatip'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let UnicodeDatatipManager = class UnicodeDatatipManager {

  constructor() {
    this._disposables = new _atom.CompositeDisposable();
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeDatatipService(service) {
    const datatipProvider = {
      datatip: (editor, position) => (0, (_UnescapedUnicodeDatatip || _load_UnescapedUnicodeDatatip()).default)(editor, position),
      validForScope: scope => true,
      providerName: 'nuclide-unicode-escapes',
      inclusionPriority: 1
    };

    service.addProvider(datatipProvider);
    this.datatipService = service;
    const disposable = new _atom.Disposable(() => {
      service.removeProvider(datatipProvider);
      this.datatipService = null;
    });
    this._disposables.add(disposable);
    return disposable;
  }
};
exports.default = UnicodeDatatipManager;
module.exports = exports['default'];