"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireDefault(require("react"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Component to entertain the user while he is waiting to hear back from the server.
 */
class IndeterminateProgressBar extends _react.default.Component {
  render() {
    return _react.default.createElement(
      "div",
      { className: "text-center padded" },
      _react.default.createElement("span", { className: "loading loading-spinner-medium inline-block" })
    );
  }
}
exports.default = IndeterminateProgressBar; /**
                                             * Copyright (c) 2015-present, Facebook, Inc.
                                             * All rights reserved.
                                             *
                                             * This source code is licensed under the license found in the LICENSE file in
                                             * the root directory of this source tree.
                                             *
                                             * 
                                             * @format
                                             */