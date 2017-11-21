'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FragmentExamples = undefined;

var _react = _interopRequireWildcard(require('react'));

var _Fragment;

function _load_Fragment() {
  return _Fragment = _interopRequireDefault(require('./Fragment'));
}

var _Button;

function _load_Button() {
  return _Button = require('./Button');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const FragmentExample = () => _react.createElement(
  'div',
  null,
  _react.createElement(
    (_Fragment || _load_Fragment()).default,
    null,
    _react.createElement(
      'div',
      null,
      'Some text.'
    ),
    _react.createElement(
      'span',
      null,
      'Some other text.'
    )
  ),
  _react.createElement(
    (_Fragment || _load_Fragment()).default,
    null,
    _react.createElement(
      'div',
      null,
      'This text will be a sibling of the above text.'
    ),
    _react.createElement(
      (_Button || _load_Button()).Button,
      null,
      'Any component can go inside a Fragment'
    )
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

const FragmentExamples = exports.FragmentExamples = {
  sectionName: 'Fragment',
  description: 'Used to render multiple children without a parent container.',
  examples: [{
    title: 'Fragments',
    component: FragmentExample
  }]
};