"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ToggleExamples = void 0;

var React = _interopRequireWildcard(require("react"));

function _Block() {
  const data = require("../../modules/nuclide-commons-ui/Block");

  _Block = function () {
    return data;
  };

  return data;
}

function _Toggle() {
  const data = require("../../modules/nuclide-commons-ui/Toggle");

  _Toggle = function () {
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
const NOOP = () => {};

const ToggleExample = () => React.createElement("div", null, React.createElement(_Block().Block, null, React.createElement(_Toggle().Toggle, {
  toggled: false,
  onClick: NOOP,
  onChange: NOOP,
  label: "A Toggle."
})), React.createElement(_Block().Block, null, React.createElement(_Toggle().Toggle, {
  onClick: NOOP,
  onChange: NOOP,
  toggled: true,
  label: "A toggled Toggle."
})), React.createElement(_Block().Block, null, React.createElement(_Toggle().Toggle, {
  onClick: NOOP,
  onChange: NOOP,
  disabled: true,
  toggled: false,
  label: "A disabled Toggle."
})), React.createElement(_Block().Block, null, React.createElement(_Toggle().Toggle, {
  onClick: NOOP,
  onChange: NOOP,
  toggled: true,
  disabled: true,
  label: "A disabled, toggled Toggle."
})));

const ToggleExamples = {
  sectionName: 'Toggle',
  description: 'Toggle input for boolean values',
  examples: [{
    title: 'Toggle Input Example',
    component: ToggleExample
  }]
};
exports.ToggleExamples = ToggleExamples;