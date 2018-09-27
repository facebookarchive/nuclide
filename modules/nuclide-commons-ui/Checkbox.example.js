"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CheckboxExamples = void 0;

var React = _interopRequireWildcard(require("react"));

function _Block() {
  const data = require("./Block");

  _Block = function () {
    return data;
  };

  return data;
}

function _Checkbox() {
  const data = require("./Checkbox");

  _Checkbox = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
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
const NOOP = () => {};

const CheckboxExample = () => React.createElement("div", null, React.createElement(_Block().Block, null, React.createElement(_Checkbox().Checkbox, {
  checked: false,
  onClick: NOOP,
  onChange: NOOP,
  label: "A Checkbox."
})), React.createElement(_Block().Block, null, React.createElement(_Checkbox().Checkbox, {
  onClick: NOOP,
  onChange: NOOP,
  checked: true,
  label: "A checked Checkbox."
})), React.createElement(_Block().Block, null, React.createElement(_Checkbox().Checkbox, {
  onClick: NOOP,
  onChange: NOOP,
  disabled: true,
  checked: false,
  label: "A disabled Checkbox."
})), React.createElement(_Block().Block, null, React.createElement(_Checkbox().Checkbox, {
  onClick: NOOP,
  onChange: NOOP,
  checked: true,
  disabled: true,
  label: "A disabled, checked Checkbox."
})), React.createElement(_Block().Block, null, React.createElement(_Checkbox().Checkbox, {
  onClick: NOOP,
  onChange: NOOP,
  indeterminate: true,
  checked: false,
  label: "An indeterminate Checkbox."
})));

const CheckboxExamples = {
  sectionName: 'Checkbox',
  description: '',
  examples: [{
    title: '',
    component: CheckboxExample
  }]
};
exports.CheckboxExamples = CheckboxExamples;