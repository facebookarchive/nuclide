"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _UnescapedUnicodeDatatip() {
  const data = _interopRequireDefault(require("./UnescapedUnicodeDatatip"));

  _UnescapedUnicodeDatatip = function () {
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
class UnicodeDatatipManager {
  constructor() {
    this._disposables = new (_UniversalDisposable().default)();
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeDatatipService(service) {
    const datatipProvider = {
      datatip: (editor, position) => (0, _UnescapedUnicodeDatatip().default)(editor, position),
      providerName: 'nuclide-unicode-escapes',
      priority: 1
    };
    const disposable = service.addProvider(datatipProvider);

    this._disposables.add(disposable);

    return disposable;
  }

}

exports.default = UnicodeDatatipManager;