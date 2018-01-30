"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireWildcard(require("react"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Component to entertain the user while he is waiting to hear back from the server.
 */
class IndeterminateProgressBar extends _react.Component {
  render() {
    return _react.createElement(
      "div",
      { className: "text-center padded" },
      _react.createElement("span", { className: "loading loading-spinner-medium inline-block" })
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