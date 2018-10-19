"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Keybinding;

var _react = _interopRequireDefault(require("react"));

function _humanizeKeystroke() {
  const data = _interopRequireDefault(require("../nuclide-commons/humanizeKeystroke"));

  _humanizeKeystroke = function () {
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
 *  strict
 * @format
 */
function Keybinding({
  keystrokes
}) {
  return _react.default.createElement("kbd", {
    className: "key-binding"
  }, (0, _humanizeKeystroke().default)(keystrokes, process.platform));
}