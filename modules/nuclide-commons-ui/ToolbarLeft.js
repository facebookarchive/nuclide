"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ToolbarLeft = undefined;

var _react = _interopRequireDefault(require("react"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ToolbarLeft = exports.ToolbarLeft = props => {
  return _react.default.createElement(
    "div",
    { className: "nuclide-ui-toolbar__left" },
    props.children
  );
}; /**
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