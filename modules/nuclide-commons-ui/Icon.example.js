'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IconExamples = undefined;

var _react = _interopRequireDefault(require('react'));

var _Block;

function _load_Block() {
  return _Block = require('./Block');
}

var _Icon;

function _load_Icon() {
  return _Icon = require('./Icon');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const IconExample = () => _react.default.createElement(
  'div',
  null,
  _react.default.createElement(
    (_Block || _load_Block()).Block,
    null,
    _react.default.createElement((_Icon || _load_Icon()).Icon, { icon: 'gift' }),
    _react.default.createElement((_Icon || _load_Icon()).Icon, { icon: 'heart' }),
    _react.default.createElement((_Icon || _load_Icon()).Icon, { icon: 'info' })
  )
); /**
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

const IconWithTextExample = () => _react.default.createElement(
  'div',
  null,
  _react.default.createElement(
    (_Block || _load_Block()).Block,
    null,
    _react.default.createElement(
      'div',
      null,
      _react.default.createElement(
        (_Icon || _load_Icon()).Icon,
        { icon: 'gift' },
        'gift'
      )
    ),
    _react.default.createElement(
      'div',
      null,
      _react.default.createElement(
        (_Icon || _load_Icon()).Icon,
        { icon: 'heart' },
        'heart'
      )
    ),
    _react.default.createElement(
      'div',
      null,
      _react.default.createElement(
        (_Icon || _load_Icon()).Icon,
        { icon: 'info' },
        'info'
      )
    )
  )
);

const IconExamples = exports.IconExamples = {
  sectionName: 'Icons',
  description: 'Octicons with optional text.',
  examples: [{
    title: 'Icons',
    component: IconExample
  }, {
    title: 'You can pass optional text as children.',
    component: IconWithTextExample
  }]
};