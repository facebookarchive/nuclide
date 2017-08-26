"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Block = undefined;

var _react = _interopRequireDefault(require("react"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** A Block. */
const Block = exports.Block = props => _react.default.createElement(
  "div",
  { className: "block" },
  props.children
); /**
    * Copyright (c) 2017-present, Facebook, Inc.
    * All rights reserved.
    *
    * This source code is licensed under the BSD-style license found in the
    * LICENSE file in the root directory of this source tree. An additional grant
    * of patent rights can be found in the PATENTS file in the same directory.
    *
    * 
    * @format
    */