'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CheckboxExamples = undefined;

var _react = _interopRequireDefault(require('react'));

var _Block;

function _load_Block() {
  return _Block = require('./Block');
}

var _Checkbox;

function _load_Checkbox() {
  return _Checkbox = require('./Checkbox');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const NOOP = () => {}; /**
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

const CheckboxExample = () => _react.default.createElement(
  'div',
  null,
  _react.default.createElement(
    (_Block || _load_Block()).Block,
    null,
    _react.default.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
      checked: false,
      onClick: NOOP,
      onChange: NOOP,
      label: 'A Checkbox.'
    })
  ),
  _react.default.createElement(
    (_Block || _load_Block()).Block,
    null,
    _react.default.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
      onClick: NOOP,
      onChange: NOOP,
      checked: true,
      label: 'A checked Checkbox.'
    })
  ),
  _react.default.createElement(
    (_Block || _load_Block()).Block,
    null,
    _react.default.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
      onClick: NOOP,
      onChange: NOOP,
      disabled: true,
      checked: false,
      label: 'A disabled Checkbox.'
    })
  ),
  _react.default.createElement(
    (_Block || _load_Block()).Block,
    null,
    _react.default.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
      onClick: NOOP,
      onChange: NOOP,
      checked: true,
      disabled: true,
      label: 'A disabled, checked Checkbox.'
    })
  ),
  _react.default.createElement(
    (_Block || _load_Block()).Block,
    null,
    _react.default.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
      onClick: NOOP,
      onChange: NOOP,
      indeterminate: true,
      checked: false,
      label: 'An indeterminate Checkbox.'
    })
  )
);

const CheckboxExamples = exports.CheckboxExamples = {
  sectionName: 'Checkbox',
  description: '',
  examples: [{
    title: '',
    component: CheckboxExample
  }]
};