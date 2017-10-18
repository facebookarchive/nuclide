'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AnimatedEllipsisExamples = undefined;

var _react = _interopRequireWildcard(require('react'));

var _Block;

function _load_Block() {
  return _Block = require('nuclide-commons-ui/Block');
}

var _AnimatedEllipsis;

function _load_AnimatedEllipsis() {
  return _AnimatedEllipsis = _interopRequireDefault(require('./AnimatedEllipsis'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const BasicExample = () => _react.createElement(
  'div',
  null,
  _react.createElement(
    (_Block || _load_Block()).Block,
    null,
    'Still waiting',
    _react.createElement((_AnimatedEllipsis || _load_AnimatedEllipsis()).default, null)
  )
); /**
    * Copyright (c) 2015-present, Facebook, Inc.
    * All rights reserved.
    *
    * This source code is licensed under the license found in the LICENSE file in
    * the root directory of this source tree.
    *
    * 
    * @format
    */

const AnimatedEllipsisExamples = exports.AnimatedEllipsisExamples = {
  sectionName: 'AnimatedEllipsis',
  description: 'AnimatedEllipsis is an ellipsis (...) that animated automatically while preserving constant width.',
  examples: [{
    title: 'Example',
    component: BasicExample
  }]
};