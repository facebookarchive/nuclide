"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.consumeDatatipService = consumeDatatipService;
exports.deactivate = deactivate;

function _UnicodeDatatipManager() {
  const data = _interopRequireDefault(require("./UnicodeDatatipManager"));

  _UnicodeDatatipManager = function () {
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
let unicodeEscapesManager = null;

function activate(state) {
  unicodeEscapesManager = new (_UnicodeDatatipManager().default)();
}

function consumeDatatipService(service) {
  if (!(unicodeEscapesManager != null)) {
    throw new Error("Invariant violation: \"unicodeEscapesManager != null\"");
  }

  return unicodeEscapesManager.consumeDatatipService(service);
}

function deactivate() {
  if (!(unicodeEscapesManager != null)) {
    throw new Error("Invariant violation: \"unicodeEscapesManager != null\"");
  }

  unicodeEscapesManager.dispose();
  unicodeEscapesManager = null;
}