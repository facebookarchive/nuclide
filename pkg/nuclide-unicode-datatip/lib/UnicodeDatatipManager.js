'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _atom = require('atom');

var _UnescapedUnicodeDatatip;

function _load_UnescapedUnicodeDatatip() {
  return _UnescapedUnicodeDatatip = _interopRequireDefault(require('./UnescapedUnicodeDatatip'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class UnicodeDatatipManager {

  constructor() {
    this._disposables = new _atom.CompositeDisposable();
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeDatatipService(service) {
    const datatipProvider = {
      datatip: (editor, position) => (0, (_UnescapedUnicodeDatatip || _load_UnescapedUnicodeDatatip()).default)(editor, position),
      providerName: 'nuclide-unicode-escapes',
      priority: 1
    };

    const disposable = service.addProvider(datatipProvider);
    this._disposables.add(disposable);
    return disposable;
  }
}
exports.default = UnicodeDatatipManager; /**
                                          * Copyright (c) 2015-present, Facebook, Inc.
                                          * All rights reserved.
                                          *
                                          * This source code is licensed under the license found in the LICENSE file in
                                          * the root directory of this source tree.
                                          *
                                          * 
                                          * @format
                                          */