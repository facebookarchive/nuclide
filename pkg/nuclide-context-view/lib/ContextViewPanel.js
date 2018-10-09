"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ContextViewPanel = void 0;

var React = _interopRequireWildcard(require("react"));

function _Icon() {
  const data = require("../../../modules/nuclide-commons-ui/Icon");

  _Icon = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
const ContextViewPanel = props => {
  return React.createElement("div", {
    className: "nuclide-context-view-content padded"
  }, React.createElement("p", null, props.locked ? React.createElement(_Icon().Icon, {
    icon: "lock"
  }) : null, "Click on a symbol (variable, function, type, etc) in an open file to see more information about it below."), props.children);
};

exports.ContextViewPanel = ContextViewPanel;