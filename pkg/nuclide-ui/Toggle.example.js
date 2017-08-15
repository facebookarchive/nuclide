'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ToggleExamples = undefined;

var _react = _interopRequireDefault(require('react'));

var _Block;

function _load_Block() {
  return _Block = require('nuclide-commons-ui/Block');
}

var _Toggle;

function _load_Toggle() {
  return _Toggle = require('./Toggle');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const NOOP = () => {}; /**
                        * Copyright (c) 2015-present, Facebook, Inc.
                        * All rights reserved.
                        *
                        * This source code is licensed under the license found in the LICENSE file in
                        * the root directory of this source tree.
                        *
                        * 
                        * @format
                        */

const ToggleExample = () => _react.default.createElement(
  'div',
  null,
  _react.default.createElement(
    (_Block || _load_Block()).Block,
    null,
    _react.default.createElement((_Toggle || _load_Toggle()).Toggle, {
      toggled: false,
      onClick: NOOP,
      onChange: NOOP,
      label: 'A Toggle.'
    })
  ),
  _react.default.createElement(
    (_Block || _load_Block()).Block,
    null,
    _react.default.createElement((_Toggle || _load_Toggle()).Toggle, {
      onClick: NOOP,
      onChange: NOOP,
      toggled: true,
      label: 'A toggled Toggle.'
    })
  ),
  _react.default.createElement(
    (_Block || _load_Block()).Block,
    null,
    _react.default.createElement((_Toggle || _load_Toggle()).Toggle, {
      onClick: NOOP,
      onChange: NOOP,
      disabled: true,
      toggled: false,
      label: 'A disabled Toggle.'
    })
  ),
  _react.default.createElement(
    (_Block || _load_Block()).Block,
    null,
    _react.default.createElement((_Toggle || _load_Toggle()).Toggle, {
      onClick: NOOP,
      onChange: NOOP,
      toggled: true,
      disabled: true,
      label: 'A disabled, toggled Toggle.'
    })
  )
);

const ToggleExamples = exports.ToggleExamples = {
  sectionName: 'Toggle',
  description: 'Toggle input for boolean values',
  examples: [{
    title: 'Toggle Input Example',
    component: ToggleExample
  }]
};