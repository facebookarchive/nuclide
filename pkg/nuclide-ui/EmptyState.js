"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EmptyState = undefined;

var _react = _interopRequireDefault(require("react"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class EmptyState extends _react.default.Component {

  render() {
    return _react.default.createElement(
      "div",
      { className: "nuclide-ui-empty-state-container" },
      _react.default.createElement(
        "div",
        { className: "nuclide-ui-empty-state-message" },
        _react.default.createElement(
          "h1",
          null,
          this.props.title
        ),
        this.props.message
      )
    );
  }
}
exports.EmptyState = EmptyState; /**
                                  * Copyright (c) 2015-present, Facebook, Inc.
                                  * All rights reserved.
                                  *
                                  * This source code is licensed under the license found in the LICENSE file in
                                  * the root directory of this source tree.
                                  *
                                  * 
                                  */