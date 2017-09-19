'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ToggleExamples = undefined;

var _react = _interopRequireWildcard(require('react'));

var _Block;

function _load_Block() {
  return _Block = require('nuclide-commons-ui/Block');
}

var _Toggle;

function _load_Toggle() {
  return _Toggle = require('./Toggle');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

const ToggleExample = () => _react.createElement(
  'div',
  null,
  _react.createElement(
    (_Block || _load_Block()).Block,
    null,
    _react.createElement((_Toggle || _load_Toggle()).Toggle, {
      toggled: false,
      onClick: NOOP,
      onChange: NOOP,
      label: 'A Toggle.'
    })
  ),
  _react.createElement(
    (_Block || _load_Block()).Block,
    null,
    _react.createElement((_Toggle || _load_Toggle()).Toggle, {
      onClick: NOOP,
      onChange: NOOP,
      toggled: true,
      label: 'A toggled Toggle.'
    })
  ),
  _react.createElement(
    (_Block || _load_Block()).Block,
    null,
    _react.createElement((_Toggle || _load_Toggle()).Toggle, {
      onClick: NOOP,
      onChange: NOOP,
      disabled: true,
      toggled: false,
      label: 'A disabled Toggle.'
    })
  ),
  _react.createElement(
    (_Block || _load_Block()).Block,
    null,
    _react.createElement((_Toggle || _load_Toggle()).Toggle, {
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